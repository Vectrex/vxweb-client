import { computed, ref } from 'vue'
import { promisedXhr } from '@/util/promisedXhr'

export function useVxUpload (defaultOptions = {}) {

    const loading = ref(false)
    const progress = ref({ loaded: 0, total: 0, percent: 0, fileName: '' })
    const error = ref(null)
    const response = ref(null)

    let abortController = null

    const cancel = () => abortController?.abort()

    const reset = () => {
        progress.value = { loaded: 0, total: 0, percent: 0, fileName: '' }
        error.value = null
        response.value = null
    }

    const upload = async (options = {}) => {
        reset()
        loading.value = true

        const mergedOptions = { ...defaultOptions, ...options }
        const file = mergedOptions.file || null
        const fileName = file?.name || mergedOptions.fileName || ''
        abortController = new AbortController()

        const externalSignal = mergedOptions.signal
        const onExternalAbort = () => abortController.abort()
        progress.value.fileName = fileName

        try {
            if (externalSignal) {
                if (externalSignal.aborted) {
                    abortController.abort()
                } else {
                    externalSignal.addEventListener('abort', onExternalAbort, { once: true })
                }
            }
            response.value = await promisedXhr({
                path: mergedOptions.path,
                method: mergedOptions.method || 'POST',
                headers: mergedOptions.headers || {},
                body: mergedOptions.body ?? file ?? null,
                timeout: mergedOptions.timeout ?? null,
                signal: abortController.signal,
                responseType: mergedOptions.responseType || 'auto',
                onUploadProgress: e => {
                    const total = e.total || 0
                    const loaded = e.loaded || 0

                    progress.value.loaded = loaded
                    progress.value.total = total
                    progress.value.percent = total ? Math.round((loaded / total) * 100) : 0

                    if (typeof mergedOptions.onProgress === 'function') {
                        mergedOptions.onProgress({
                            ...e,
                            loaded,
                            total,
                            percent: progress.value.percent,
                            fileName,
                        })
                    }
                }
            })

            return response.value
        } catch (err) {
            error.value = err
            throw err
        } finally {
            if (externalSignal) {
                externalSignal.removeEventListener('abort', onExternalAbort)
            }
            loading.value = false
            abortController = null
        }
    }
    return {
        upload,
        cancel,
        reset,
        loading: computed(() => loading.value),
        progress: computed(() => progress.value),
        error: computed(() => error.value),
        response: computed(() => response.value)
    }
}
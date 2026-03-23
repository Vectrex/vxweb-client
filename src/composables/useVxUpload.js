import { computed, ref } from 'vue'
import { promisedXhr } from '@/util/promisedXhr'

export function useVxUpload (defaultOptions = {}) {

    const loading = ref(false)
    const progress = ref({ loaded: 0, total: 0, percent: 0, fileName: '' })
    const error = ref(null)
    const response = ref(null)

    let currentRequest = null
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

        const merged = { ...defaultOptions, ...options }
        const file = merged.file || null
        const fileName = file?.name || merged.fileName || ''
        abortController = new AbortController()

        const externalSignal = merged.signal
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
            currentRequest = promisedXhr({
                path: merged.path,
                method: merged.method || 'POST',
                headers: merged.headers || {},
                body: merged.body ?? file ?? null,
                timeout: merged.timeout ?? null,
                signal: abortController.signal,
                responseType: merged.responseType || 'auto',
                onUploadProgress: e => {
                    const total = e.total || 0
                    const loaded = e.loaded || 0

                    progress.value.loaded = loaded
                    progress.value.total = total
                    progress.value.percent = total ? Math.round((loaded / total) * 100) : 0

                    if (typeof merged.onProgress === 'function') {
                        merged.onProgress({
                            ...e,
                            loaded,
                            total,
                            percent: progress.value.percent,
                            fileName,
                        })
                    }
                }
            })

            response.value = await currentRequest
            return response.value
        } catch (err) {
            error.value = err
            throw err
        } finally {
            if (externalSignal) {
                externalSignal.removeEventListener('abort', onExternalAbort)
            }
            loading.value = false
            currentRequest = null
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

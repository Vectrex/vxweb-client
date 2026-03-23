const isPlainObject = value => Object.prototype.toString.call(value) === '[object Object]'

const toError = (xhr, fallbackMessage) => ({
    status: xhr?.status ?? 0,
    statusText: xhr?.statusText ?? fallbackMessage,
    responseText: xhr?.responseText ?? '',
})

const parseResponse = (xhr, responseType) => {
    if (responseType === 'text') return xhr.responseText
    if (!xhr.responseText) return null
    if (responseType === 'json') return JSON.parse(xhr.responseText)

    try {
        return JSON.parse(xhr.responseText)
    } catch {
        return xhr.responseText
    }
}

export const promisedXhr = ({
    path,
    method = 'GET',
    headers = {},
    body = null,
    timeout = null,
    onUploadProgress = () => {},
    signal = null,
    responseType = 'auto',
} = {}) => {
    if (!path) return Promise.reject(new Error('`path` is required.'))

    const xhr = new XMLHttpRequest()
    const requestHeaders = { ...headers }

    const headerKeys = Object.keys(requestHeaders).map(key => key.toLowerCase())
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null
    if (csrfToken && !headerKeys.includes('x-csrf-token')) requestHeaders['X-CSRF-Token'] = csrfToken
    if (
        body != null &&
        !headerKeys.includes('content-type') &&
        !(body instanceof FormData) &&
        !(body instanceof Blob) &&
        !(body instanceof ArrayBuffer) &&
        !ArrayBuffer.isView(body)
    ) requestHeaders['Content-Type'] = isPlainObject(body) ? 'application/json' : 'application/x-www-form-urlencoded'

    const promise = new Promise((resolve, reject) => {
        let settled = false

        const cleanup = () => {
            xhr.onreadystatechange = null
            xhr.onerror = null
            xhr.onabort = null
            xhr.ontimeout = null
            xhr.onload = null
            xhr.upload.onprogress = null
            if (signal) signal.removeEventListener('abort', onSignalAbort)
        }

        const settleResolve = value => {
            if (settled) return
            settled = true
            cleanup()
            resolve(value)
        }

        const settleReject = error => {
            if (settled) return
            settled = true
            cleanup()
            reject(error)
        }

        const onSignalAbort = () => {
            xhr.abort()
            settleReject({ status: 499, statusText: 'Request cancelled.', responseText: '' })
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    settleResolve(parseResponse(xhr, responseType))
                } catch (error) {
                    settleReject({ status: xhr.status,
                        statusText: 'Failed to parse response.',
                        responseText: xhr.responseText,
                        cause: error,
                    })
                }
            } else {
                settleReject(toError(xhr, 'Request failed.'))
            }
        }

        xhr.onerror = () => settleReject(toError(xhr, 'Network error.'))
        xhr.onabort = () => settleReject({ status: 499, statusText: 'Request cancelled.', responseText: '' })
        xhr.ontimeout = () => settleReject({ status: 408, statusText: 'Request timeout.', responseText: '' })
        xhr.upload.onprogress = onUploadProgress
        xhr.timeout = timeout

        if (signal) {
            if (signal.aborted) {
                onSignalAbort()
                return
            }
            signal.addEventListener('abort', onSignalAbort, { once: true })
        }

        xhr.open(method, path, true)
        Object.entries(requestHeaders).forEach(([key, value]) => { if (value != null) xhr.setRequestHeader(key, value) })

        if (isPlainObject(body) && requestHeaders['Content-Type'] === 'application/json') {
            xhr.send(JSON.stringify(body))
            return
        }
        xhr.send(body)
    })

    promise.cancel = () => xhr.abort()
    return promise
}
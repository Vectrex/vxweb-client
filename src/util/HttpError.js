export class HttpError extends Error {
    constructor(response, data = null, cause = null) {
        super(data?.message || `${response.status} ${response.statusText || 'HTTP error'}`)
        this.name = 'HttpError'
        this.status = response.status
        this.statusText = response.statusText
        this.data = data
        this.response = response
        this.cause = cause
    }
}

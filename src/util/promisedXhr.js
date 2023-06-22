const promisedXhr = async (
    path,
    method = 'GET',
    headers = {},
    payload = null,
    timeout = null,
    progressCallback = null,
    cancelToken = null
) => {
    const baseUrl = import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/')
    const headerKeys = Object.keys(headers).map(key => key.toLowerCase());

    if (headerKeys.indexOf('x-csrf-token') === -1 && document.querySelector('meta[name="csrf-token"]')) {
        headers['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    }
    if (headerKeys.indexOf('content-type') === -1) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const bearerToken = sessionStorage.getItem("bearerToken");

    if (bearerToken) {
        headers['Authorization'] = 'Bearer ' + bearerToken;
    }
    const xhr = new XMLHttpRequest();

    const xhrPromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText
                    });
                }
            }
        };

        xhr.upload.onprogress = progressCallback || null;

        if(cancelToken) {
            cancelToken.cancel = () =>  { xhr.abort(); reject({ status: 499, statusText: 'Request cancelled.' }); };
        }

        xhr.open(method, baseUrl + path, true);
        Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

        if (timeout) {
            xhr.timeout = timeout;
            xhr.ontimeout = () => {reject({ status: 408, statusText: 'Request timeout.' });};
        }

        xhr.send(payload);
    });

    xhrPromise.cancel = () => xhr.abort();

    return xhrPromise;
}

export {
    promisedXhr
}
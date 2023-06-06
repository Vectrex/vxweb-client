const getSort = (uniqueId = '') => {
    console.log(window.location)
    const ls = window.localStorage.getItem(`${window.location.href}/${uniqueId}-sort`)
    return ls ? JSON.parse(ls) : {}
}
const storeSort = (e, uniqueId = '') => window.localStorage.setItem(`${window.location.href}/${uniqueId}-sort`, JSON.stringify(e))

export {
    getSort, storeSort
}
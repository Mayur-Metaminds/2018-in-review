export default function progressPromise(promises, progressCallback) {
    let d = 0
    progressCallback(0, promises.length)
    for (const p of promises) {
        p.then(() => {
            d++
            progressCallback(d, promises.length)
        })
    }
    return Promise.all(promises)
}
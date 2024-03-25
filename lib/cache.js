var cachestore = {};

function get(req) {
    console.log("GET")
    //console.log(req)
}

function put(req,res) {
    console.log("PUT")
    
    //cache key is a combination of the URL, Headers, method and body.
    let url = req.url
    let headers = req.headers
    let method = req.method
    let body = req.body

    console.log(url, headers, method, body)

}

function check(req) {
    console.log("CHECK")
    //console.log(req)
}

module.exports = {
    get: get,
    put: put,
    check: check
}
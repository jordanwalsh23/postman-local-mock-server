const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3555;

var options = {
    port: PORT,
    debug: true,
    collection: JSON.parse(fs.readFileSync('./test/collections/cache-tests.json', 'utf8'))
}

let server;

describe('Different Request Types', () => {
    beforeEach(() => {
        server = new PostmanLocalMockServer(options)
    })

    it('Tests names do not match without cache.', async () => {
        server.start() //no cache

        let name = "";
        return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            .then(res => {
                name = res.data.args.name;
                console.log(name)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get?name=stewart`)
            })
            .then(res => {
                console.log(res.data.args.name)
                assert(name != res.data.args.name)
                server.stop();
            })

    })

    it('Tests names do match when cache is used', async () => {
        server.start({
            cache: true,
            cacheOptions: {
                debug: true,
                defaultDuration: "500ms"
            }
        })
        let name = "";
        return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            .then(res => {
                name = res.data.args.name;
                console.log(name)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            })
            .then(res => {
                console.log(res.data.args.name)
                assert(name === res.data.args.name)
                server.stop();
            })
    })

    it('Tests path parameters are cached correctly', async () => {
        server.start({
            cache: true,
            cacheOptions: {
                debug: true,
                defaultDuration: "500ms"
            }
        })
        return await axios.get(`http://localhost:${PORT}/get/1`)
            .then(res => {
                assert(res.data.id == 1)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get/2`)
            })
            .then(res => {
                assert(res.data.id == 2)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get/1`)
            })
            .then(res => {
                assert(res.data.id == 1)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get/2`)
            })
            .then(res => {
                assert(res.data.id == 2)
                server.stop();
            })

    })

    it('Tests post requests are not cached', async () => {
        server.start({
            cache: true,
            cacheOptions: {
                debug: true,
                defaultDuration: "500ms"
            }
        })

        let randomCity = "";
        return await axios.post(`http://localhost:${PORT}/post`, {
            status: true
        })
            .then(res => res.data.data)
            .then(data => {
                console.log(data)
                assert(data.random)
                randomCity = data.random;
            })
            .then(async () => {
                return await axios.post(`http://localhost:${PORT}/post`, {
                    status: true
                })
            })
            .then(res => res.data.data)
            .then(data => {
                assert(randomCity != data.random)
                server.stop();
            })

    })

    it('tests for cache precedence', async () => {
        server.start({
            cache: true,
            cacheOptions: {
                debug: true,
                defaultDuration: "500ms"
            }
        })

        return await axios.get(`http://localhost:${PORT}/get/1`, {
            headers: {
                'x-mock-response-name': 'Get By Id 1'
            }
        })
            .then(res => {
                assert(res.data.id == 1)
                //value is cached.
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get/1`, {
                    headers: {
                        'x-mock-response-name': 'Get By Id 2'
                    }
                })
            })
            .then(res => {
                assert(res.data.id == 1)
                server.stop();
            })


    })

    it('Tests cache is cleared', async () => {
        console.log("\n\nStarting server with cache\n\n");
        server.start({
            cache: true,
            cacheOptions: {
                debug: true,
                defaultDuration: "5000ms"
            }
        })
        let name = "";
        return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            .then(res => {
                name = res.data.args.name;
                console.log(name)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            })
            .then(res => {
                console.log("Orig name: " + name + " Cached name: " + res.data.args.name)
                assert(name === res.data.args.name)
                //cache is working - let's clear it
                console.log("Deleting cache")
            })
            .then(async () => {
                return await axios.delete(`http://localhost:${PORT}/cache`)
            })
            .then(async (cacheClearResult) => {
                console.log(cacheClearResult ? cacheClearResult.data : false)
                return await axios.get(`http://localhost:${PORT}/get?name=carol`)
            })
            .then(res => {
                console.log("Orig name: " + name + " New name: " + res.data.args.name)
                assert(name !== res.data.args.name)
                //cache is cleared so the names shouldn't match
            })
    })

    afterEach(() => {
        server.stop()
    })


})
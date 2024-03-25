const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3555

let server;

describe('Different Request Types', () => {
    before(() => {
        let collection = JSON.parse(
            fs.readFileSync('./test/collections/cache-tests.json', 'utf8')
        )
        server = new PostmanLocalMockServer(PORT, collection)
        
    })

    it('Tests names do not match without cache.', async () => {
        server.start() //no cache

        let name = "";
        return await axios.get(`http://localhost:${PORT}/get?name={{$randomFirstName}}`)
            .then(res => {
                name = res.data.args.name;
                console.log(name)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get?name={{$randomFirstName}}`)
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
        return await axios.get(`http://localhost:${PORT}/get?name={{$randomFirstName}}`)
            .then(res => {
                name = res.data.args.name;
                console.log(name)
            })
            .then(async () => {
                return await axios.get(`http://localhost:${PORT}/get?name={{$randomFirstName}}`)
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


})
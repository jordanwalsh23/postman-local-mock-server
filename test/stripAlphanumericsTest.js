const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3558;

var options = {
    port: PORT,
    debug: true
}

let server

describe('Strip Alphanumerics Tests', () => {
    beforeEach(() => {
        options.collection = JSON.parse(
            fs.readFileSync('./test/collections/strip-alpha-tests.json', 'utf8')
        )

        server = new PostmanLocalMockServer(options)
        server.start()
    })

    describe('Default request tests', () => {
        it('Should match with a different numeric ID', async () => {
            return await axios.get(`http://localhost:${PORT}/users/123`).then(res => {
                assert(res.data.name === '456')
            })
        })

        it('Should match with a different UUID', async () => {
            return await axios.get(`http://localhost:${PORT}/users/13debaf5-53ed-4a85-8ee3-d47258ce1078`).then(res => {
                assert(res.data.name === '456')
            })
        })

        //string of 300 chars
        let largestring = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

        it('Should match with a large string', async () => {
            return await axios.get(`http://localhost:${PORT}/users/${largestring}`).then(res => {
                assert(res.data.name === '456')
            })
        })

        it('Should match with a different numeric ID and a trailing slash', async () => {
            return await axios.get(`http://localhost:${PORT}/users/123/`).then(res => {
                assert(res.data.name === '456')
            })
        })

        it('Should not match with a text ID', async () => {
            return await axios.get(`http://localhost:${PORT}/users/carol`)
                .then(res => {
                    //This should not work
                    assert(1 == 2);
                })
                .catch(err => {
                    assert(err.response.status === 404)
                })
        })
    })

    afterEach(() => {
        server.stop()
    })
});
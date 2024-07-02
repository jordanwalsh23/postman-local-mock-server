const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3000;

var options = {
    port: PORT,
    debug: true
}

let server

describe('Postman Local Mock Folder Tests', () => {
    beforeEach(() => {
        options.collection = JSON.parse(
            fs.readFileSync('./test/collections/folder-tests.json', 'utf8')
        )

        server = new PostmanLocalMockServer(options)
        server.start()
    })

    describe('No folder tests', () => {
        it('Default GET response test.', async () => {
            return await axios.get(`http://localhost:${PORT}/get`).then(res => {
                assert(res.data.args.name === 'Jordan')
            })
        })

        it('Folder 1 response test.', async () => {
            return await axios.get(`http://localhost:${PORT}/get/folder1`).then(res => {
                assert(res.data.args.name === 'Jordan')
            })
        })

        it('Folder 2 response test.', async () => {
            return await axios.get(`http://localhost:${PORT}/get/folder2`).then(res => {
                assert(res.data.args.name === 'Jordan')
            })
        })
    })

    afterEach(() => {
        server.stop()
    })
})

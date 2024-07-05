const fs = require('fs')
const PostmanLocalMockServer = require('../index.js')
const axios = require('axios').default
const assert = require('assert')

const PORT = 3561;

var options = {
    port: PORT,
    debug: true
}

let server

describe('Document Distance Tests', () => {
    beforeEach(() => {
        options.collection = JSON.parse(
            fs.readFileSync('./test/collections/document-distance-tests.json', 'utf8')
        )

        server = new PostmanLocalMockServer(options)
        server.start()
    })

    it('Perfect Match', async () => {
        return await axios
            .get(
                `http://localhost:${PORT}/documents/my-document`
            )
            .then(res => res.data)
            .then(res => {
                assert(res.status === "perfect match")
            })
    })

    it('Near Match', async () => {
        return await axios
            .get(
                `http://localhost:${PORT}/employees/caroline`
            )
            .then(res => res.data)
            .then(res => {
                assert(res.status === "near match")
            })
    })


    afterEach(() => {
        server.stop()
    })
});
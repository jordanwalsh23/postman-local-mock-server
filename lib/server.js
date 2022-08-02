'use strict'
const express = require('express')
const app = express()
const fs = require('fs')

class PostmanMockServer {
  constructor (port, collection) {
    this.port = port
    this.collection = collection
    this.instance = null
  }

  start () {
    let requests = []
    findRequests(this.collection.collection.item, requests)

    let dynamicApiRouter = express.Router()

    for (var item of requests) {
      let methodPath = ''
      if (item.request.url && item.request.url.path) {
        methodPath = `${item.request.url.path.join('/')}`

        if (!methodPath.startsWith('/')) {
          methodPath = `/${methodPath}`
        }
      }

      dynamicApiRouter.all(methodPath, (req, res) => {
        //This callback is invoked outside of the parent 'for' loop, so the item object is not available here.
        let responseSent = false
        let potentialItems = []

        for (let item of requests) {
          let currentPath = ''
          if (item.request.url && item.request.url.path) {
            currentPath = `^${item.request.url.path.join('/')}$`
          }

          if (currentPath.indexOf(':') > -1) {
            //There are parameters in this path that we need to accommodate.
            currentPath = currentPath.replace(/:[^\/]+/g, '.+$')
          }

          if (
            item.request.method.toUpperCase() === req.method &&
            req.path.match(currentPath)
          ) {
            potentialItems.push(item)
          }
        }

        for (let item of potentialItems) {

          //We've got a request.  Now we need to figure out which response to send back.
          if (!item.response || item.response.length === 0) {
            continue
          }

          //Case 1: x-response-mock-name header is set
          if (req.headers['x-mock-response-name']) {
            
            //iterate through item.responses.members and find the one with the name.
            let response = item.response.find(response => {
              return response.name === req.headers['x-mock-response-name']
            })

            if (response) {
              //The path matches, and we've got a mock response with the correct name. Send it back.
              res.status(response.code)
              res.json(JSON.parse(response.body))
              responseSent = true
              break
            }
          }
        }

        if(!responseSent) {

          for (let item of potentialItems) {

            //Case 2: Default Case: let's try and match on the method and path.
            let currentPath = req.path

            let response = item.response.find(response => {
              let thisResponsePath = `${response.originalRequest.url.path.join(
                '/'
              )}`

              if (thisResponsePath.indexOf(':') > -1) {
                //There are parameters in this response path that we need to accommodate.
                thisResponsePath = thisResponsePath.replace(/:[^\/]+/g, '.+')
              }

              return (
                response.originalRequest.method == req.method &&
                currentPath.match(thisResponsePath)
              )
            })

            if (response) {
              res.status(response.code)
              res.json(JSON.parse(response.body))
              responseSent = true
              break
            }
          }
        }

        if (!responseSent)
          res.status(500).send('Error processing mock server request.')
      })
    }

    app.use(dynamicApiRouter)

    this.instance = app.listen(this.port, err => {
      if (err) {
        console.log(err)
      } else {
        console.log('Server started on port ' + this.port)
      }
    })
  }

  stop () {
    this.instance ? this.instance.close() : false
  }
}

function findRequests (items, requests) {
  if (items && items.length && items.length > 0) {
    for (let item of items) {
      if (item.item) {
        findRequests(item.item, requests)
      } else {
        requests.push(item)
      }
    }
  }
}

module.exports = PostmanMockServer

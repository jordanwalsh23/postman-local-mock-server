'use strict'
const express = require('express')
const app = express()

class PostmanMockServer {
  constructor (port, collection) {
    this.port = port
    this.collection = collection
    this.instance = null
  }

  start () {

    let routes = [];

    if(!this.collection) {
      throw new Error("Collection is not set. Please set the collection before starting the server.");
    }

    if(this.collection && this.collection.info) {
      this.collection = {
        collection: this.collection
      }
    }

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

      routes.push(item.request.method + " " + methodPath)

      dynamicApiRouter.all(methodPath, (req, res) => {
        //This callback is invoked outside of the parent 'for' loop, so the item object is not available here.
        let responseSent = false
        let potentialItems = []

        let requests = []
        findRequests(this.collection.collection.item, requests)

        for (let item of requests) {

          let currentPath = ''
          if (item.request.url && item.request.url.path) {
            currentPath = `${item.request.url.path.join('/')}$`
          }

          if(currentPath.charAt(0) != "/"){
            currentPath = "^/" + currentPath
          } else {
            currentPath = "^" + currentPath
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

          //Look through the responses on this request and see if we can get a match.
          let response = item.response.find(response => {
            
            //Case 1: x-response-mock-name header is set
            if (req.headers['x-mock-response-name']) {
              return response.name == req.headers['x-mock-response-name']
            }

            //Case 2: x-response-mock-id header is set
            if (req.headers['x-mock-response-id']) {
              return response.id == req.headers['x-mock-response-id']
            }

            //Case 3: x-response-mock-code header is set
            if (req.headers['x-mock-response-code']) {
              return response.code == req.headers['x-mock-response-code']
            }

            //Case 4: Default Case: let's try and match on the method, path and headers.
            let currentPath = req.path;

            let thisResponsePath = `${response.originalRequest.url.path.join(
              '/'
            )}`

            if (thisResponsePath.indexOf(':') > -1) {
              //There are parameters in this response path that we need to accommodate.
              thisResponsePath = thisResponsePath.replace(/:[^\/]+/g, '.+')
            }

            let match = true;

            for(let header of response.originalRequest.header) {
              //Iterate through the headers on the mocked request object and see if we can find a match
              
              if(header.key.indexOf('x-mock') > -1) {
                continue;
              }

              if(header.value != req.headers[header.key.toLowerCase()]) {
                match = false;
                break;
              }
            }

            if(match) {
              return true;
            } else {
              return (
                response.originalRequest.method == req.method &&
                currentPath.match(thisResponsePath)
              )
            }
          })

          if (response) {
            //We've got a response! Send it back.
            res.status(response.code)
            res.json(JSON.parse(response.body))
            responseSent = true
            break
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
        console.log(`Server listening on http://localhost:${this.port}`)
        console.log(`Server supports the following routes:`)
        console.log(routes)
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

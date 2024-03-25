'use strict'
const express = require('express')
let app = express()
app.use(express.json())

const _ = require('lodash')

let apicache = require('apicache-extra');

const getReplacementValue = require('./replacements').getReplacementValue

class PostmanMockServer {
  constructor(port, collection, debug) {
    this.port = port
    this.collection = collection
    this.instance = null
    this.cache = null
    this.debug = debug || false
  }

  start(options) {
    if(!options) {
      options = {};
    }

    //stop any running instances.
    this.stop()

    //reinitialize the express instance to stop sharing information.
    app = express()
    app.use(express.json())

    if(options.cache) {
      //reinitialze the cache instance to stop sharing information
      this.cache = initCache(options.cacheOptions);

      //cache requests for 1 minute
      app.use(this.cache());
    }

    //setup the routes
    let routes = []

    if (!this.collection) {
      throw new Error(
        'Collection is not set. Please set the collection before starting the server.'
      )
    }

    if (this.collection && this.collection.info) {
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

        if (methodPath.indexOf('{{') > -1) {
          //There are parameters in this method path that we need to accommodate.
          methodPath = methodPath.replace(/{{([a-zA-Z0-9_\.]+)}}/g, ':$1')
        }
      }

      routes.push(item.request.method + ' ' + methodPath)

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

          if (currentPath.charAt(0) != '/') {
            currentPath = '^/' + currentPath
          } else {
            currentPath = '^' + currentPath
          }

          if (currentPath.indexOf(':') > -1) {
            //There are parameters in this path that we need to accommodate.
            currentPath = currentPath.replace(/:[^\/]+/g, '.+$')
          }

          if (currentPath.indexOf('{{') > -1) {
            //There are parameters in this path that we need to accommodate.
            currentPath = currentPath.replace(/{{.+}}/g, '.+')
          }

          if (
            item.request.method.toUpperCase() === req.method &&
            req.path.match(currentPath)
          ) {
            potentialItems.push(item)
          }
        }

        var bestMatchedResponse = null
        var bestMatchedResponseScore = 0

        potentialItems.every(item => {
          //We've got a request.  Now we need to figure out which response to send back.
          if (!item.response || item.response.length === 0) {
            this.debug && console.log("no responses - skipping");
            return true
          }

          //Check and see if any of the mock response selectors were used
          let postmanHeaders = [
            'x-mock-response-name',
            'x-mock-response-id',
            'x-mock-response-code'
          ]

          let selectorUsed = false;

          postmanHeaders.forEach(header => {
            if (req.headers[header]) {
              selectorUsed = true;
            }
          })

          if (selectorUsed) {
            this.debug && console.log('Scoring on x-mock selector');
            //we've used a selector, so if no responses match we have to move on.
            //Look through the responses on this particular request and see if we can get a match.
            let matchedPostmanHeadersResponse = item.response.find(response => {
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
            })

            if (matchedPostmanHeadersResponse) {
              //We've found a matching header so send the response immediately.
              bestMatchedResponse = matchedPostmanHeadersResponse
              this.debug && console.log("matched a header - returning immediately")
              return false
            }
          } else if (req.headers['x-mock-match-request-body'] == 'true') {
            this.debug && console.log('Scoring on x-mock-match-request-body');
            //Lastly we need to check the body of the request.
            if (
              req.method.toLowerCase() == 'post' ||
              req.method.toLowerCase() == 'put' ||
              req.method.toLowerCase() == 'patch'
            ) {
              //Iterate through the responses to see if we can find a matching body.
              let matchedBodyResponse = item.response.find(response => {
                if (
                  response.originalRequest &&
                  response.originalRequest.body &&
                  response.originalRequest.body.raw
                ) {
                  //Check to see if the body equals the request
                  return _.isEqual(
                    req.body,
                    JSON.parse(response.originalRequest.body.raw)
                  )
                }

              });

              if (matchedBodyResponse) {
                //We've found a matching header so send the response immediately.
                bestMatchedResponse = matchedBodyResponse
                this.debug && console.log("matched a body - returning immediately")
                return false
              }
            }
          } else {
            this.debug && console.log("scoring responses...")

            item.response.forEach(response => {
              let score = 0

              //get the path for this response.
              let thisResponsePath = `${response.originalRequest.url.path.join(
                '/'
              )}`

              if (thisResponsePath.indexOf(':') > -1) {
                //There are parameters in this response path that we need to accommodate.
                thisResponsePath = thisResponsePath.replace(/:[^\/]+/g, '.+')
              }

              //Score the path matching
              this.debug && console.log("Scoring path match");
              this.debug && console.log(req.path, `/${thisResponsePath}`)
              if (req.path.match(`/${thisResponsePath}`)) {
                score++
              }

              this.debug && console.log("Score: " + score);

              //Iterate through the headers on the actual request object and see if we can find a match
              this.debug && console.log("Scoring headers");
              for (let key of Object.keys(req.headers)) {
                //Headers to ignore
                let headersToIgnore = [
                  'user-agent',
                  'cache-control',
                  'postman-token',
                  'host',
                  'accept-encoding',
                  'connection',
                  'cookie',
                  'content-length'
                ]

                if (headersToIgnore.indexOf(key.toLowerCase()) > -1) {
                  continue
                }

                let value = req.headers[key]

                if (value.indexOf('x-mock') > -1) {
                  continue
                }

                let match = response.originalRequest.header.find(header => {
                  return key == header.key
                })

                if (match) {
                  //We found a matched header so increase the score.
                  score++
                }

                //TODO: This is iterating through the array twice - we could consolidate these two iterations into a single process.

                let matchKeyAndValue = response.originalRequest.header.find(header => {
                  this.debug && console.log(`key: ${key.toLowerCase()} value: ${value} - header.key: ${header.key.toLowerCase()} header.value: ${header.value}`)
                  return key.toLowerCase() == header.key.toLowerCase() && value == header.value
                })

                if (matchKeyAndValue) {
                  //We found a matched query and value so increase the score.
                  score++
                }
              }

              this.debug && console.log("Score: " + score);

              //Now let's score the query parameters
              this.debug && console.log("Scoring query parameters");
              for (let key of Object.keys(req.query)) {

                if (
                  response.originalRequest &&
                  response.originalRequest.url &&
                  response.originalRequest.url.query &&
                  Array.isArray(response.originalRequest.url.query)
                ) {

                  this.debug && console.log("This response has query parameters.")

                  let match = response.originalRequest.url.query.find(param => {
                    return key == param.key
                  })

                  if (match) {
                    //We found a matched query key so increase the score.
                    score++
                  }

                  //TODO: This is iterating through the array twice - we could consolidate these two iterations into a single process.

                  let matchKeyAndValue = response.originalRequest.url.query.find(param => {
                    return key == param.key && req.query[key] == param.value
                  })

                  if (matchKeyAndValue) {
                    //We found a matched query and value so increase the score.
                    score++
                  }

                } else {
                  this.debug && console.log("No query parameters on this request.")
                }
              }

              this.debug && console.log("Score: " + score);

              this.debug && console.log("this response: " + response.name);
              this.debug && console.log("this response score: " + score);

              if (score > bestMatchedResponseScore) {
                bestMatchedResponse = response
                bestMatchedResponseScore = score
              }

              this.debug && console.log("\n");
            })
          }

          return true
        })

        if (bestMatchedResponse) {
          this.debug && console.log("matched: " + bestMatchedResponse["name"]);
          this.debug && console.log("matched score: " + bestMatchedResponseScore);

          //We've got a response!

          //Create a copy before we start modifying for the response.
          let responseToSend = _.cloneDeep(bestMatchedResponse);

          if (!responseToSend.header) {
            responseToSend.header = [];
          }

          if (this.debug) {
            responseToSend.header.push({
              key: 'x-mock-matched-score',
              value: bestMatchedResponseScore || 0
            });

            responseToSend.header.push({
              key: 'x-mock-matched-response-name',
              value: bestMatchedResponse["name"] || ""
            });
          }

          //204 has a null body
          if (!responseToSend.body) {
            responseToSend.body = ''
          }

          //Let's parse out any faker or variable data.
          let replacements = responseToSend.body.match(/{{\$.+}}/g) || []

          this.debug && console.log("How many replacements?", replacements.length);

          //Replace the faker data and the contextual response elements
          replacements.forEach((replacement, index, object) => {
            let replacementPath = replacement.replace('{{', '').replace('}}', '')
            let replacementValue = getReplacementValue(replacementPath, req)
            this.debug && console.log(`${replacementPath}: ${replacementValue}`);
            responseToSend.body = responseToSend.body.replace(
              replacement,
              replacementValue
            )
          })

          if (responseToSend.code) {
            res.status(responseToSend.code)
          }

          responseToSend && responseToSend.header
            ? responseToSend.header.every(header => {
              //Encoding is not supported so we just skip this header.
              if (header.key.toLowerCase() == 'content-encoding') {
                return true
              }

              this.debug && console.log(`Setting: `, header.key, header.value)

              res.set(header.key, header.value)
              return true
            })
            : false

          res.send(responseToSend.body)
          responseSent = true
        } else {
          this.debug && console.log("No match yet. Keep searching.")
        }

        if (!responseSent)
          res.status(404).json({
            result: 'Error',
            message: 'Could not find a matching response based on your request parameters.'
          })
      })
    }

    app.use(dynamicApiRouter)

    this.instance = app.listen(this.port, err => {
      if (err) {
        console.log(err)
      } else {
        console.log(`Server listening on http://localhost:${this.port}`)
        console.log(`Server supports the following routes:`)
        console.log(_.uniq(routes))
      }
    })
  }

  stop() {
    this.instance ? this.instance.close() : false;
  }
}

function findRequests(items, requests) {
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

function initCache(cacheOptions) {
  if(!cacheOptions) {
    cacheOptions = {};
  }

  if(!cacheOptions.defaultDuration) {
    cacheOptions.defaultDuration = "1 minute";
  }

  if(!cacheOptions.method) {
    cacheOptions.method = {
      include: ["GET", "HEAD"],                    // list of method will be cached (e.g. ["GET"])
      exclude: ["POST", "PUT", "DELETE"]                      // list of method will be excluded (e.g. ["POST","PUT","DELETE"])
    }
  }

  apicache.clear();
  return apicache.options(cacheOptions).middleware;
}

module.exports = PostmanMockServer

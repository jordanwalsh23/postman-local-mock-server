'use strict'
const express = require('express')
const http = require('http')
const https = require('https')

const Collection = require('postman-collection').Collection;

const _ = require('lodash')

let app = express()
app.use(express.json())

let apicache = require('apicache-extra');

const getReplacementValue = require('./replacements.js').getReplacementValue;
const getMatchedResponse = require('./responses.js').getMatchedResponse;

class PostmanMockServer {
  constructor(options) {
    if (!options) {
      options = {};
    }

    this.port = options.port || 3000;
    this.collection = options.collection || {};

    this.debug = options.debug || false;
    this.credentials = options.credentials || {};

    //set the initial instance to null
    this.instance = null;
  }

  setTLSCertificate(certificate) {
    this.credentials['cert'] = certificate
  }

  setTLSPrivateKey(key) {
    this.credentials['key'] = key
  }

  start(options) {
    if (!options) {
      options = {};
    }

    //stop any running instances.
    this.stop()

    //reinitialize the express instance to stop sharing information.
    app = express()
    app.use(express.json())

    if (options.cache) {
      //reinitialze the cache instance to stop sharing information
      this.cache = initCache(options.cacheOptions);

      //cache requests for 1 minute
      app.use(this.cache());
    }

    if (!this.collection) {
      throw new Error(
        'Collection is not set. Please set the collection before starting the server.'
      )
    }

    //Convert the collection to the Postman Collection object
    this.collection = new Collection(this.collection);

    let responses = [];

    findResponses(this.collection.items, responses)

    let dynamicApiRouter = express.Router()

    dynamicApiRouter.all("*", (req, res) => {

      let bestMatchedResponse = getMatchedResponse(req, responses, this.debug)

      if (bestMatchedResponse) {
        //We've got a response!

        //Create a copy before we start modifying for the response.
        let responseToSend = _.cloneDeep(bestMatchedResponse)

        if (this.debug) {

          responseToSend.headers.members.push({
            key: 'x-mock-matched-score',
            value: bestMatchedResponse['score'] || 0
          });

          responseToSend.headers.members.push({
            key: 'x-mock-matched-response-name',
            value: bestMatchedResponse['name'] || ''
          })
        }

        //204 has a null body
        if (!responseToSend.body) {
          responseToSend.body = ''
        }

        //Let's parse out any faker data.
        let replacements = responseToSend.body.match(/{{\$.+}}/g) || []

        this.debug &&
          console.log('Variable replacements count:', replacements.length)

        //Replace the faker data and the contextual response elements
        replacements.forEach((replacement) => {
          let replacementPath = replacement
            .replace('{{', '')
            .replace('}}', '')
          let replacementValue = getReplacementValue(replacementPath, req)
          this.debug && console.log(`${replacementPath}: ${replacementValue}`)
          responseToSend.body = responseToSend.body.replace(
            replacement,
            replacementValue
          )
        })

        //Let's parse out any wildcard variables.
        let wildcards = responseToSend.body.match(/{{.+}}/g) || []

        this.debug &&
          console.log('Wildcard replacements count:', wildcards.length)

        wildcards.forEach((wildcard) => {
          //Find the location in the URL of the wildcard.
          let wildcardIndex = responseToSend.originalRequest.url.path.indexOf(wildcard);

          if (wildcardIndex > -1) {
            //it's on the path
            let wildcardValue = req.path.split("/");

            responseToSend.body = responseToSend.body.replace(
              wildcard,
              wildcardValue[wildcardIndex + 1]
            )
          } else {
            //Check they query parameters
            let param = responseToSend.originalRequest.url.query.find(param => param.value == wildcard);

            if (param) {
              //Get the value from the current request
              let wildcardValue = req.query[param.key] || "";

              responseToSend.body = responseToSend.body.replace(
                wildcard,
                wildcardValue
              )
            }
          }
        })

        if (responseToSend.code) {
          this.debug && console.log('Returning status:', responseToSend.code)
          res.status(responseToSend.code)
        }

        responseToSend && responseToSend.headers
          ? responseToSend.headers.members.every(header => {
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
      } else {
        res.status(404).json({
          result: 'Error',
          message:
            'Could not find a matching response based on your request parameters.'
        })
      }

    });

    app.use(dynamicApiRouter)

    let server, protocol;

    if (this.credentials.cert && this.credentials.key) {
      server = https.createServer(this.credentials, app)
      protocol = "https";
    } else {
      server = http.createServer(app)
      protocol = "http";
    }

    if (server) {
      this.instance = server.listen(this.port, err => {
        if (err) {
          console.log(err)
        } else {
          console.log(`Server listening on ${protocol}://localhost:${this.port}`)
        }
      })
    } else {
      console.log('Error creating server.')
    }
  }

  stop() {
    this.instance ? this.instance.close() : false;
  }
}

function initCache(cacheOptions) {
  if (!cacheOptions) {
    cacheOptions = {};
  }

  if (!cacheOptions.defaultDuration) {
    cacheOptions.defaultDuration = "1 minute";
  }

  if (!cacheOptions.method) {
    cacheOptions.method = {
      include: ["GET", "HEAD"],                    // list of method will be cached (e.g. ["GET"])
      exclude: ["POST", "PUT", "DELETE"]                      // list of method will be excluded (e.g. ["POST","PUT","DELETE"])
    }
  }

  if (!cacheOptions.headerBlacklist) {
    cacheOptions.headerBlacklist = ['Authorization', 'x-api-key']
  }

  apicache.clear();
  return apicache.options(cacheOptions).middleware;
}

function findResponses(items, responses) {

  if (items && items.members && items.members.length > 0) {
    for (let item of items.members) {
      
      //Check if this is a folder. If so we need to use recursion.
      if (item.items) {
        findResponses(item.items, responses)
      } else if (item.responses && item.responses.members) {
        item.responses.members.forEach(member => {
          responses.push(member)
        })
      }
    }
  }
}

module.exports = PostmanMockServer

const _ = require('lodash')

function getMatchedResponse(req, responses, debug) {
    var bestMatchedResponse = null;
    var bestMatchedResponseScore = 0;

    //1. Filter on METHOD
    let method = req.method;

    responses = responses.filter(response => {
        console.log(response)
        return response.originalRequest.method == method;
    })

    if (responses.length == 0) {
        return;
    }

    //2. Filter on Custom Mock Server Headers
    //Check and see if any of the mock response selectors were used
    let postmanHeaders = [
        'x-mock-response-name',
        'x-mock-response-id',
        'x-mock-response-code'
    ]

    let selectorUsed = false

    postmanHeaders.forEach(header => {
        if (req.headers[header]) {
            selectorUsed = true
        }
    })

    if (selectorUsed) {
        debug && console.log('Scoring on x-mock selector')
        //we've used a selector, so if no responses match we have to move on.
        //Look through the responses on this particular request and see if we can get a match.
        let matchedPostmanHeadersResponse = responses.find(response => {
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
            //TODO: there could be multiple responses with the same name/code - we need to handle this.
            debug && console.log('matched a header - returning immediately');
            return matchedPostmanHeadersResponse;
        }
    }

    //3. Filter by URL
    debug && console.log('scoring responses by URL match...')

    let results = {};

    responses.every(response => {
        results[response.id] = {
            score: 100
        };

        //get the path for this response.
        let thisResponsePath = `${response.originalRequest.url.path.join(
            '/'
        )}`

        //3.1.1 Perfect Score
        debug && console.log('Scoring path structure match')
        debug && console.log(req.path, `/${thisResponsePath}`)

        if (_.isEqual(req.path, `/${thisResponsePath}`)) {
            return true;
        }

        //3.1.2 Compare case insensitive
        if (_.isEqual(req.path.toLowerCase(), `/${thisResponsePath.toLowerCase()}`)) {
            results[response.id].score -= 10;
            return true;
        }

        //3.1.3 Remove trailing slashes
        let newReqPath = req.path.replace(/\/?\s*$/g, '');
        let newResPath = thisResponsePath.replace(/\/?\s*$/g, '');

        if (_.isEqual(newReqPath, `/${newResPath}`)) {
            results[response.id].score -= 5;
            return true;
        }

        //3.1.4 Remove trailing slashes and case insensitive
        if (_.isEqual(newReqPath.toLowerCase(), `/${newResPath.toLowerCase()}`)) {
            results[response.id].score -= 15;
            return true;
        }

        //3.1.5 Remove wildcards and variables and test match
        if (thisResponsePath.indexOf(':') > -1) {
            //There are parameters in this response path that we need to accommodate.
            thisResponsePath = thisResponsePath.replace(/:[^\/]+/g, '.+')
        }

        let thisResponsePathParts = `/${thisResponsePath}`.split("/");
        let thisRequestPathParts = req.path.split("/");

        let matches = false;

        //Test if we replace the response path parts, will this request match
        if (thisRequestPathParts.length == thisResponsePathParts.length) {

            thisRequestPathParts.every((requestpart, idx) => {

                if (thisResponsePathParts[idx].indexOf("{{") > -1) {
                    //Let's temporarily set this to the request value
                    thisResponsePathParts[idx] = requestpart;
                }

                matches = requestpart == thisResponsePathParts[idx];
                return matches;

            })

            if (matches) {
                results[response.id].score -= 20;
                return true;
            }

        }

        //no match - we need to delete this ID
        delete results[response.id];
        debug && console.log(results);
        return true;
        
    });

    //3.1.6 Match Query Parameters
    if (Object.keys(req.query).length > 0) {

        debug && console.log('Scoring query parameters')

        //iterate through the results array as these are the only potential matches.
        Object.keys(results).forEach((id) => {

            let response = responses.find(response => response.id == id);
            debug && console.log('Scoring query parameters')
            let fullMatches = 0;
            let partialMatches = 0;
            let missingMatches = 0;
            let totalQueryParams = Object.keys(req.query).length;

            Object.keys(req.query).every((key) => {

                if (
                    response.originalRequest &&
                    response.originalRequest.url &&
                    response.originalRequest.url.query &&
                    response.originalRequest.url.query.members &&
                    Array.isArray(response.originalRequest.url.query.members)
                ) {
                    let matchKeyAndValue =
                        response.originalRequest.url.query.find(param => {
                            return key == param.key && req.query[key] == param.value
                        })

                    if (matchKeyAndValue) {
                        //We found a matched query and value so increase the score.
                        fullMatches++;
                        return true;
                    }

                    let match = response.originalRequest.url.query.find(param => {
                        debug && console.log("key:" + key.toLowerCase(), "param key: ", param.key.toLowerCase())
                        return key.toLowerCase() == param.key.toLowerCase()
                    })

                    if (match) {
                        //We found a matched query key so increase the score.
                        partialMatches++;
                        return true;
                    } else {
                        missingMatches++;
                        return true;
                    }

                } else {
                    debug && console.log('No query parameters on this response example.')
                }
            });

            let matchingPct = parseFloat(fullMatches / (fullMatches + partialMatches + missingMatches));
            debug && console.log(`matchingpct: ${matchingPct}.`, fullMatches, partialMatches, missingMatches, totalQueryParams);
            debug && console.log(fullMatches == totalQueryParams)

            debug && console.log("results score before: ", results[id].score)

            if (fullMatches == totalQueryParams) {
                results[id].score += 10;
            } else if (partialMatches > 0) {
                results[id].score += (10 * matchingPct);
            } else {
                results[id].score -= missingMatches > 10 ? 10 : missingMatches;
            }

            debug && console.log("results score after: ", results[id].score)
        });
    }

    //3.1.7 Match Headers

    if (req.headers['x-mock-match-request-headers'] || req.headers['x-mock-match-request-body']) {

        //Iterate through the headers on the actual request object and see if we can find a match
        debug && console.log('Matching headers')

        //Headers first
        let headersToFind = req.headers['x-mock-match-request-headers'];

        if (headersToFind && headersToFind != "") {
            headersToFind = headersToFind.split(",");
            if (!Array.isArray(headersToFind)) {
                headersToFind = [headersToFind];
            }
        }

        //Iterate through the results array as these are the only potential matches
        Object.keys(results).forEach((id) => {

            let response = responses.find(response => response.id == id);

            if (headersToFind) {
                let headersFound = true;

                headersToFind.every(searchHeader => {

                    let match = response.originalRequest.headers.find(header => {
                        return header.key == searchHeader
                    })

                    if (!match) {
                        headersFound = false;
                        return false;
                    } else {
                        return true;
                    }
                });

                debug && console.log("headers found:", headersFound)
                if (!headersFound) {
                    delete results[id];
                }
            }

            debug && console.log('Matching body')
            //check if the body matches
            if (
                req.method.toLowerCase() == 'post' ||
                req.method.toLowerCase() == 'put' ||
                req.method.toLowerCase() == 'patch'
            ) {

                if (
                    response.originalRequest &&
                    response.originalRequest.body &&
                    response.originalRequest.body.raw &&
                    _.isEqual(
                        req.body,
                        JSON.parse(response.originalRequest.body.raw))
                ) {
                    debug && console.log("body matches increase by 5");
                    results[id].score += 5;
                } else {

                    if (req.headers['x-mock-match-request-body'] == 'true') {
                        delete results[id];
                    }

                }
            }
            
        });
    }

    bestMatchedResponseScore = 0;
    Object.keys(results).forEach(id => {
        if (results[id].score > bestMatchedResponseScore) {
            bestMatchedResponseScore = results[id].score;
            bestMatchedResponse = responses.find((response) => response.id == id);
        }
    })

    if (!bestMatchedResponse) {
        debug && console.log("Couldn't find a response")
    } else {
        bestMatchedResponse['score'] = bestMatchedResponseScore;
    }

    return bestMatchedResponse;

}

module.exports = {
    getMatchedResponse: getMatchedResponse
}
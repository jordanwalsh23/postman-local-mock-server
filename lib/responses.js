const _ = require('lodash')
const distance = require('fastest-levenshtein').distance

function getMatchedResponse(req, responses, debug) { 
    var bestMatchedResponse = null;
    var bestMatchedResponseScore = 0;

    //1. Filter on METHOD
    let method = req.method;

    responsesToProcess = responses.filter(response => {
        return response.originalRequest.method == method;
    })

    if (responsesToProcess.length == 0) {
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
        let matchedPostmanHeadersResponse = responsesToProcess.find(response => {
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

    debug && console.log('Scoring path structure match')
    responsesToProcess.every(response => {
        results[response.id] = {
            score: 100
        };

        let thisResponsePath = "";

        //get the path for this response.
        if(response && response.originalRequest && response.originalRequest.url && response.originalRequest.url.path) {
            thisResponsePath = `${response.originalRequest.url.path.join('/')}`
        }

        //3.1.1 Perfect Score
        debug && console.log(`Perfect Match: ${req.path} eq /${thisResponsePath}`, _.isEqual(req.path, `/${thisResponsePath}`))

        if (_.isEqual(req.path, `/${thisResponsePath}`)) {
            return true;
        }

        //3.1.2 Compare case insensitive
        debug && console.log(`Case insensitive match: ${req.path.toLowerCase()} eq /${thisResponsePath.toLowerCase()}`, _.isEqual(req.path.toLowerCase(), `/${thisResponsePath.toLowerCase()}`))

        if (_.isEqual(req.path.toLowerCase(), `/${thisResponsePath.toLowerCase()}`)) {
            results[response.id].score -= 10;
            return true;
        }

        //3.1.3 Remove trailing slashes
        let newReqPath = req.path.replace(/\/?\s*$/g, '');
        let newResPath = thisResponsePath.replace(/\/?\s*$/g, '');

        debug && console.log(`Removed trailing slashes match: ${newReqPath} eq /${newResPath}`, _.isEqual(newReqPath, `/${newResPath}`))

        if (_.isEqual(newReqPath, `/${newResPath}`)) {
            results[response.id].score -= 5;
            return true;
        }

        //3.1.4 Remove trailing slashes and case insensitive

        debug && console.log(`Removed trailing slashes and case insensitive match: ${newReqPath.toLowerCase()} eq /${newResPath.toLowerCase()}`, _.isEqual(newReqPath.toLowerCase(), `/${newResPath.toLowerCase()}`))

        if (_.isEqual(newReqPath.toLowerCase(), `/${newResPath.toLowerCase()}`)) {
            results[response.id].score -= 15;
            return true;
        }

        //3.1.5 Compare the URLs with the alphanumeric IDs removed.
        let reqIDsRemoved = stripPotentialIDs(req.path.toLowerCase());
        let resIDsRemoved = stripPotentialIDs(`/${thisResponsePath.toLowerCase()}`);

        debug && console.log(`Compare with IDs removed: ${reqIDsRemoved} eq ${resIDsRemoved}`, _.isEqual(reqIDsRemoved, `${resIDsRemoved}`))

        if (_.isEqual(reqIDsRemoved, `${resIDsRemoved}`)) {
            results[response.id].score -= 20;
            return true;
        }

        //3.1.6 Compare the URLs with the alphanumeric IDs and trailing slashes removed
        let reqIDsAndSlashesRemoved = stripPotentialIDs(req.path.toLowerCase().replace(/\/$/g, ''));
        let resIDsAndSlashesRemoved = stripPotentialIDs(`/${thisResponsePath.toLowerCase().replace(/\/$/g, '')}`);

        debug && console.log(`Compare with IDs and trailing slashes removed: ${reqIDsAndSlashesRemoved} eq ${resIDsAndSlashesRemoved}`, _.isEqual(reqIDsAndSlashesRemoved, `${resIDsAndSlashesRemoved}`))

        if (_.isEqual(reqIDsAndSlashesRemoved, `${resIDsAndSlashesRemoved}`)) {
            results[response.id].score -= 25;
            return true;
        }

        //3.1.7 Remove wildcards and variables and test match
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
        return true;

    });

    debug && console.log('Scoring query parameters')

    //4. Match Query Parameters
    if (Object.keys(req.query).length > 0) {

        //iterate through the results array as these are the only potential matches.
        Object.keys(results).forEach((id) => {

            let response = responsesToProcess.find(
                (response) => response.id == id
            );
            debug && console.log("Scoring query parameters");
            let fullMatches = 0;
            let partialMatches = 0;
            let missingMatches = 0;
            let totalQueryParams = Object.keys(req.query).length;

            let kv = new Map();
            const responseHasQueryMember =
                response.originalRequest &&
                response.originalRequest.url &&
                response.originalRequest.url.query &&
                response.originalRequest.url.query.members &&
                Array.isArray(response.originalRequest.url.query.members);

            if (responseHasQueryMember) {
                const decodeAndSplit = (value) =>
                    value.split(",").map(decodeURI);

                /**
                 * Iterate through the query parameters and check the following:
                 *
                 * 1. if param is disabled, skip it
                 * 2. If we have already processed a query param with this key - retrieve the value, else return an empty array.
                 * 3. Evaluate the current param value
                 * 3.1. If the param value is an array, flatten each item of the array and return the decoded version.
                 * 3.2. If the param value is not an array, return the decoded version.
                 * 4. Update the value in the Key/Value Map.
                 */

                for (const param of response.originalRequest.url.query
                    .members) {
                    if (param.disabled) {
                        continue;
                    }

                    const existingValues = kv.get(param.key) || [];
                    const thisParamValues = Array.isArray(param.value)
                        ? param.value.flatMap(decodeAndSplit)
                        : decodeAndSplit(param.value);
                    kv.set(param.key, existingValues.concat(thisParamValues));
                }
            }

            Object.keys(req.query).every((key) => {
                if (responseHasQueryMember) {
                    const queryValueSet = new Set();
                    if (Array.isArray(req.query[key])) {
                        for (const value of req.query[key]) {
                            queryValueSet.add(decodeURI(value));
                        }
                    } else {
                        queryValueSet.add(decodeURI(req.query[key]));
                    }

                    const matchKeyAndValue = kv
                        .get(key)
                        ?.every((value) => queryValueSet.has(value)) ?? false;

                    if (matchKeyAndValue) {
                        debug && console.log("key and value match");
                        //We found a matched query and value so increase the score.
                        fullMatches++;
                        return true;
                    }

                    let match = response.originalRequest.url.query.members.find(
                        (param) => {
                            debug && console.log("key:" + key.toLowerCase(),"param key: ",param.key.toLowerCase());
                            return key.toLowerCase() == param.key.toLowerCase();
                        }
                    );

                    if (match) {
                        //We found a matched query key so increase the score.
                        partialMatches++;
                        return true;
                    } else {
                        missingMatches++;
                        return true;
                    }
                } else {
                    debug &&
                        console.log(
                            "No query parameters on this response example."
                        );
                }
            });

            let matchingPct = parseFloat(fullMatches / (fullMatches + partialMatches + missingMatches));
            debug && console.log(`matchingpct: ${matchingPct}.`, fullMatches, partialMatches, missingMatches, totalQueryParams);
            debug && console.log(`isallMatch`,fullMatches == totalQueryParams)

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

    //5. Match Headers
    debug && console.log('Scoring headers and body match')
    if (req.headers['x-mock-match-request-headers'] || req.headers['x-mock-match-request-body']) {

        selectorUsed = true;

        //Iterate through the headers on the actual request object and see if we can find a match

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

            let response = responsesToProcess.find(response => response.id == id);

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

                //This is a request that should have a body, we only support JSON comparisons so let's check.
                if (req.headers['content-type'] && req.headers['content-type'].toLowerCase() == "application/json") {

                    //Now let's validate this response and see if they have a perfect match
                    if (
                        response.originalRequest &&
                        response.originalRequest.body &&
                        response.originalRequest.body.raw &&
                        _.isEqual(
                            req.body,
                            JSON.parse(response.originalRequest.body.raw))
                    ) {
                        debug && console.log("body matches: increase the score by 5");
                        results[id].score += 5;

                    } else {
                        if (req.headers['x-mock-match-request-body'] == 'true') {
                            delete results[id];
                        }
                    }
                }
            }

        });
    }

    bestMatchedResponseScore = 0;
    Object.keys(results).forEach(id => {
        if (results[id].score > bestMatchedResponseScore) {
            bestMatchedResponseScore = results[id].score;
            bestMatchedResponse = responsesToProcess.find((response) => response.id == id);
        }
    })

    if (!bestMatchedResponse && !selectorUsed) {
        debug && console.log("Couldn't find a response. Doing the Levenshtein check.")

        //6. Levenshtein URL Document Distance Match
        debug && console.log('Scoring distance between URL parts')

        responsesToProcess = responses.filter(response => {
            return response.originalRequest.method == req.method;
        })

        //Iterate through the results array as these are the only potential matches we have left
        responsesToProcess.every((response) => {

            let requestUrlParts = req.path.split('/');
            let responseUrlParts = response && response.originalRequest ? response.originalRequest.url.path : [];

            if (requestUrlParts && requestUrlParts.length > 0 && requestUrlParts[0] == "") {
                requestUrlParts.shift();
            }

            if (responseUrlParts && responseUrlParts.length > 0 && responseUrlParts[0] == "") {
                responseUrlParts.shift();
            }

            if (requestUrlParts.length != responseUrlParts.length) {
                return false;
            }

            let pctRequired = 75;
            let pctMet = true;

            requestUrlParts.every((part, idx) => {
                if (part && responseUrlParts[idx]) {
                    let result = distance(part, responseUrlParts[idx]);
                    debug && console.log(`URL part ${part} vs ${responseUrlParts[idx]} = ${result}`)

                    let pctDistance = calculatePercentage(part.length - result, part.length);
                    console.log(`pct distance: ${pctDistance}`);

                    pctMet = pctMet && (pctDistance >= pctRequired);
                    return pctMet;
                }
            });

            if(pctMet) {
                //TODO: Could be a higher pct found later on. At this stage we are simply returning the first one found that meets the pct.
                bestMatchedResponse = response;
                return false;
            }

            return true;

        });


    }

    if (bestMatchedResponse) {
        debug && console.log("Best matched:", bestMatchedResponse.name, bestMatchedResponse.id)
        bestMatchedResponse['score'] = bestMatchedResponseScore;
    } else {
        debug && console.log("Couldn't find a response. Returning null.")
    }

    return bestMatchedResponse;

}


/**
 * Potential IDs are defined as follows:
    -  Numbers
    -  Strings greater than or equal to 256 in length (large strings which might be binary data)
    -  UUIDs 
 */

function stripPotentialIDs(url) {

    let parts = url.split('/');

    parts.forEach((part, idx) => {

        if (part && part != "") {
            //check if this is a number
            if (!isNaN(part)) {
                parts[idx] = ""
            }

            //check if this is a UUID by regex
            if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(part)) {
                parts[idx] = ""
            }

            //check if this is a large string
            if (part.length >= 256) {
                parts[idx] = ""
            }
        }

    })

    return parts.join('/');
}


function calculatePercentage(is, of) {
    if (_.isEqual(of, 0)) {
        return 0;
    }

    // round percentage to the nearest integer
    return Math.round((is / of) * 100);
}

module.exports = {
    getMatchedResponse: getMatchedResponse
}
#!/usr/bin/env node
const yargs = require("yargs");
const fs = require('fs');
const PostmanLocalMockServer = require('../lib/server');

const cliOptions = yargs
  .usage("Usage: -c <Path to Collection JSON file, or URL>, -p <Port to use>")
  .option("collection", { alias: "c", describe: "Path to your Collection JSON file, or URL.", type: "string", demandOption: true })
  .option("port", { alias: "p", describe: "The port you would like to use.", type: "number", demandOption: true })
  .option("key", { describe: "Path to the TLS private key file.", type: "string", demandOption: false })
  .option("cert", { describe: "Path to your TLS certificate file.", type: "string", demandOption: false })
  .option("cacheTTL", { describe: "Time to keep responses in cache - see apicache.", type: "string", demandOption: false })
  .option("debug", { alias: "d", describe: "Add debug statements.", type: "boolean", default: false, demandOption: false })
  .argv;

async function main() {

  if (cliOptions.collection) {

    let globalOptions = {};
    try {
      // if collection is a url starting with http, try to download it
      if (cliOptions.collection.startsWith('http')) {
        globalOptions.collection = await fetch(cliOptions.collection)
          .then(response => response.json())
          .catch(e => {
            e = new Error("Provided URL was not a valid Collection")
            e.code = "ERR_NON_JSON_RESPONSE";
            throw e;
          });
      } else {
        globalOptions.collection = JSON.parse(fs.readFileSync(cliOptions.collection, 'utf8'));
      }

      if (cliOptions.port && !isNaN(cliOptions.port)) {
        globalOptions.port = cliOptions.port;
      } else {
        globalOptions.port = 3555;
      }

      if (cliOptions.debug) {
        globalOptions.debug = cliOptions.debug
      }

      if (cliOptions.key && cliOptions.cert) {
        var key = fs.readFileSync(cliOptions.key)
        var cert = fs.readFileSync(cliOptions.cert)

        globalOptions.credentials = {
          key: key,
          cert: cert
        }
      }

      //Create a new server
      let server = new PostmanLocalMockServer(globalOptions);

      let serverOptions = {};

      if (cliOptions.cacheTTL) {
        serverOptions = {
          cache: true,
          cacheOptions: {
            debug: true,
            defaultDuration: cliOptions.cacheTTL
          }
        }
      }
      
      //Start the server
      server.start(serverOptions);

    } catch (e) {
      if (e.code == 'ENOENT') {
        console.log("Error starting local mock server. Collection file not found: ", cliOptions.collection)
      } else if (e.code == 'ERR_SOCKET_BAD_PORT') {
        console.log("Error starting local mock server. Could not bind server to port:", cliOptions.port)
      } else if (e.code == 'ERR_NON_JSON_RESPONSE') {
        console.log("Error starting local mock server. The URL provided was not a valid collection file. Check your URL and try again:", cliOptions.collection)
      } else {
        console.log(e)
        console.log(e.code)
      }
    }



  }
}

main();
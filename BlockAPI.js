const Hapi=require('hapi');
const Blockchain = require('./services/Blockchain.js');

/**
* Class to create and initialize hapi.js server and its controllers based on the Examples provided in the Blockchain Developer Nanodegree Blockchain Web Services module
*
*/
class BlockAPI {

constructor() {
    this.server = Hapi.Server({
        port: 8000,
        host: 'localhost'
    });
    let self = this;
    //IIFE to execute Blockchain object creation synchronously awaiting for Blockchain object to be ready before starting to add blocks
    (async function(){
            self.blockChain = await self.factory(Blockchain.Blockchain);
            //console.log(self.blockChain);
            require("./controllers/BlockController.js")(self.server);
            require("./controllers/MempoolController.js")(self.server);
            require("./controllers/StarController.js")(self.server);
            self.start();
        }
    )();

}

static getBlockchain(){
    console.log(this.blockChain);
    return this.blockChain;
}

/**
**  Helper function to create Blockchain objects and use them after they are initialized, preventing duplicate blocks
**  https://stackoverflow.com/a/42048016
**/
factory(construct) {
  // create a promise
  var aPromise = new Promise(
    function(resolve, reject) {
      // construct the object here
      var a = new construct();
      // setup simple timeout
      var timeout = 1000;
      // called in 10ms intervals to check if the object is initialized
      function waiter() {
        if (a.initialized) {
          // if initialized, resolve the promise
          resolve(a);
        } else {
          // check for timeout - do another iteration after 10ms or throw exception
          if (timeout > 0) {     
            timeout--;
            setTimeout(waiter, 10);            
          } else {            
            throw new Error("Timeout!");            
          }
        }
      }
      // call the waiter, it will return almost immediately
      waiter();
    }
  );
  // return promise of object being created and initialized
  return aPromise;
}

// Function to start the server
async start() {
    await this.server.start();
    console.log(`Server running at: ${this.server.info.uri}`);
}
}

let obj = new BlockAPI();

module.exports = obj;
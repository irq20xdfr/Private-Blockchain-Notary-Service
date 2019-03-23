/**
Testing file, we test for different methods in Blockchain class
First, we require the Block and Blockchain class files
**/
const Block = require('./Block.js');
const Blockchain = require('./Blockchain.js');


/**
**  Helper function to create Blockchain objects and use them after they are initialized, preventing duplicate blocks
**  https://stackoverflow.com/a/42048016
**/
function factory(construct) {
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



//IIFE to execute Blockchain object creation synchronously awaiting for Blockchain object to be ready before starting to add blocks
(async function(){

	let myBlockChain = await factory(Blockchain.Blockchain);

	setTimeout(function () {
		console.log("Waiting...")
	}, 1000);

	/******************************************
	 ** Function for Create Tests Blocks   ****
	 ******************************************/


	/*(function theLoop (i) {
		setTimeout(function () {
			let blockTest = new Block.Block("Test Block - " + (i + 1));
			// Be careful this only will work if your method 'addBlock' in the Blockchain.js file return a Promise
			myBlockChain.addBlock(blockTest).then((result) => {
				console.log(result);
				i++;
				if (i < 10) theLoop(i);
			});
		}, 2000);
	  })(0);*/


	/***********************************************
	 ** Function to get the Height of the Chain ****
	 ***********************************************/

	
	// Be careful this only will work if `getBlockHeight` method in Blockchain.js file return a Promise
	/*myBlockChain.getBlockHeight().then((height) => {
		console.log(height);
	}).catch((err) => { console.log(err);});
	*/

	/***********************************************
	 ******** Function to Get a Block  *************
	 ***********************************************/

	
	// Be careful this only will work if `getBlock` method in Blockchain.js file return a Promise
	/*myBlockChain.getBlock(0).then((block) => {
		console.log(JSON.stringify(block));
	}).catch((err) => { console.log(err);});
	*/
	/***********************************************
	 ***************** Validate Block  *************
	 ***********************************************/

	
	// Be careful this only will work if `validateBlock` method in Blockchain.js file return a Promise
	/*myBlockChain.validateBlock(0).then((valid) => {
		console.log(valid);
	})
	.catch((error) => {
		console.log(error);
	})
	*/

	/** Tampering a Block this is only for the purpose of testing the validation methods */
	/*
	myBlockChain.getBlock(5).then((block) => {
		let blockAux = block;
		blockAux.body = "Tampered Block";
		myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
			if(blockModified){
				myBlockChain.validateBlock(blockAux.height).then((valid) => {
					console.log(`Block #${blockAux.height}, is valid? = ${valid}`);
				})
				.catch((error) => {
					console.log(error);
				})
			} else {
				console.log("The Block wasn't modified");
			}
		}).catch((err) => { console.log(err);});
	}).catch((err) => { console.log(err);});

	myBlockChain.getBlock(6).then((block) => {
		let blockAux = block;
		blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
		myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
			if(blockModified){
				console.log("The Block was modified");
			} else {
				console.log("The Block wasn't modified");
			}
		}).catch((err) => { console.log(err);});
	}).catch((err) => { console.log(err);});
	*/
	/***********************************************
	 ***************** Validate Chain  *************
	 ***********************************************/

	
	// Be careful this only will work if `validateChain` method in Blockchain.js file return a Promise
	/*myBlockChain.validateChain().then((errorLog) => {
		if(errorLog.length > 0){
			console.log("The chain is not valid:");
			errorLog.forEach(error => {
				console.log(error);
			});
		} else {
			console.log("No errors found, The chain is Valid!");
		}
	})
	.catch((error) => {
		console.log(error);
	})*/
	

})();
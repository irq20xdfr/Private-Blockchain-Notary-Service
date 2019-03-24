/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const LevelSandbox = require('./levelSandbox');
const Block = require('../model/Block').Block;


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    //creates an object of the LevelSandbox class that has methods to access the DB
    this.db = new LevelSandbox.LevelSandbox();

    //varible to hold current height
    this.currentHeight = -1;

    //variable that controls current object initialization
    this.initialized=false;

    //Calls method that checks if Genesis Block needs to be added to the chain AFTER getting the currentHeight
    this.generateGenesisBlock();

  }

  //function called at Blockchain constructor and creates a Genesis Block in case currentHeight is -1
  async generateGenesisBlock(){
    let self = this;
    //initialize currentHeight variable with the current height or number of blocks in the DB

    await this.getBlockHeight().then(function(currHeight){
        self.currentHeight = currHeight;

        // if current blockchain height is 0, then add the Genesis Block
        if(self.currentHeight==-1){
          //we add a empty block because the addBlock method takes care of adding the block data for a Genesis Block, here we just call addBlock in case that AT STARTUP we detect that currentHeight is -1 or no blocks 
          //are in the DB
          self.addBlock(new Block()).then( function(value){
            //Genesis Block successfully added
            console.log(`${value} block added at height # ${self.currentHeight}`);
            //after creating Genesis Block we set this blockchain as initialized
            self.initialized=true;
          }).catch(function(err){
            //log any error
            console.log(err);
          });
        }else{
          //in case no Genesis Block is needed we set this blockchain as initialized
          self.initialized=true;
        }

      console.log('Current Blockchain Height ' + self.currentHeight);
    }).catch(function(err){console.log(err);});
  }

  //funcation that updates currentHeight variable that keeps current blockchain height, called before a block is added
  updateCurrentHeight(){
    let self = this;
    return new Promise(function(resolve){
        self.getBlockHeight().then(function(currHeight){
        self.currentHeight = currHeight;
        console.log('Update Blockchain Height ' + self.currentHeight);
        resolve();
      }).catch(function(err){console.log(err);});
    });
  }

  // Add new block
  addBlock(newBlock){
    let self = this;
    //returns a Promise that creates the Block
    return new Promise(function(resolve,reject){
      //first updates currentHeight
      self.updateCurrentHeight().then(function(){
        self.getBlock(self.currentHeight).then(function(block){
          let isGenesisBlock = false;
          //if currentHeight is zero or no blocks are in DB, isGenesisBlock variable is set to true and the Genesis Block is created
          if(self.currentHeight==-1){
              isGenesisBlock = true;
              newBlock = new Block("First block in the chain - Genesis block");
          }

          // UTC timestamp **NOW IT SET THIS UP IN EACH BLOCK**
          //newBlock.time = new Date().getTime().toString().slice(0,-3);

          // Block height, if isGenesisBlock is true, 0 is assigned as heigh since whis block should be the Genesis Block
          newBlock.height = isGenesisBlock ? 0 : self.currentHeight+1;

          // previous block hash only if returned block is defined, in other words if other block already exist
          if(block){
            newBlock.previousBlockHash = block.hash;
          }
          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();


          // Adding block object to chain
          //self.chain.push(newBlock);
          self.db.addDataToLevelDB(newBlock.height, JSON.stringify(newBlock)).then((addedBlock) => {
              resolve(addedBlock);
          }).catch((err) => { console.log(err);reject(err);});
        });
      });
    });

  }

  // Get block height
    async getBlockHeight(){
      return this.db.getCurrentHeihgt();
    }

    // get block
    getBlock(blockHeight){
      let self = this;
      return new Promise(function(resolve, reject){
        self.db.getLevelDBData(blockHeight).then(function(blockData){
          //blockData variable holds requested block data
          resolve(JSON.parse(blockData));
        }).catch(function(err){
          if (err.notFound) {
            //console.log(blockHeight+" - is not found, returning undefined");
            resolve(undefined);
          }
        });
      });
    }

    // validate block
    validateBlock(blockHeight){
      let self = this;
      return new Promise(function(resolve,reject){
        // get block object
        self.getBlock(blockHeight).then(function(block){
            if(block!=undefined){
              // get block hash
              let blockHash = block.hash;
              // remove block hash to test block integrity
              block.hash = '';
              // generate block hash
              let validBlockHash = SHA256(JSON.stringify(block)).toString();
              // Compare
              if (blockHash===validBlockHash) {
                resolve(true);
              } else {
                console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                resolve(false);
              }
            }else{
              console.log(blockHeight+" block doesn't exist in the DB");
            }
        }).catch(function(err){
          console.log("Error reading block data "+err);
          reject(err)
        });
      });

    }

   // Validate blockchain
    validateChain(){
      //array that keeps account of errors while validating the blockchain
      let errorLog = [];
      let self = this;
      //this method as all the others return a promise
      return new Promise(function(resolve,reject){
        //first we get the current blockchain height to know until what number iterate
        self.getBlockHeight().then(function(height){
          //creates array with sequence https://stackoverflow.com/a/20066663
          let blockHeightsFromZero = Array.apply(null, {length: height}).map(Number.call, Number)

          //variable that keeps a reference to current validated block, it is set in every iteration after the getBlock([height of current validated block])
          var current;
          //variable that keeps a reference to current block validation result, true or false. It is set in every iteration after validateBlock([height of current validated block])
          var currentBlockValidation;
          //it defines a promise sequence as seen on the Udacity Promises Course in: https://youtu.be/loLkm6bboGY?t=23
          let sequence = Promise.resolve();
          //iterates over blockHeightsFromZero that it's just a array from 0 to the current blockchain height
          blockHeightsFromZero.forEach(function(i) {
            //this is an important part, just as the course instructor Cameron Pittman @cwpittman said, it creates the sequence of promises that executes them in order :)
            sequence = sequence
            .then(function(){
              //First validate the current block and return result to the next then
              return self.validateBlock(i);
            })
            .then(function(validationResult){
              //this then saves the validation result in the 'currentBlockValidation' reference variable
              currentBlockValidation = validationResult;
              //now we get block from DB and return it to next then
              return self.getBlock(i);
            })
            .then(function(currentBlock){
              //saves current block to the 'current' reference variable
              current = currentBlock;
              //get next block in chain from the DB and return it to the next then
              return self.getBlock(i+1);
            })
            .then(function(nextBlock){
              //if currentBlockValidation is false, adds this block height to the errorLog array reporting it as a bad block
              if (!currentBlockValidation){console.log("Error invalid in block "+i);errorLog.push(i);}
              
              // compare blocks hash link from the current block with the next block's previousBlockHash field, assuring that links are valid
              let blockHash = current.hash;
              let previousHash = nextBlock!=undefined ? nextBlock.previousBlockHash : '';
              //IMPORTANT additional fix, validates that there's a next block, otherwise we don't validate as there wouln't be a next block's previousBlockHash field
              if (nextBlock!=undefined && blockHash!==previousHash) {
                console.log("Error in block "+i);
                errorLog.push(i);
              }
              //resolve the validateChain returning promise only when we already passed over all blocks
              if(i==height-1){
                resolve(errorLog);
              }
            });
          });
        });
      });
    }


   // Get block by hash
   getBlockByHash(hash) {
      let self = this;
      return new Promise((resolve,reject)=>{
         self.db.getBlockByHash(hash).then(res=>{resolve(res)})
            .catch(err=>{reject(err)})
      })
   }


   // Get block by hash
   getBlockByAddress(addr) {
      let self = this;
      return new Promise((resolve,reject)=>{
         self.db.getBlockByAddress(addr).then(res=>{resolve(res)})
            .catch(err=>{reject(err)})
      })
   }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block)).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
}

//exports Blockchain class
module.exports.Blockchain = Blockchain;

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

  constructor() {
      this.db = level(chainDB);
  }

    // Add data to levelDB with key/value pair
    addLevelDBData(key,value){
      let self = this;
      return new Promise(function(resolve,reject){
        self.db.put(key, value, function(err) {
          if (err) return console.log(err);
          resolve(value);
        });
      });

    }

    // Get data from levelDB with key
    getLevelDBData(key){
      let self = this;
      return new Promise(function(resolve,reject){
        self.db.get(key, function(err, value) {
          if (err) return reject(err);
          resolve(value);
        });
      });
    }

    //Get current blockchain height
    getCurrentHeihgt(){
      let self = this;
      return new Promise(function(resolve, reject){
          let i = 0;
          self.db.createReadStream()
            .on('data', function (data) {
                i++;
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
              resolve(i-1);
            });
        });
    }

    // Add data to levelDB with value
    addDataToLevelDB(height, value) {
      let self = this;
        return new Promise(function(resolve, reject){
            let i = 0;
            self.db.createReadStream()
              .on('data', function (data) {
                  i++;
              })
              .on('error', function (err) {
                  reject(err)
              })
              .on('close', function () {
                  console.log(`Writing to database at key # ${height} = ${value}`);
                  self.addLevelDBData(height, value).then(function(){
                    resolve(value);
                  }).catch(function(err){console.log(err);});
              });
          });
    }

   // Gets block by its hash
   getBlockByHash(hash) {
       let self = this;
       let block = null;
       return new Promise(function(resolve, reject){
           self.db.createReadStream()
           .on('data', function (data) {
               let blockParsed = JSON.parse(data.value);
               if(blockParsed.hash === hash){
                   block = blockParsed;
               }
           })
           .on('error', function (err) {
               reject(err)
           })
           .on('close', function () {
              console.log(block);
               resolve(block);
           });
       });
   }

   //gets a block from levelDB by its address
   getBlockByAddress(addr) {
       let self = this;
       let results = [];
       return new Promise(function(resolve, reject){
           self.db.createReadStream()
           .on('data', function (data) {
               let blockParsed = JSON.parse(data.value);
               if(blockParsed.body.address === addr){
                   results.push(blockParsed);
               }
           })
           .on('error', function (err) {
               reject(err)
           })
           .on('close', function () {
              console.log(results);
               resolve(results);
           });
       });
   }

}

module.exports.LevelSandbox = LevelSandbox;
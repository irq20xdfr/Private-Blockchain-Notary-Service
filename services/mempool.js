const Boom = require('boom');
const bitcoinMessage = require('bitcoinjs-message');
const ValidRequestObject = require('../model/validRequestObject.js');

/* 
* Class for mempool methods and functionality
*
*/
class MempoolObject{
   constructor(){
      //To handle validation requests
      this.walletList = {}; 
      this.mempool = [];
      this.timeoutRequests = [];

      //To handle validation by wallet
      this.validWalletList ={}; 
      this.validMempool = [];
      this.validTimeoutRequest = [];
      this.TimeoutRequestWindowTime = 5*60*1000;
   }

   //returns current timestamp
   getCurrentTimestamp(){
   	return new Date().getTime().toString().slice(0,-3);
   }

   //adds a request to the mempool
   addARequestToMempool(request){
      let self = this;

      //we use an array to hold the request index in mempool array based on the wallet address
      let indexToFind = this.walletList[request.walletAddress];
      let validInWalletList = this.validWalletList[request.walletAddress];

      //if user already validated the request sends an error
      if(validInWalletList){
         throw Boom.badRequest("There is a valid signature request already made and verified, you can now add star");
         return;
      }

      //if this is the first request
      if(indexToFind == null){
         //calculates time left
         let timeElapse = this.getCurrentTimestamp()-request.requestTimeStamp;
         let timeLeft = (this.TimeoutRequestWindowTime/1000)-timeElapse;
         request.validationWindow = timeLeft;

         //add the request to the mempool
         indexToFind = this.mempool.push(request)-1;
         console.log("New index added: "+indexToFind+" - address: "+request.walletAddress);
         this.walletList[request.walletAddress] = indexToFind;

         //sets a timeout of 5 minutes to remove the request
         this.timeoutRequests[request.walletAddress] = setTimeout(function (){self.removeValidationRequest(request.walletAddress)},self.TimeoutRequestWindowTime);
         return request;     
      } else{ //if request is already in memory
         //gets the existent request
         let existentRequest = this.mempool[indexToFind];
         
         //calculates time left
         existentRequest.requestTimeStamp = this.mempool[indexToFind].requestTimeStamp;
         let timeElapse = (this.getCurrentTimestamp())-existentRequest.requestTimeStamp;
         let timeLeft  = (this.TimeoutRequestWindowTime/1000) - timeElapse;
         existentRequest.validationWindow = timeLeft;

         return existentRequest;
      }
  }

  //method to remove a request from the mempool
  removeValidationRequest(address){
      //removes item in index reference array and mempool array
      let indexToFind = this.walletList[address];
      delete this.walletList[address];
      delete this.mempool[indexToFind];

      //clear timeouts
      clearTimeout(this.timeoutRequests[address]);
      delete this.timeoutRequests[address]
   }

   //validates a request by address and signature
   validateRequestByWallet(address,signature){
      let self = this;
      let validation = false;

      //Checks if there is an already validated request
      let indexToFind = this.walletList[address];
      console.log("Index for: "+indexToFind+" - address: "+address);
      if(indexToFind!=undefined){
         let request = this.mempool[indexToFind];
         let msg = request.message;

         try{
            console.log("bitcoinMessage.verify('"+msg+"','"+address+"','"+signature+"');");
            console.log(request);
            //verifies signature
            validation = bitcoinMessage.verify(msg,address,signature);
            if(validation){//if validation passes

               //gets index in the valid mempool
               let validIndexToFind = this.validWalletList[address];

               //If there's no a validation object saved
               if(validIndexToFind==undefined){
                  //first we remove the initial request timeout since the user is trying to validate the request
                  clearTimeout(this.timeoutRequests[address]);
                  delete this.timeoutRequests[address];

                  //calculates time left for the request
                  let timeElapse = (this.getCurrentTimestamp())-request.requestTimeStamp;
                  let timeLeft = (this.TimeoutRequestWindowTime/1000) - timeElapse;
                  
                  //adds the validated request to the valid mempool array
                  const validReqObj = new ValidRequestObject.ValidRequestObject(address,request.requestTimeStamp,msg,timeLeft);
                  validIndexToFind = this.validMempool.push(validReqObj)-1;
                  this.validWalletList[address] = validIndexToFind;

                  //sets timeout functions
                  this.validTimeoutRequest[address] = setTimeout(function(){self.removeValidRequest(address)}, self.TimeoutRequestWindowTime);

                  //return validated request object
                  return validReqObj;
               }else{//if there's already a validation object saved
                  let validReqObj = this.validMempool[validIndexToFind];
                  console.log(validReqObj);
                  //calculates time left for this validated request
                  let timeElapse = (this.getCurrentTimestamp())-validReqObj.status.requestTimeStamp;
                  let timeLeft = (this.TimeoutRequestWindowTime/1000)-timeElapse;
                  
                  //modifies time left for the request and returns it
                  validReqObj.status.validationWindow = timeLeft;
                  this.validMempool[validIndexToFind] = validReqObj;

                  //returns existent validated request
                  return validReqObj;
               }
            }
         }catch(err){
            console.log(err);
            //in case of an exception returns badRequest
            throw Boom.badRequest("Something bad happend, please check your parameters.");
            return;
         }
      }else{
         //in case the no previous request is found returns not found
         throw Boom.notFound("You should request a validation first using /requestValidation endpoint");
         return;
      }

      if(!validation){
         //in case signature isn't right validated returns forbidden
         throw Boom.forbidden("Your signature couldn't be validated.");
         return;
      }
   }

   removeValidRequest(address){
      //Remove validation requests
      this.removeValidationRequest(address);

      //find validation object index for this wallet address
      let validIndexToFind = this.validWalletList[address];
      
      //remove from the list and from the valid mempool
      delete this.validWalletList[address];
      delete this.validMempool[validIndexToFind];

      //remove timeout function
      clearTimeout(this.validTimeoutRequest[address])
      delete this.validTimeoutRequest[address]
   }

   verifyAddressRequest(address){
      return this.validWalletList[address]!=undefined;
   }

}

module.exports.MempoolObject = MempoolObject;
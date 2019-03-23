/** Class to represent the request object **/
class RequestObject{
   constructor(){
      this.walletAddress = "";
      this.requestTimeStamp = "";
      this.message="";
      this.validationWindow = ""
   }
}

module.exports.RequestObject = RequestObject;
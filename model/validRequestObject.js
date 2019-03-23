/** Class to hold validated request data **/
class ValidRequestObject {
  constructor(val_address, val_requestTimeStamp, val_message, val_validationWindow) {
      this.registerStar = true;
      this.status = {
          address: val_address,
          requestTimeStamp: val_requestTimeStamp,
          message: val_message,
          validationWindow: val_validationWindow,
          messageSignature: true
      };

  }
}

module.exports.ValidRequestObject = ValidRequestObject;
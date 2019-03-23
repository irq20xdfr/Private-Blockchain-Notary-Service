/* ===== util.js ===================================
    Utility methods |
|  =============================================================*/

class Util {

  constructor() {
  }

    // Validates star data before saving
    validateStar(star){
      //check for mandatory fields
      if(!("dec" in star) || star.dec.length == 0){
         return "Star object should have a dec property.";
      }

      if(!("ra" in star) || star.ra.length == 0){
         return "Star object should have a ra property.";
      }

      if(!("story" in star) || star.story.length == 0){
         return "Star object should have a story property.";
      }

      //validates length and ASCII characters
      if(!(star.story.length >= 0 && star.story.length<=500) || !this.onlyASCII(star.story)){
         return "Story property must have a length between 0 and 500 and only ASCII characters.";
      }

      return "ok";
    }

    //validates that the chat only has ASCII characters
    onlyASCII(data){
      let badChar = false;
      [...data].forEach(c => {badChar = c.charCodeAt(0)>127;});
      return !badChar;
    }

}

module.exports = Util;
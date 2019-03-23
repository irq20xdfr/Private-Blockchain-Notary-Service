/**
Class that holds star data 
**/
class Star {
  constructor(star) {
      this.ra = star.ra;
      this.dec = star.dec;
      this.mag = star.mag;
      this.cen = star.cen;
      this.story = Buffer.from(star.story).toString('hex');
  }

}

module.exports = Star;
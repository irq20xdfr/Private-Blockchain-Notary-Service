const SHA256 = require('crypto-js/sha256');
const Boom = require('boom');

const Block = require('../model/Block.js');
const RequestObject = require('../model/requestObject.js');
const Star = require('../model/star.js');

const mempool = require('../services/mempool.js');
const BlockAPI = require('../BlockAPI.js');

const Util = require('../util/util.js');
const hextoascii = require('hex2ascii');

/**
 * Controller Definition for Mempool methods
 */
class MempoolController {

    /**
     * Constructor to create a new MempoolController.
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.mempoolService = new mempool.MempoolObject();
        this.requestValidation();
        this.validateRequestByWallet();
        this.addBlock();
    }

    /**
    * POST Controller to handle validation requests
    */

    requestValidation(){
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: async (request, h) => {
                //Validates payload
                if(!request.payload){
                    throw Boom.badRequest("You should provide a valid JSON request");
                }

                //Address is required
                let address = request.payload.address;
                if(!address || address.length==0){
                    throw Boom.badRequest("You should provide a valid address property in the JSON request");
                }

                //returns a request object
                let requestObj = new RequestObject.RequestObject();
                requestObj.walletAddress = address;
                requestObj.requestTimeStamp = (new Date().getTime().toString().slice(0,-3));
                requestObj.message = requestObj.walletAddress+ ":"+ requestObj.requestTimeStamp+ ":"+ "starRegistry";

                requestObj = this.mempoolService.addARequestToMempool(requestObj);

                return requestObj;
            }
        });
    }

    /**
    * POST Controller to validate signatures
    */
    validateRequestByWallet(){
        this.server.route({
            method: 'POST',
            path: '/message-signature/validate',
            handler: async (request, h) => {
               //Validates payload
                if(!request.payload){
                    throw Boom.badRequest("You should provide a valid JSON request");
                }

                let address = request.payload.address;
                let signature = request.payload.signature;

                //validates address and signature
                if(!address || address.length==0 || !signature || signature.length==0){
                    throw Boom.badRequest("You should provide a valid address and signature properties in the JSON request");
                }

               //returns result of the signature validation
               return this.mempoolService.validateRequestByWallet(address,signature);
            }
        });
    }

    /**
    * POST Controller to add a new block with star data
    */
    addBlock(){
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {
                //Validates payload
                if(!request.payload){
                   throw Boom.badRequest("You should provide a valid JSON request");
                }
                //Checks address and star properties
                let address = request.payload.address;
                let star = request.payload.star;
                if(!address || address.length==0 || !star){
                    throw Boom.badRequest("You should provide a valid address and star properties in the JSON request");
                }
                let util = new Util();

                //validates star data
                let startValidation = util.validateStar(star);

                //if start validation is correctly passed the continues with the process
                if(startValidation=="ok"){
                    //verifies that a valid request already exists in the mempool
                    if(this.mempoolService.verifyAddressRequest(address)){

                        //creates star object
                        let starData = {address: address, star : new Star(star)};
                        //creates a block
                        let newBlock = new Block.Block(starData);
                        //adds the block and saves it in the blockData variable
                        let blockData = await BlockAPI.blockChain.addBlock(newBlock);
                        blockData = JSON.parse(blockData);
                        //decode the story data to return it to the user
                        blockData.body.star.storyDecoded = hextoascii(blockData.body.star.story);

                        //removes validation request
                        this.mempoolService.removeValidRequest();

                        //returns the response
                        return h.response(blockData).code(201);
                    }else{
                        throw Boom.forbidden("A previous valid request wasn't found, please call /message-signature/validate with valid signature before saving a star.");
                    }
                }else{
                    throw Boom.badRequest(startValidation);
                }
            }
        });
    }

}

module.exports = (server) => { return new MempoolController(server);}
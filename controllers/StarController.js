const Boom = require('boom');
const hextoascii = require('hex2ascii');
const BlockAPI = require('../BlockAPI.js');

/**
 * Controller Definition for Star retrieving methods
 */
class StarController {

    /**
     * Constructor to create a new StarController.
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.getBlockByHash();
        this.getBlockByAddress();
    }


   
    //GET Controller to get a star object by hash
    getBlockByHash(){
        this.server.route({
            method: 'GET',
            path: '/stars/hash:{hash}',
            handler: async (request, h) => {
                let hash = request.params.hash;
                if(!hash || hash.length==0){
                    throw Boom.badRequest("You should provide a valid hash to look for");
                }
                //get retreive a star by its hash
                let block = await BlockAPI.blockChain.getBlockByHash(hash);
                if(block!=undefined){
                    block.body.star.storyDecoded = hextoascii(block.body.star.story);
                    return h.response(block).code(200);
                }else{
                    //in case we didn't find any block we sent 404 HTTP code
                    throw Boom.notFound("Couldn't find a block with that hash.");
                }
            }
        });
    }

    //GET Controller to get a star by its address
    getBlockByAddress(){
        this.server.route({
            method: 'GET',
            path: '/stars/address:{address}',
            handler: async (request, h) => {
                let address = request.params.address;
                if(!address || address.length==0){
                    throw Boom.badRequest("You should provide a valid address to look for");
                }
                let blocks = await BlockAPI.blockChain.getBlockByAddress(address);

                if(blocks.length!=0){
                    //we decode the story property for every field
                    blocks.forEach(function(block) {
                         block.body.star.storyDecoded = hextoascii(block.body.star.story);
                    });
                    return h.response(blocks).code(200);
                }else{
                    //in case we don't find any block we send 404 HTTP code
                    throw Boom.notFound("Couldn't find a blocks for that address.");
                }
            }
        });
    }

}

module.exports = (server) => { return new StarController(server);}
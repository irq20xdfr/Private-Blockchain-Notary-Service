const SHA256 = require('crypto-js/sha256');

const Block = require('../model/Block.js');
const Boom = require('boom');
const hextoascii = require('hex2ascii');

const BlockAPI = require('../BlockAPI.js');

/**
 * Controller Definition to make routes work with blocks based on the Examples provided in the Blockchain Developer Nanodegree Blockchain Web Services module
 */
class BlockController {

    /**
     * Constructor to create a new BlockController.
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.blocks = [];
        this.getBlockByIndex();
        this.postNewBlock();
        this.getStarBlockByHeight();
        this.mempool = [];
        this.timeoutRequests = [];
    }

    /**
     * GET Controller to get a Block by its height, url: "/api/block/:index"
     */
    async getBlockByIndex() {
        this.server.route({
            method: 'GET',
            path: '/api/block/{index}',
            handler: async (request, h) => {
                let block = await BlockAPI.blockChain.getBlock(request.params.index);
                if(!block){
                    throw Boom.notFound("Block not found.");
                }else{
                    return block;
                }
            }
        });
    }

    /**
     * POST Controller to create a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.server.route({
            method: 'POST',
            path: '/api/block',
            handler: async (request, h) => {
                if(request.payload==undefined || request.payload.length==0 || !request.payload.body){
                    throw Boom.badRequest("You have to specify a valid json object with a body property.");
                }
                let newBlock = new Block.Block(request.payload.body);
                let blockData = await BlockAPI.blockChain.addBlock(newBlock);
                return h.response(blockData).code(201);
            }
        });
    }


     /**
     * GET Controller to get a Star Block by its height, url: "/block/:index"
     */
    async getStarBlockByHeight() {
        this.server.route({
            method: 'GET',
            path: '/block/{index}',
            handler: async (request, h) => {
                let block = await BlockAPI.blockChain.getBlock(request.params.index);
                if(!block){
                    throw Boom.notFound("Block not found.");
                }else{
                    //decodes story if star is present
                    if(block.body.star!=undefined){
                        block.body.star.storyDecoded = hextoascii(block.body.star.story);
                    }

                    return block;
                }
            }
        });
    }

}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => { return new BlockController(server);}
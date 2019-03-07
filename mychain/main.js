'use strict';

var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");
var CryptoJS = require("crypto-js");
var cors = require('cors');

var mychain_http_port = process.env.MYCHAIN_HTTP_PORT || 5001;
var mychain_p2p_port = process.env.MYCHAIN_P2P_PORT || 9001;
var initialPeers = process.env.PEERS ? process.env.CHAIN_PEERS.split(',') : [];
var difficultyLevel = 2;
var difficultyRecordCount = 2;

var mineCount=0;
var miningLimit=5000000;


var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

class BlockDetail {
    constructor(index, previousHash, timestamp, data, hash, proof, timeTaken, difficulty) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.proof = proof;
        this.timeTaken = timeTaken;
        this.difficulty = difficulty;
    }
}

var calculateHashForBlock = (block) => {
console.log('calculateHashForBlock Hash: '+ CryptoJS.SHA256(block.index + block.proof + block.previousHash + block.timestamp + block.data).toString());
console.log('calculateHashForBlock Data: '+ block);
    return CryptoJS.SHA256(block.index + block.proof + block.previousHash + block.timestamp + block.data).toString();
};


var isAllZero = (text)=>{
    
    for(var i=0;i<text.length;i++){
        //console.log('Checking zll zeros for: '+ text);
        if(text.charAt(i)!=='0'){
            return false;
        }
    }
    
    console.log('Checking all zeros for: '+ text+':'+text.length+':'+text.charAt(0)+':'+text.charAt(1));

    return true;
}

var isMined = (hash, tmpProof)=>{
    var prefix = hash.substring(0, difficultyLevel);

    if(isAllZero(prefix)===false && mineCount<miningLimit){
        return false;
    }
    else{
        proof = tmpProof;
        console.log("Success - Proof found: "+mineCount+", Hash: " + hash);
        mineCount = 0;
        return true;
    }
}

var calculateHash = (index, previousHash, timestamp, data, proof) => {
    return CryptoJS.SHA256(index + proof + previousHash + timestamp + data).toString();
};

var applyDifficultyLevel=()=>{
    if((blockchainLedger.length % difficultyRecordCount)==0 && blockchainLedger.length>0){
        difficultyLevel++;
    }
}

var mine = (index, previousHash, timestamp, data) => {
    var state=false;
    var nextHash="";
    var startTime = new Date().getTime();
    
    //applyDifficultyLevel();
   

    while(state===false){
        var tmpProof = mineCount.toString();
        nextHash = calculateHash(index, previousHash, timestamp,data,tmpProof);
        
        if(isMined(nextHash, tmpProof)){
            state=true;
        }
        else
        {
            mineCount++;
        }
    }

    var endTime = new Date().getTime();
    var timeTaken = endTime - startTime;

    console.log('Time taken to mine: '+ startTime+':'+ endTime+':'+ timeTaken);

    return new BlockDetail(index, previousHash, timestamp, data, nextHash, proof, timeTaken, difficultyLevel);
}

var proof=0;

var getGenesisBlock = () => {
    var previousBlock = "0";
    var nextIndex = 0;
    var nextTimestamp = 1551497069;
    var blockData = "My Chain Genesis Block!";

    console.log('Initialize Blockchain Invoked');

    return mine(nextIndex, previousBlock, nextTimestamp, blockData);
};

var initializeBlockchain=(reqDifficultyCount)=>{
    difficultyLevel = reqDifficultyCount;
    blockchainLedger.push(getGenesisBlock());
}

var blockchainLedger = [];



var initializeHttpServer = () => {
    var app = express();
    app.use(cors());
    app.use(function(req, res, next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Typem Accept");
        next();
    });
    app.use(bodyParser.json());
    
    app.get('/peers', (req, res) => {
        
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.set({'Contect-Type':'application/json'});
        res.send({'result':'connected'});
    });
    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchainLedger)));
    app.get('/genesisBlock', (req, res) => res.send(JSON.stringify(getGenesisBlock())));
    app.post('/initializeBlockchain', (req, res) => res.send(JSON.stringify(initializeBlockchain(req.body.difficulty))));
    app.post('/addBlock', (req, res) => {
        var newBlock = generateBlock(req.body.data);
        res.set({'Contect-Type':'application/json'});
        res.send({'result':newBlock});
    });
    app.post('/applyDifficulty', (req, res) => res.send(JSON.stringify(applyDifficulty(req.body.difficulty))));

   
    app.listen(mychain_http_port, () => console.log('Listening http on port: ' + mychain_http_port));
};

var applyDifficulty=(reqDifficulty)=>{
    difficultyLevel = reqDifficulty;
    console.log("Difficulty level changed to: "+ difficultyLevel);
    return {success:true};
}

var generateBlock = (data)=>{

    var newBlock = generateNextBlock(data);

    addBlock(newBlock);
    
    broadcast(responseLatestMsg());
    console.log('block added: ' + JSON.stringify(newBlock));

    return newBlock;
}


var initializeP2PServer = () => {
    var server = new WebSocket.Server({port: mychain_p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + mychain_p2p_port);

};

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};


var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    
    return mine(nextIndex, previousBlock.hash, nextTimestamp, blockData);;
};



var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchainLedger.push(newBlock);
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('The index is nvalid');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('The previoushash is invalid');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('The hash is invalid: ' + calculateHashForBlock(newBlock) + ', ' + newBlock.hash);
        return false;
    }
    return true;
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));

    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    

    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('Blockchain ledger requires to be synced. Our Block Height: ' + latestBlockHeld.index + ', Other Peer Block Height: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("Appending the received block to our chain");
            blockchainLedger.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("Querying the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain, so replacing chain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('Received blockchain is not longer than current blockchain. Do nothing');
    }
};

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchainLedger.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchainLedger = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

var getLatestBlock = () => {

    return (blockchainLedger.length>0 ? blockchainLedger[blockchainLedger.length - 1]:0);
}
var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchainLedger)
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

connectToPeers(initialPeers);
initializeHttpServer();
initializeP2PServer();
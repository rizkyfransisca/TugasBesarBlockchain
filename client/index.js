//initialize socket io client
var io = require('socket.io-client');

//Connect ke alamat server
//Jika server berada di laptop lain,
//ganti 'http://localhost:3000/' dengan ipv4 server (misal : 'http://{ipv4}:{port}/')
var socket = io.connect('http://192.168.56.1:3000/', {
    reconnect: true
});

const CryptoJS = require("crypto-js");

//import model
const BlockChain = require('./Blockchain.js');
const Block = require('./Block.js');

//initialize model / block no 0 (tidak ditampilkan)
const blockchain = new BlockChain();

socket.on('connect', function () {
    console.log('connected to server');
    socket.on('clientEvent', function (ciphertext) {

        // Decrypt
        var bytes = CryptoJS.AES.decrypt(ciphertext, 'kunci rahasia');
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        // var block = new Block(data.index, data.data, data.timestamp, data.nonce, data.hash, data.previous_hash);
        // ambil di bawah ini untuk client html design(sisi client kayak cmd tapi lebih rapi)
        var block = new Block(decryptedData.index, decryptedData.nama,decryptedData.npwp,decryptedData.kerja,decryptedData.total,decryptedData.alamat,decryptedData.email,decryptedData.status,decryptedData.kelamin,decryptedData.tanggungan, decryptedData.timestamp, decryptedData.nonce, decryptedData.hash, decryptedData.previous_hash);
        var previous_block = blockchain.getNewestBlockFromBlockchain();

        if (block.validateBlock(block, previous_block) != 0) {
            console.log('Error code : ' + block.validateBlock(block, previous_block));
        } else {
            blockchain.addBlock(block);
            blockchain.showLatestBlock();
            socket.emit('client emit', decryptedData.index, decryptedData.nama,decryptedData.npwp,decryptedData.kerja,decryptedData.total,decryptedData.alamat,decryptedData.timestamp,decryptedData.email, decryptedData.status,decryptedData.kelamin,decryptedData.tanggungan);
        }
    });
});
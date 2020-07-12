const Block = require('./block');

class Blockchain {
    constructor() { // fungsi ini pasti dipanggil pertama kali saat Blockchain.js dipanggil 
        var dateobj = new Date();
        var timestamp = dateobj.toUTCString();

        this.blockchain = [];
        this.addBlock(new Block(0, 'Genesis Nama','Genesis NPWP','Genesis Pekerjaan','Genesis total','Genesis alamat','Genesis email','Genesis status','Genesis kelamin','Genesis Tanggungan', timestamp, 'Genesis Nonce', 'Genesis Hash', 'Genesis Previous_Hash'));
    }

    addBlock(block) {
        this.blockchain.push(block);
    }

    showBlockchain() {
        for (var i = 0; i < this.blockchain.length; i++) {
            console.log(this.blockchain[i]);
        }
    }

    showLatestBlock() {
        // show mulai dari block no 1
        console.log(this.blockchain[this.blockchain.length - 1]);
        // console.log(this.blockchain[this.blockchain.length - 1].nama);
    }

    getNewestBlockFromBlockchain() {
        return this.blockchain[this.blockchain.length - 1];
    }
}

module.exports = Blockchain;
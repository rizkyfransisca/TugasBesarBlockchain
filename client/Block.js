const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, nama,npwp,kerja,total,alamat,email,status,kelamin,tanggungan, timestamp, nonce, hash, previous_hash) {
        this.index = index; // this = global variable kayak di golang dan c++ yang next next dan prev prev dan info dan nama sekolah
        this.nama = nama;
        this.npwp = npwp;
        this.kerja = kerja;
        this.total = total;
        this.alamat = alamat;
        this.email = email;
        this.status = status;
        this.kelamin = kelamin;
        this.tanggungan = tanggungan;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.hash = hash;
        this.previous_hash = previous_hash;
    }

    validateBlock(block, block_from_blockchain) {
        //check index
        //jika tidak sama = sudah dimanipulasi
        //jika sama = tidak dimanipulasi
        if (block_from_blockchain.index + 1 != block.index) {
            return 1;
        }

        //check nonce
        var r = block.index + 4.04;
        var pattern = (171001 * (66+97+108+105) * block.index) * Math.pow((block.index*(block.index+1)/2),4) * (75+65+68+69+75) - (3.14 * (r * r));
        var string_pattern = pattern.toString()+"Saya menggunakan JAVASCRIPT";
        var hash_pattern = SHA256(string_pattern).toString(); //hash_pattern = salt
        var real_block_nonce = SHA256(block.nama + block.npwp + block.kerja + block.total + block.alamat+block.email+block.status + block.kelamin + block.tanggungan + hash_pattern).toString();

        if (real_block_nonce != block.nonce) {
            return 2;
        }

        //check hash
        var real_hash = SHA256(block.index.toString() + block.nama + block.npwp + block.kerja + block.total + block.alamat +block.email+block.status + block.kelamin + block.tanggungan + block.timestamp + block.nonce + block.previous_hash).toString();
        if (real_hash != block.hash) {
            return 3;
        }

        //check previous hash
        if (block_from_blockchain.hash != block.previous_hash) {
            return 4;
        }

        return 0;
    }
}

module.exports = Block;
//initialize express app
var app = require('express')();

//initialize express server instance
var http = require('http').createServer(app);

//initialize socket io listening to express server instance
var io = require('socket.io')(http);
//import crypto.js
const SHA256 = require('crypto-js/sha256');

const CryptoJS = require("crypto-js");

var express = require("express");
const bodyParser = require('body-parser');
const { stat } = require('fs');
app.use(bodyParser.urlencoded({
    extended: true
}));

var index = 0;
var previous_hash = 'Genesis Hash'

// array baru
var products = [];
var clientItem = [];
// akhir array baru
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

function generateSalt(index) {
    // 6697108105 = ascii dari Bali
    // 75+65+68+69+75 =  ascii dari KADEK
    // index * indx + 1 / 2 = rumus sn 1+2+3
    // r x r = luas lingkaran
    //bikin sebuah pola
    var r = index + 4.04;
    var pattern = (171001 * (66 + 97 + 108 + 105) * index) * Math.pow((index * (index + 1) / 2), 4) * (75 + 65 + 68 + 69 + 75) - (3.14 * (r * r));

    //ubah pattern menjadi string
    var string_pattern = pattern.toString() + "Saya menggunakan JAVASCRIPT";

    //hash string_pattern
    var hash_pattern = SHA256(string_pattern).toString();

    return hash_pattern;
};

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});
app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/register.html');
});
var user = false;
app.get('/loginadmin', function (req, res) {
    user = false;
    res.sendFile(__dirname + '/loginadmin.html');
});

var check = "";
var sesi = "";
app.post('/loginadmin', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username == "admin" && password == "rahasia") {
        user = true;
        res.redirect("/admin");
    } else if (username == "admin" && password != "rahasia") {
        check = "passwordsalah";
        res.redirect('/loginadmin');
    } else if (username != "admin" && password == "rahasia") {
        check = "usernamesalah";
        res.redirect('/loginadmin');
    } else {
        check = "keduanyasalah";
        res.redirect('/loginadmin');
    }
});
app.get('/admin', function (req, res) {
    if (user == true) {
        // nanti pakek waktu beberapa detik supaya ada session
        setTimeout(function () {
            user = false;
            sesi = "habis";
        }, 100000);
        res.sendFile(__dirname + '/tables.html');
    } else {
        res.redirect('/loginadmin');
    }
});


app.get('/app', function (req, res) {
    res.sendFile(__dirname + '/app.html');
});
app.get('/riwayatTransaksi', function (req, res) {
    res.sendFile(__dirname + '/transaksi.html');
});
app.get('/products', function (req, res) {
    res.send({
        products: products
    });
});

// ajax client side
app.get('/clientItem', function (req, res) {
    res.send({
        clientItem: clientItem
    });
});
// akhir ajax
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/404.html');
});


io.on('connection', function (socket) {
    if (check == "keduanyasalah") {
        socket.emit('salah 2');
        check = "";
    } else if (check == "passwordsalah") {
        socket.emit('salah password');
        check = "";
    } else if (check == "usernamesalah") {
        socket.emit('salah username');
        check = "";
    }
    if(sesi == "habis"){
        socket.emit('sesi habis');
        sesi = "";
    }

    // menerima emit dari client index.js 
    socket.on('client emit',function(indexClient, namaClient, npwpClient,kerjaClient,totalClient,alamatClient,timestampClient,emailClient,statusClient,kelaminClient,tanggunganClient){
        clientItem.push({
            indexClient: indexClient,
            namaClient: namaClient,
            npwpClient: npwpClient,
            kerjaClient: kerjaClient,
            totalClient: totalClient,
            alamatClient: alamatClient,
            timestampClient : timestampClient,
            emailClient : emailClient,
            statusClient : statusClient,
            kelaminClient : kelaminClient,
            tanggunganClient : tanggunganClient
        })

        io.emit('clientPush');
    });
    // akhir menerima emit

    socket.on('chat message', function (nama, npwp, kerja, total, alamat,email,status,kelamin,tanggungan) {
        //increment block index
        index = index + 1;
        //bikin timestamp
        var dateobj = new Date();
        var timestamp = dateobj.toUTCString();
        var time = dateobj.toDateString() + ' ' + dateobj.getHours() + ':' + dateobj.getMinutes() + ':' + dateobj.getSeconds();
        //generate salt
        var salt = generateSalt(index);

        //bikin nonce
        var nonce = SHA256(nama + npwp + kerja + total + alamat +email +status + kelamin +tanggungan + salt).toString();

        //bikin hash
        var hash = SHA256(index.toString() + nama + npwp + kerja + total + alamat + email + status + kelamin + tanggungan + timestamp + nonce + previous_hash).toString();

        var block = {
            'index': index,
            'nama': nama,
            'npwp': npwp,
            'kerja': kerja,
            'total': total,
            'alamat': alamat,
            'email' : email,
            'status' : status,
            'kelamin' : kelamin,
            'tanggungan' : tanggungan,
            'timestamp': timestamp,
            'nonce': nonce,
            'hash': hash,
            'previous_hash': previous_hash
        };

        // ini baru simpanan
        products.push({
            index: index,
            nama: nama,
            kerja: kerja,
            npwp: npwp,
            total: total,
            time: time,
            alamat : alamat,
            email : email,
            status : status,
            kelamin : kelamin,
            tanggungan : tanggungan
        })

        io.emit('tablesEvent');
        // akhir baru simpanan

        // Encrypt
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(block), 'kunci rahasia').toString();
        console.log("Menerima satu transaksi");
        console.log('data input:', ciphertext);
        console.log(' ');
        io.emit('clientEvent', ciphertext);
        previous_hash = hash;
    });
});




http.listen(3000, function () {
    console.log('listening on *:3000');
});
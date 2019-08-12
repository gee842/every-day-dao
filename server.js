/*jshint esversion: 8 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const MAIL_ACCOUNT_FILE = './mail-account.txt';
const DAO_SAYINGS_FILE = './dao.txt';
const MAILING_FILE = './list.csv';
var mailing_list = [];
var url = require("url");
const schedule = require('node-schedule');
var querystring = require('querystring');
const port = 800;
const http = require('http');

function read_mailing_list(file_to_read) {
    let splitArray;
    fs.readFile(file_to_read, function (err, buff) {
        if (err) {
            console.log(err);
        }
        splitArray = buff.toString().split(/\r?\n|\r/);
        for (let i = 0; i < splitArray.length; i++) {
            splitArray[i] = splitArray[i].split(',');
            mailing_list.push(splitArray[i]);
        }
        sendIfHour(mailing_list);
    });
}

function sendIfHour(mail_list){
    hourNow = new Date().getHours();
    let emails_to_send = [];
    for (let i = 0; i<mail_list.length-1; i++){
        if (hourNow == parseInt(mail_list[i][1])){
            emails_to_send.push(mail_list[i][0]);
        }
    }
    console.log(emails_to_send);
    getDao(DAO_SAYINGS_FILE,MAIL_ACCOUNT_FILE,emails_to_send);

}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function readEmailFile(file_to_read, selected_saying, to_send) {
    var mailAccount = 
        {service:'',
        user:'',
        pass:'',};
    var splitBuffer;
    fs.readFile(file_to_read, function (err, buff) {
    if (err) {
        console.log(err);
    }
    splitBuffer = buff.toString().split('\n');
    mailAccount.service = splitBuffer[0].replace(/\r?\n|\r/, '');
    mailAccount.user = splitBuffer[1].replace(/\r?\n|\r/, '');
    mailAccount.pass = splitBuffer[2].replace(/\r?\n|\r/, '');
        register_handler(mailAccount.service, mailAccount.user, mailAccount.pass, selected_saying, to_send);
});
}

function register_handler(serv, usr, pwd, selected_saying, to_send){
    var mailOptions;
    let transporter = nodemailer.createTransport({
        service: serv,
        secure: true,
        auth: {
            user: usr,
            pass: pwd
        }
    });
    mailOptions = {
        from: usr,
        to: usr,
        bcc: to_send,
        subject: "The Daily Dao: Verse " + selected_saying.split(':')[0],
        html: selected_saying
    };
    sendEmail(transporter,mailOptions);
}

function sendEmail(transporter,mailOptions)
{
    transporter.sendMail(mailOptions,function(err,info){
        if (err){
            console.log(err);
        }
        else{
            console.log(info);
        }
        mailing_list=[];
    });
}

function getDao(file_to_read,mailer_account,to_send){
    let splitBuffer;
    let splitArray;
    fs.readFile(file_to_read, function (err, buff) {
        if (err) {
            console.log(err);
        }
        splitBuffer = buff.toString().replaceAll(/\r?\n|\r/, ' ');
        splitBuffer = splitBuffer.toString().replaceAll('.', '. <br/><br/>');
        splitArray = splitBuffer.split(/      /);
        for (let i = 0; i<splitArray.length;i++){
            splitArray[i] = splitArray[i].replace(' ', ': <br/><br/>');
        }
        selected_saying = splitArray[Math.floor(Math.random()*splitArray.length)];
        console.log(selected_saying);
        readEmailFile(mailer_account, selected_saying, to_send);
    });
}

function register(email){
    let register_hour = new Date().getHours();
    let payload = email.replaceAll(/\n/, "").replaceAll(/<[\s\S]*?>/, "") + ',' + register_hour.toString() + '\n';
    fs.appendFile(MAILING_FILE, payload, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    getDao(DAO_SAYINGS_FILE, MAIL_ACCOUNT_FILE, [email.replaceAll(/\n/, "").replaceAll(/<[\s\S]*?>/, "")]);
}

function unsub(email){
    let splitArray;
    let finalList = [];
    email = email.replaceAll(/\n/, "").replaceAll(/<[\s\S]*?>/, "");
    fs.readFile(MAILING_FILE, function (err, buff) {
        if (err) {
            console.log(err);
        }
        splitArray = buff.toString().split(/\r?\n|\r/);
        for (let i = 0; i < splitArray.length; i++) {
            splitArray[i] = splitArray[i].split(',');
            if (splitArray[i][0] != email && splitArray[i][0] != ''){
                finalList.push(splitArray[[i]]);
            }
        }
        console.log(finalList);
        fs.writeFile(MAILING_FILE,'',(err)=>{
            for (let k = 0; k<finalList.length;k++){
                fs.appendFile(MAILING_FILE, finalList[k]+'\n', (err)=> {
                    if (err) throw err;
                    console.log('Appended!');
                });
            }
            console.log(err);
        });
    });

}

var instructionsNewVisitor = function (req, res) {
    var params = querystring.parse(url.parse(req.url).query); //parses params
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
    });
    if ('action' in params) {

        if (params.action == "register") {
            if (params.email != ''){
                register(params.email);
                res.end('Registered!');
            }
            else{
                res.end();
            }




        } else if (params.action == "unsub") {
            if (params.email != '') {

                unsub(params.email);
                res.end('Unsubscribed!');

            }
            else{
                res.end();
            }
        }

    }
};


//register('ab\n<script> ffgdfs </script>\nc@gmail.com');

var server = http.createServer(instructionsNewVisitor);

server.listen(process.env.PORT || port);
console.log("Listening on Port " + (process.env.PORT || port));

var mail_timer = schedule.scheduleJob('0 * * * *' , ()=>{
    read_mailing_list(MAILING_FILE);
});

// read_mailing_list(MAILING_FILE);
// getDao(DAO_SAYINGS_FILE);
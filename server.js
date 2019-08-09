/*jshint esversion: 8 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const MAIL_ACCOUNT_FILE = './mail-account.txt';
const DAO_SAYINGS_FILE = './dao.txt';
var mailing_list = ['deckenball@gmail.com'];

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function readEmailFile(file_to_read, selected_saying) {
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
    register_handler(mailAccount.service, mailAccount.user, mailAccount.pass, selected_saying);
});
}

function register_handler(serv,usr,pwd,selected_saying){
    var mailOptions;
    let transporter = nodemailer.createTransport({
        service: serv,
        auth: {
            user: usr,
            pass: pwd
        }
    });
    mailOptions = {
        from: usr,
        to: mailing_list,
        subject: "The Daily Dao- " + selected_saying.split(':')[0],
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
    });
}

function getDao(file_to_read){
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
        readEmailFile(MAIL_ACCOUNT_FILE,selected_saying);
    });


}
getDao(DAO_SAYINGS_FILE);
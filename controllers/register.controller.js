const UserModel = require('../models/user.model');
const emailActivity = require('./emailActivity.controller');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const speakeasy = require("speakeasy");
const config = require('../config')
const CryptoJS = require("crypto-js");
const requestIp = require('request-ip');
let referralCodeGenerator = require('referral-code-generator');


exports.userRegister = async (req, res) => {
    console.log('register')
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }
        let getUsersEmail = await UserModel.getUsersDetails(req.body.email);
        let getUsersaddress = await UserModel.getUsersDetailsAddress(req.body.bnb_address);
        let referral_address = "";
        let referral_id = "";
        let referral_code = referralCodeGenerator.alphaNumeric('uppercase', 3, 2);
        if (req.body.referral_address) {
            referral_address = req.body.referral_address;
            let getRefUsersDetails = await UserModel.getUserDetailsByAddress(req.body.referral_address);
            if (getRefUsersDetails.length == 0) {
                return res.status(200).send({
                    success: false,
                    msg: "Refferal address not valid please enter valid address!!"
                });
            }
            referral_id = getRefUsersDetails[0].id;
        }
        // Please connect metamask
        let errMsg = '';
        if (getUsersEmail.length > 0) {
            if (getUsersEmail.length > 0 && getUsersEmail[0].email == req.body.email) {
                errMsg = "Email already registered! Try with new email.";
            } 
            // else if (getUsersaddress.length > 0 && req.body.bnb_address.toUpperCase() == getUsersaddress[0].bnb_address.toUpperCase()) {
            //     errMsg = "Wallet address already registered! Try with new address.";
            // }
            return res.status(200).send({
                success: false,
                msg: errMsg
            });
        } else {

            const Token = jwt.sign({
                email: req.body.email
            }, config.JWT_SECRET_KEY)

            // let mailmsg = `
            // <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
            //     <h2>Please <a href='${config.mailUrl}verifyAccount/${Token}'>click here </a> to activate your account</h2>
            // </div>`
            let headerMSG =`You're almost there!`
            let headerMSG1 = `Silky Exchange is delighted to have you on board ! <br/>To start exploring Silky Exchange, please confirm your Email address.`
            let mailmsg = `
                <h2>Please <a href='${config.mailUrl}verifyAccount/${Token}'>click here </a> to activate your account</h2>`
        
            let mailMsg = emailActivity.Activity(req.body.email, 'Account Activation Link',headerMSG,headerMSG1, mailmsg);
            if (mailMsg) {
                
            let secret = speakeasy.generateSecret({ length: 20 });
                QRCode.toDataURL(secret.otpauth_url, async function (err, data_url) {
                    const hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);
                    // let kyc_document = (!req.files['kyc_document']) ? null : req.files['kyc_document'][0].filename;
                    // let kyc_proof_of_address = (!req.files['kyc_proof_of_address']) ? null : req.files['kyc_proof_of_address'][0].filename;
                    let users = {
                        // "bnb_address": req.body.bnb_address,
                        "email": req.body.email,
                        "password": hash,
                        "googleAuthCode": secret.base32,
                        "QR_code": data_url,
                        "referred_by_id": referral_id,
                        "refer_by": referral_address,
                        "referral_code" : referral_code
                        // "kyc_document" : kyc_document,
                        // "kyc_proof_of_address" : kyc_proof_of_address
                    }
                    console.log('users',users)
                    let saveUserDetails = await UserModel.saveUserDetails(users);
                    console.log('saveUserDetails',saveUserDetails)
                    if (saveUserDetails) {

                        // Add new record in business_calculation table
                        let businessCalculationArr = {
                            'user_id' : referral_id,
                            'direct_referral_id' : saveUserDetails
                        }
                        await UserModel.saveBusinessCalculationArr(businessCalculationArr);

                        // Insert Activity
                        await UserModel.insertActivity({
                            "user_id": saveUserDetails,
                            "activity_type": 'Register',
                            "ip": requestIp.getClientIp(req)
                        });

                        return res.status(200).send({
                            success: true,
                            msg: "Verification Link Sent on Email , Please Verify to Register!!"
                        });
                    } else {
                        return res.status(200).send({
                            success: false,
                            msg: "Something went wrong please try again."
                        });
                    }
                });
            // } else {
            //     return res.status(200).send({
            //         success: false,
            //         msg: "Something went wrong please try again."
            //     });
            // }
        }
    }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "User not registered due to internal error",
            err
        });
    }
}

exports.addNewsLetter = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let getNewsLetter = await UserModel.getNewsLetter(req.body.email);
    if (getNewsLetter.length > 0) {
        console.log('aaa');
        return res.status(200).send({
            success: false,
            msg: "Already Subscribed!!"
        });
    } else {
        let newsletter = await UserModel.addNewsLetter(req.body.email);
        if (newsletter) {
            return res.status(200).send({
                success: true,
                msg: "Subscribed successfully!!",
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "Something went wrong please try again!!"
            });
        }
    }
}

exports.contactFormRequest = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }

    let contactRequest = await UserModel.addcontactRequest(req.body);
    if (contactRequest) {
        return res.status(200).send({
            success: true,
            msg: "Contact request submited!!",
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again!!"
        });
    }
}
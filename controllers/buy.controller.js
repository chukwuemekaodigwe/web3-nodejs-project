const UserModel = require('../models/user.model');
const BuyModel = require('../models/buy.model');
const stackModel = require('../models/stack.model');
const requestIp = require('request-ip');
const config = require('../config')
const { validationResult } = require('express-validator');
const fetch = require('node-fetch');
const emailActivity = require('./emailActivity.controller');
const CryptoJS = require("crypto-js");

exports.getActivePhase = async (req, res) => {
    try {
        let getActivePhaseData = await BuyModel.getActivePhase();
        if (getActivePhaseData.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get phase details",
                data: getActivePhaseData[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}




exports.stripePayment = async (req, res) => {
    try {
        // Check validations
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }
        let getUserDetails = await BuyModel.getUserDetails(req.user_id);
        let getSettingData = await BuyModel.getSettingData(); // Get locking duration details
      
        const response4 = await fetch(`${config.stripe_url}create-card`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${config.stripe_key}`
            },
            body: JSON.stringify({
                "cardNumber": `${req.body.cardNumber}`,
                "expMonth": `${req.body.expMonth}`,
                "expYear": `${req.body.expYear}`,
                "cvc": `${req.body.cvc}`
            })
        });

        const data4 = await response4.json();
        var cardid = data4.CardID;
        // console.log('data4',data4);
        // console.log("cardid " + cardid);
        if (data4.success == false) {
            return res.status(200).send({
                success: false,
                data: data4,
                msg: data4.message
            });
        }

        const response1 = await fetch(`${config.stripe_url}create-customer`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${config.stripe_key}`
            },
            body: JSON.stringify({
                "name": `${getUserDetails[0].first_name}`,
                "email": `${getUserDetails[0].email}`,
                "address": {
                    line1: 'Silky Exchange',
                    postal_code: 'Silky Exchange',
                    city: 'Silky Exchange',
                    state: 'CA',
                    country: 'US',

                }
            })
        });

        const data1 = await response1.json();
        var customerID = data1.CustomerID;
        // console.log('data1',data1);

        const response2 = await fetch(`${config.stripe_url}capture-payment`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${config.stripe_key}`
            },
            body: JSON.stringify({
                "cardId": `${cardid}`,
                "customerId": `${customerID}`,
                "amount": `${Math.round(req.body.amount * 100)}`,
                "currency": "INR",//req.body.currency,
                "description": "Amount"
            })
        });
        const data2 = await response2.json();
        // console.log('data2',data2);
        if (data2.success == 'false') {
            return res.status(200).send({
                success: false,
                msg: data2.message
            });
        }

        const response3 = await fetch(`${config.stripe_url}confirm-capture-payment`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `${config.stripe_key}`
            },
            body: JSON.stringify({
                "paymentId": `${data2.paymentId}`
            })
        });
        const data3 = await response3.json();
        // console.log('data3',data3);

        if (data3.success) {

            let token = req.body.token;
        
            req.body.usd_amount = parseFloat(token) * 1;
            req.body.user_id = req.user_id;
            req.body.fee = parseFloat(token*getSettingData[0].deposit_fee/100).toFixed(2);
            req.body.token = req.body.token-req.body.fee 
            req.body.amount = req.body.amount-parseFloat(req.body.amount*getSettingData[0].deposit_fee/100).toFixed(2)        
            let insertTrx = await BuyModel.insertPurchaseTrx(req.body); // Insert buy transaction
    

            if (insertTrx.insertId) {
                
                let refPercentage = 0;
                let refPercentage1 = 0;
                let getSettingData = await BuyModel.getSettingData(); // Get locking duration details
                if (getSettingData) {
                    refPercentage = getSettingData[0].referral_percent;
                    refPercentage1 = getSettingData[0].referral_percent1;
                    req.body.locking_duration = getSettingData[0].locking_duration;
                } else {
                    req.body.locking_duration = 9;
                    refPercentage = 4;
                }
            
                // Get buyer vesting balance
                let mailmsg = `<p style="margin:0px;color:#212529;line-height:28px;font-size:16px;word-wrap:break-word">You have successfully Processed your payment of INR ${req.body.amount} !<br/>
                Your purchase request is in process, It will be processed in next 48 hours! <br/>         
                Thank you For using Silky Exchange.</p>`
                let headerMSG = `Transaction Sucessfully!`
                let headerMSG1 = ``
                
                let mailMsg = emailActivity.Activity(getUserDetails[0].email, 'SLC Token Purchase',headerMSG,headerMSG1, mailmsg);
              
                if (getUserDetails[0].refid && getUserDetails[0].refer_by) {
                    let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage / 100).toFixed(2);
                    let refArr = {
                        'user_id': getUserDetails[0].refid,
                        'bnb_address': getUserDetails[0].refer_by,
                        'amount': refTokenPercentageAmount,
                        'from': getUserDetails[0].bnb_address,
                        'refPercentage': refPercentage,
                        'ip': requestIp.getClientIp(req)
                    }
                    await BuyModel.referralTokenCredited(refArr); // Referral token credited 
                    await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid);
    
                }
                            if (getUserDetails[0].refid2) {
                    let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage1 / 100).toFixed(2);
                    let refArr = {
                        'user_id': getUserDetails[0].refid2,
                        'bnb_address': null,
                        'amount': refTokenPercentageAmount,
                        'from': getUserDetails[0].bnb_address,
                        'refPercentage': refPercentage1,
                        'ip': requestIp.getClientIp(req)
                    }
                    await BuyModel.referralTokenCredited(refArr); // Referral token credited 
                    await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid2);
    
                }
    
                if (getUserDetails[0].id) {
                    let stacking_balance = getUserDetails[0].balance;
                    let purchaseToken = req.body.token;
                    let totalToken = parseInt(stacking_balance) + parseInt(purchaseToken);
    
                    Percentage = getSettingData[0].percent;
                    duration = getSettingData[0].duration;
                    
                    // let StackingBalance = await stackModel.submitStacking(req.body,Percentage,duration); // Update buyer vesting balance
                   
                    let updateBalance = await BuyModel.updateBalance(totalToken, req.user_id); // Update buyer vesting balance
                   
                    if (updateBalance.affectedRows) {
    
                        // Insert Activity
                        await UserModel.insertActivity({
                            "user_id": req.user_id,
                            "activity_type": 'Token Purchased',
                            "ip": requestIp.getClientIp(req)
                        });

                        // return res.status(200).send({
                        //     success: true,
                        //     msg: data3.message
                        // });
    
                        let updateTrx = await BuyModel.updatePurchaseTrx(data3.paymentId,data3.receipt_url,insertTrx.insertId);
                        // console.log(updateTrx)
                        return res.status(200).send({
                            success: true,
                            msg: "Token purchased!!."
                        });
                    } else {
                        return res.status(200).send({
                            success: false,
                            msg: "Something went wrong please try again."
                        });
                    }
                }
            }
           

        }
        else {
            return res.status(200).send({
                success: false,
                msg: data3.message
            });
        }

 

       
    } catch (error) {
        console.log('error',error);
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}










exports.tokenPurchase = async (req, res) => {
    try {
        // Check validations
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }
        
        let getTokenPurchase = await BuyModel.getTokenCheckTransactionId(req.body.transaction_id);
        if (getTokenPurchase.length > 0) {
            
            return res.status(200).send({
                success:false,
                msg: "This transaction id Already used",
            });
        }
        // let refPercentage = 0;
        // let refPercentage1 = 0;
        let getSettingData = await BuyModel.getSettingData(); // Get locking duration details
        // if (getSettingData) {
        //     refPercentage = getSettingData[0].referral_percent;
        //     refPercentage1 = getSettingData[0].referral_percent1;
        //     req.body.locking_duration = getSettingData[0].locking_duration;
        // } else {
        //     req.body.locking_duration = 9;
        //     refPercentage = 4;
        // }

        let token = req.body.token;
        req.body.usd_amount = parseFloat(token) * 1;

        let image=(!req.files['image']) ? null : req.files['image'][0].filename;
        req.body.image =image;
        req.body.user_id = req.user_id;
        req.body.bnb_address = req.bnb_address;
        req.body.transaction_id = req.body.transaction_id;
        req.body.fee = parseFloat(token*getSettingData[0].deposit_fee/100).toFixed(2);
        req.body.token = req.body.token-req.body.fee 
        req.body.amount = req.body.amount-parseFloat(req.body.amount*getSettingData[0].deposit_fee/100).toFixed(2)        
        let insertTrx = await BuyModel.insertPurchaseTrx(req.body); // Insert buy transaction
        if (insertTrx.insertId) {
            
            let getUserDetails = await BuyModel.getUserDetails(req.user_id); // Get buyer vesting balance
            let mailmsg = `<p style="margin:0px;color:#212529;line-height:28px;font-size:16px;word-wrap:break-word">You have successfully Processed your payment of INR ${req.body.amount} !<br/>
            Your purchase request is in process, It will be processed in next 48 hours! <br/>         
            Thank you For using Silky Exchange.</p>`
            let headerMSG = `Transaction Sucessfully!`
            let headerMSG1 = ``
            
            let mailMsg = emailActivity.Activity(getUserDetails[0].email, 'SLC Token Purchase',headerMSG,headerMSG1, mailmsg);
          
            // if (getUserDetails[0].refid && getUserDetails[0].refer_by) {
            //     let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage / 100).toFixed(2);
            //     let refArr = {
            //         'user_id': getUserDetails[0].refid,
            //         'bnb_address': getUserDetails[0].refer_by,
            //         'amount': refTokenPercentageAmount,
            //         'from': getUserDetails[0].bnb_address,
            //         'refPercentage': refPercentage,
            //         'ip': requestIp.getClientIp(req)
            //     }
            //     await BuyModel.referralTokenCredited(refArr); // Referral token credited 
            //     await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid);

            // }
            //             if (getUserDetails[0].refid2) {
            //     let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage1 / 100).toFixed(2);
            //     let refArr = {
            //         'user_id': getUserDetails[0].refid2,
            //         'bnb_address': null,
            //         'amount': refTokenPercentageAmount,
            //         'from': getUserDetails[0].bnb_address,
            //         'refPercentage': refPercentage1,
            //         'ip': requestIp.getClientIp(req)
            //     }
            //     await BuyModel.referralTokenCredited(refArr); // Referral token credited 
            //     await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid2);

            // }

            if (getUserDetails[0].id) {
                let stacking_balance = getUserDetails[0].balance;
                let purchaseToken = req.body.token;
                let totalToken = parseInt(stacking_balance) + parseInt(purchaseToken);

                Percentage = getSettingData[0].percent;
                duration = getSettingData[0].duration;
                
                // let StackingBalance = await stackModel.submitStacking(req.body,Percentage,duration); // Update buyer vesting balance
               
                // let updateBalance = await BuyModel.updateBalance(totalToken, req.user_id); // Update buyer vesting balance
               
                if (getUserDetails[0].id) {

                    // Insert Activity
                    await UserModel.insertActivity({
                        "user_id": req.user_id,
                        "activity_type": 'Token Purchased',
                        "ip": requestIp.getClientIp(req)
                    });

                    return res.status(200).send({
                        success: true,
                        msg: "Token purchased!!."
                    });
                } else {
                    return res.status(200).send({
                        success: false,
                        msg: "Something went wrong please try again."
                    });
                }
            }
        }
    } catch (error) {
        console.log('error',error);
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.getTokenPurchase = async (req, res) => {
    try {
        let getTokenPurchase = await BuyModel.getTokenPurchase(req.user_id);
        if (getTokenPurchase.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Purchase List",
                data: getTokenPurchase
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    } catch (err) {
        console.log('err',err)
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}
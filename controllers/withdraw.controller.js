const WithdrawModel = require('../models/withdraw.model');
const UserModel = require('../models/user.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');
const CryptoJS = require("crypto-js");

exports.userWithdraw = async (req, res) => {
    try {
        // Check validations
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }

        req.body.user_id = req.user_id;
        req.body.bnb_address = req.body.bnb_address;
        
        console.log('req',req.body.bnb_address)
        req.body.ip = requestIp.getClientIp(req);
        let settingData = await WithdrawModel.settingData(req.user_id);
        console.log(req.body.tokenAmount,settingData[0].todayWithdraw,settingData[0].daily_max_withdraw);
        if((parseFloat(req.body.tokenAmount)+parseFloat(settingData[0].todayWithdraw))>parseFloat(settingData[0].daily_max_withdraw)){
            return res.status(200).send({
                success: false,
                msg: "Withdraw limit exeeded!!",
            });
        }

        let userWithdrawable = await WithdrawModel.getUserWithdrawableBalance(req.user_id); // get User withdrawable balance
        if (userWithdrawable[0].balance) {
            console.log(userWithdrawable[0].balance , req.body.tokenAmount);
            if (parseFloat(userWithdrawable[0].balance) < parseFloat(req.body.tokenAmount)) { // Check available balance
                return res.status(200).send({
                    success: false,
                    msg: "You don't have sufficient balance!",
                });
            }
        } else {
            return res.status(200).send({
                success: false,
                msg: "Something went wrong please try again!",
            });
        }
        
        
        
        await WithdrawModel.updateBalance(req.body); // Update user balance

 console.log('req.body.bnbAmount123',req.body.bnbAmount)

        // req.body.fee = req.body.bnbAmount>0 ? parseFloat(req.body.bnbAmount*settingData[0].deposit_fee/100).toFixed(2) :parseFloat(req.body.tokenAmount*settingData[0].deposit_fee/100).toFixed(2)
        // req.body.bnbAmount = req.body.bnbAmount-parseFloat(req.body.bnbAmount*settingData[0].deposit_fee/100).toFixed(2)        
        // req.body.tokenAmount = req.body.bnbAmount==0 ? req.body.tokenAmount-parseFloat(req.body.tokenAmount*settingData[0].deposit_fee/100).toFixed(2) :req.body.tokenAmount;       
      
       req.body.fee = req.body.type==1 ? parseFloat(req.body.bnbAmount*settingData[0].deposit_fee/100).toFixed(2) :((parseFloat(req.body.tokenAmount*settingData[0].deposit_fee)/100)).toFixed(2)
       req.body.tokenAmount = req.body.type==2 ? parseFloat(req.body.tokenAmount - req.body.fee).toFixed(2):req.body.tokenAmount
       req.body.bnbAmount = req.body.type==1 ? parseFloat(req.body.bnbAmount - req.body.fee).toFixed(2):req.body.tokenAmount

        console.log('req.body.bnbAmount',req.body.bnbAmount)

        let result = await WithdrawModel.userWithdraw(req.body);
        if (result.insertId) {

          
            // Insert Activity
            await UserModel.insertActivity({
                "user_id": req.user_id,
                "activity_type": 'Withdraw Request',
                "ip": requestIp.getClientIp(req)
            });

            return res.status(200).send({
                success: true,
                msg: "Please allow us 2 - 5 Business Days to Process your Request. Once Approved, It may take upto 14 days to reflect the Amount in your Bank Account. Incase, the Same is not reflected, Please Mail us at admin@silkyex.io.",
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "Something went wrong please try again!",
            });
        }
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            msg: "Server Error",
            error
        });
    }
}

exports.getWithdrawList = async (req, res) => {
    try {
        let withdrawList = await WithdrawModel.getWithdrawList(req.user_id);
        // console.log('withdrawlist',withdrawList,req.user_id)
        if (withdrawList) {
            return res.status(200).send({
                success: true,
                msg: "Withdraw List!",
                data: withdrawList
            });
        }else{
            return res.status(200).send({
                success: false,
                msg: "No Data found!",
            });
        }
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            msg: "Server Error",
        });
    }
}
const StackModel = require('../models/stack.model');
const UserModel = require('../models/user.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');
const CryptoJS = require("crypto-js");
const BuyModel = require ('../models/buy.model')

exports.submitStacking = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let amount = req.body.amount
    let getSettingData = await BuyModel.getSettingData(); 
    let fee = parseFloat(amount*getSettingData[0].deposit_fee/100).toFixed(2);
    req.body.fee = fee;
    console.log(req.body.fee);
    req.body.amount = req.body.amount //-req.body.fee
    let result = await StackModel.updateUserBalance(req.body);
    if (result > 0) {
      await StackModel.submitStacking(req.body);

      // Insert Activity
      await UserModel.insertActivity({
        "user_id": req.user_id,
        "activity_type": 'Token Staking',
        "ip": requestIp.getClientIp(req)
      });

      return res.status(200).send({
        success: true,
        msg: "Token Stacked successfully!"
      });
    }
  }
  catch (error) {
    console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getUserStackingHistory = async (req, res) => {
  try {
    let result = await StackModel.getUserStackingHistory(req.body);
    return res.status(200).send({
      success: true,
      msg: "Stacking history!",
      data: result
    });
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getUserStackingHistorybyid = async (req, res) => {
  try {
    let result = await StackModel.getUserStackingHistorybyid(req.body);
    return res.status(200).send({
      success: true,
      msg: "Stacking history!",
      data: result
    });
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getStackingPrice = async (req, res) => {
  try {
    let result = await StackModel.getStackingPrice(req.body);
    return res.status(200).send({
      success: true,
      msg: "Stacking Prices!",
      data: result
    });
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getEarningHistory = async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    let result = await StackModel.getEarningHistory(req.body);
    return res.status(200).send({
      success: true,
      msg: "History!",
      data: result
    });
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}
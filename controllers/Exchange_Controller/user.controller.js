const config = require('../../config');
const userModel = require('../../models/Exchange Model/user.model');
const { validationResult } = require('express-validator');
var nodemailer = require('nodemailer')
const emailActivity = require('../emailActivity.controller');
const AdminModel = require('../../models/admin.model');
const orderLogic = require('../orderLogic');
var speakeasy = require("speakeasy");



const mysql = require('mysql2');
// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
const CryptoJS = require("crypto-js");

exports.getusernotification = async (req, res) => {
  try {
    let getusernotification = await userModel.getusernotification(req.body);
    if (getusernotification.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "User Notification details",
        data: getusernotification
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getuserdevice = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getuserdevice = await userModel.getuserdevice(req.body);
    if (getuserdevice.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Device Management details",
        data: getuserdevice,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getDeviceDetail = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getDeviceDetail = await userModel.getDeviceDetail(req.body);
    if (getDeviceDetail.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Device Management details",
        data: getDeviceDetail,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.insertDeviceDetail = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    var location = null;
    var ip_address = null;
    let result = await userModel.insertDeviceDetail(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Inserted successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
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


exports.userWallet = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let userwallet = await userModel.userWallet(req.body);
    if (userwallet.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "user Wallet details",
        response: userwallet,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    // console.log('err', err)
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getuserdepositinr = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getuserdepositinr = await userModel.getuserdepositinr(req.body);
   
    if (getuserdepositinr.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "user INR details",
        response: getuserdepositinr,
      });
    } else {
      console.log("getReferralIncomeList",getuserdepositinr);
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    console.log('err', err)
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};


exports.getICOTransfer = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getICOTransfer = await userModel.getICOTransfer(req.body);
   
    if (getICOTransfer.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "user ICO transfer details",
        response: getICOTransfer,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    console.log('err', err)
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};


exports.favoritepair = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let favoritepair = await userModel.favoritepair(req.body);
    // if (favoritepair.length > 0) {
    //   return res.status(200).send({
    //     success: true,
    //     msg: "Favourite Pair details",
    //     data: favoritepair,
    //   });

    // } 
    if (favoritepair.length > 0) {
      let removePair = await userModel.removePair(req.body);
      return res.status(200).send({
        success: true,
        msg: "Pair removed to favorite",
      });
    }
    else {
      var datetime = new Date();

      let addPair = await userModel.addPair(req.body, req.datetime);
      return res.status(200).send({
        success: true,
        msg: "Favourite Pair added successfully",
      });
    }
  }

  catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getfavoritepair = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getfavoritepair = await userModel.getfavoritepair(req.body);
    if (getfavoritepair.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "favorite pair details",
        response: getfavoritepair,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    // console.log('err', err)
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getQR = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let getQR = await userModel.getQR(req.body);
    if (getQR.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "favorite pair details",
        data: getQR[0],
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
  }
}


exports.orderBook = async (req, res) => {

  var pair_id = req.body.pair_id;
  if (!pair_id) {
    return res.status(400).send({
      success: false,
      msg: "pairID required "
    });
  }
  // console.log('pair_id: ' + pair_id,req.body)
  let orderbookdetail = await userModel.orderBook(pair_id);
  if (orderbookdetail.length > 0) {
    return res.status(200).send({
      success: true,
      msg: "Order Book Details",
      response: orderbookdetail,
    });
  } else {
    return res.status(200).send({
      success: false,
      msg: "No data found",
    });
  }
}

exports.getUserOrder = async (req, res) => {

  var user_id = req.body.user_id;

  try {
    if (!user_id) {
      return res.status(400).send({
        success: false,
        msg: "UserID required "
      });
    }

    let userOrder = await userModel.getUserOrder(user_id);
    if (userOrder.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "User Order List",
        response: userOrder,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }



  } catch (error) {
    // console.log(error)

  }
}

exports.coinList = async (req, res) => {

  let coinlist = await userModel.coinList();
  if (coinlist.length > 0) {
    return res.status(200).send({
      success: true,
      msg: "Coin List",
      response: coinlist,
    });
  } else {
    return res.status(200).send({
      success: false,
      msg: "No data found",
    });
  }

};


exports.pairList = async (req, res) => {

  var search = req.body.search;
  var user_id = (!req.body.user_id) ? 0 : req.body.user_id;
  var left_coin_id = req.body.left_coin_id

  if (search === "/FAVORITE") {


    let coinlist = await userModel.getCoinListData(user_id);
    if (coinlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Pair List",
        response: coinlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }

  }

  else if (search) {


    let coinlist = await userModel.getCoinList(user_id, '%' + search + '%');
    if (coinlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Pair List",
        response: coinlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }

  }
  else if (left_coin_id) {


    let coinlist = await userModel.leftCoinList(left_coin_id);
    if (coinlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Pair List",
        response: coinlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  }

  else {


    let pairlist = await userModel.pairList(user_id);
    if (pairlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Pair List",
        response: pairlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }


  }
}

exports.getUserPiarBalance = async (req, res) => {

  var user_id = req.body.user_id;
  var pair_id = req.body.pair_id;


  let pairlist = await userModel.getUserPiarBalance(pair_id, user_id, user_id);
  if (pairlist.length > 0) {
    return res.status(200).send({
      success: true,
      msg: "Pair List",
      response: pairlist[0],
    });
  } else {
    return res.status(200).send({
      success: false,
      msg: "No data found",
    });
  }



};

exports.Email_otp = async (req, res) => {

  var email = req.body.email;
  var email_otp = req.body.email_otp;
  var email_auth = req.body.email_auth
  var email_otp_login = req.body.email_otp_login
  var ip = req.body.ip;
  var city = req.body.city;
  var country = req.body.country;
  var browsername = req.body.browsername;
  var browserversion = req.body.browserversion;
  var datetime = new Date()

  if (email_otp == 0 || email_otp == '' || email_otp == null || !email_otp) {
    var otp = Math.floor(Math.random() * 100000);

    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //        user: `norepaly@platinx.exchange`,
    //        pass: `mtqksncakhgumgeq`
    //     }
    //  });

    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
    //   auth: {
    //     user: 'developer@espsofttech.com',
    //     pass: 'Yd32r&DXa'
    // },
        auth: {
         user: 'admin@silkyex.io',
         pass: 'qcsaqqrqxbxsoxhm'
     },
      tls: {
        rejectUnauthorized: false
      }
    });

    var mailOptions = {
      from: 'admin@silkyex.io',
      //   from : 'bilal.espsofttech@gmail.com', 
      to: `${email}`,
      subject: 'Email  Verification Code',
      html: `<div style="background-color:#f4f4f4">
            <h2>[SilkyExchange] Verification code : ${otp} </h2>
            <h3>If this was not you, please inform Support. Beware of scam calls and SMS phishing. Verify sources with SilkyExchange Verify.</h3>
           <div>
        `
    }
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        //   console.log(error);
      } else {
        console.log('Email sent: ' + info.response);

      }
    })
    // var useremail = {
    //     email_otp: otp,
    // }
    req.body.email_otp = otp
    // await db.query(authQueries.updateUserData, [useremail, email])
    //   var useremail = {
    //     email_otp: otp,
    // }
    // var email_otp = otp;
    let result = await userModel.updateUserDatas(req.body);

    return res.status(200).send({

      otp: true,
      msg: "We have sent verification code !!",

    });

  } else {

    // await db.query(authQueries.getSingalUser, [email], async function (error, result) {
    let result = await userModel.getSingalUser(req.body); {
      // console.log("result",result);
      if (email_otp == result[0].email_otp) {
        // var useremail = {
        //   email_auth: email_auth,
        // }
        // await db.query(authQueries.updateUserData, [useremail, email])
        let result = await userModel.updateUserData(req.body.email);

        if (result) {
          // db.query(authQueries.getUsersEmail, email, async function (error, user) 
          let getUsersEmail = await userModel.getUsersEmail(req.body)

          {

            if (email_otp_login == true) {
              emailActivity.Activity(email, 'Login Details', `Your account has been Logged-In IP- ${ip}, ${city},${country},${browsername},${browserversion} ${datetime}!`, getUsersEmail[0].first_name)
            }
            return res.status(200).send({
              success: true,
              msg: "Congratulation!! Your E-mail authentication  is done",
              logindata: {
                id: getUsersEmail[0].id,
                user_email: getUsersEmail[0].email,
                user_name: getUsersEmail[0].first_name,
                device_date: new Date(),
                is_kyc: getUsersEmail[0].is_kyc,
                is_enable_factor: getUsersEmail[0].is_enable_google_auth_code,
                email_auth: getUsersEmail[0].email_auth,
              }
            });

          }
        } else {
          return res.status(400).send({
            success: false,
            msg: "No Data"
          });
        }



      } else {
        return res.status(400).send({
          success: false,
          msg: "Code is wrong, Please Try Again"
        });
      }

    };

  }
}

exports.createOrder = async (req, res) => {

  var isMarket = (!req.body.isMarket) ? 0 : 1;
  var user_id = req.body.user_id;
  var pair_id = parseInt(req.body.pair_id);
  var price = (!req.body.price) ? 0 : parseFloat(req.body.price);
  var amount = parseFloat(req.body.amount);
  // var fee = parseFloat(req.body.fee);
  var order_type = req.body.type;
  var cal = (price > 0) ? price : 1;
  var totalAmount = amount * cal;

  if (!user_id || !pair_id || !amount || !order_type) {
    var required = (!user_id) ? 'user_id' : (!pair_id) ? 'pair_id' : (!amount) ? 'amount' : (!order_type) ? 'type' : '';
    return res.status(400).send({
      success: false,
      msg: `${required} required`
    });
  }
  try {

    let pairsData = ''
    if (order_type == 'BUY') {


      pairsData = await userModel.getBuyPairWithWalletBalance(pair_id, user_id)



    } else {

      pairsData = await userModel.getSellPairWithWalletBalance(pair_id, user_id)

    }


    if (pairsData.length > 0) {
      var bal = pairsData[0].Balance;
      var Symbol = pairsData[0].symbol;
      var left_coin_id = pairsData[0].left_coin_id;
      var right_coin_id = pairsData[0].right_coin_id;


      let result = await AdminModel.getSystemSetting();

      // console.log('leftCoin',result);

      // console.log('RightCoin',right_coin_result[0].trade_fee);


      if (order_type == 'BUY') {
        var fee = (totalAmount * result.trade_fee / 100);
        var withFeeAmount = (fee + totalAmount);



        //  var fee = (totalAmount*AdminFee/100);
        //   var fee =  0.00 //(totalAmount*right_coin_result[0].trade_fee/100);
        // var withFeeAmount = (fee+totalAmount);
      } else {
        var fee = (amount * result.trade_fee / 100);
        var withFeeAmount = (amount + fee);

        // var fee = (amount*AdminFee/100);
        // var fee =  0.00//(amount*Left_coin_result[0].trade_fee/100);
        // var withFeeAmount = (amount+fee);
      }



      if (order_type == 'BUY' && totalAmount > bal) {
        return res.status(400).send({
          success: false,
          msg: `Insufficient balance in your ${Symbol} wallet`
        });
      }
      // else if(order_type == 'BUY' && withFeeAmount > bal){
      //     return  res.status(400).send({
      //         success: false,
      //         msg: `Your wallet must have a minimum of ${withFeeAmount} ${Symbol}`
      //     });
      // }
      // console.log(withFeeAmount,amount,bal)
      if (order_type == 'SELL' && amount > bal) {
        return res.status(400).send({
          success: false,
          msg: `Insufficient balance in your ${Symbol} wallet`
        });
      }
      // else if(order_type == 'SELL' && withFeeAmount > bal){
      //     return  res.status(400).send({
      //         success: false,
      //         msg: `Your wallet must have a minimum of ${withFeeAmount} ${Symbol}`
      //     });
      // }

      // const [result_referral,fields_referral] = await promisePool.query(adminQueries.userreferral,[user_id]);

      //   var  referral_balance =  (fee*70/100);


      // var abc =   await  db.query(adminQueries.balanceaddupdate,[referral_balance,result_referral[0].user_id,left_coin_id])



      // var LimitBuyOrderListSQL = orderQueries.LimitBuyOrderList; 
      // var LimitSellOrderListSQL = orderQueries.LimitSellOrderList; 
      // var MarketBuyOrderListSQL = orderQueries.MarketBuyOrderList; 
      // var MarketSellOrderListSQL = orderQueries.MarketSellOrderList; 


      var rr = await orderLogic.LimitBuyOrderList(order_type, user_id, amount, withFeeAmount, isMarket, price, pair_id, fee, left_coin_id, right_coin_id, res);


    } else {
      res.status(400).send({
        success: false,
        msg: "Invalid Pair id"
      });
    }

  } catch (er) {
    console.log('error', er);
    res.status(400).send({
      msg: "Something went wrong! Please try again.",
      er
    });
  }
}

exports.cancelOrder = async (req, res) => {
  var user_id = req.body.user_id;
  var order_id = req.body.order_id;

  let orderDetail = await userModel.getOrderForCancel(user_id, order_id)

  let orderDetail1 = await userModel.getOrderForCancelcheck(order_id)

  if (orderDetail1.length == 0) {
    if (orderDetail.length > 0) {
      let cancelled_date = new Date();

      let orderDetail12 = await userModel.orderCanceled(cancelled_date, order_id, user_id)

      var type = orderDetail[0].order_type;
      var amount = orderDetail[0].amount;
      var remaining_amount = orderDetail[0].remaining_amount;

      var fee_amount = orderDetail[0].fee_amount;
      var price = orderDetail[0].price;
      var left_coin_id = orderDetail[0].left_coin_id;
      var right_coin_id = orderDetail[0].right_coin_id;


      var remaining_fee = ((remaining_amount * 100) / amount)

      var newFee = ((fee_amount * remaining_fee) / 100)

      var withFeeAmount = remaining_amount + newFee;
      var newfeeAmount = remaining_amount * price + newFee;


      // var withFeeAmount =amount+fee_amount;
      //   var newfeeAmount = amount*price;
      console.log(withFeeAmount);
      if (type == 'BUY') {
        await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${newfeeAmount}, balanceInOrder=balanceInOrder-${newfeeAmount} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`);
      } else {
        await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${withFeeAmount}, balanceInOrder=balanceInOrder-${withFeeAmount} WHERE coin_id = ${left_coin_id} AND user_id=${user_id} `);
      }

      res.status(200).send({
        success: true,
        msg: "Success! This order has been cancelled."
      });
    }
  } else {
    
    res.status(400).send({
      success: false,
      msg: "Sorry! This order cannot be cancelled."
    });
  }
  
}


  exports.trxHistory = async (req, res) => {
   
    try{
    if (!req.body.user_id) {
        return res.status(200).send({
            success: false,
            msg: "UserID required "
        });
    }

    let result = await userModel.trxHistory(req.body);
    if (result.length >0) {
      return res.status(200).send({
        success: true,
        msg: "Transaction History Detail!",
        response : result
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "No Data Found!"
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
  






  exports.disableemailauth = async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(200).send({
          success: false,
          msg: `${errors.errors[0].msg}`,
        });
      }
      let result = await userModel.disableemailauth(req.body);
      if (result) {
        return res.status(200).send({
          success: true,
          msg: "Disabled Email Authentication successfully!"
        });
      }
      else {
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
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


exports.twoAuthenticationVerify = async (req, res) => {
  // asdf
  try {
    var user_id = req.body.user_id;
    var userToken = req.body.SecretKey;
    var enableTwoFactor = req.body.enableTwoFactor;
    var google_otp_login = req.body.google_otp_login;
    var ip = req.body.ip;
    var city = req.body.city;
    var country = req.body.country;
    var browsername = req.body.browsername;
    var browserversion = req.body.browserversion;
    var datetime = new Date()
    req.body.is_enable_google_auth_code = req.body.is_enable_factor
    // console.log("twoauthenticationverify", req.body);
    // await db.query(userProfileQueries.getUserAuth, [user_id], async function (error, data) {
    let getUserAuth = await userModel.getUserAuth(req.body)
    // console.log("getUserAuth", getUserAuth);
    // if (error) {
    //   return res.status(400).send({
    //     success: false,
    //     msg: "Error occured!!",
    //     error
    //   });
    // }

    var abc = getUserAuth[0].googleAuthCode;
    // console.log("abc",abc);
    var tokenValidates = speakeasy.totp.verify({
      secret: abc,
      encoding: 'base32',
      token: userToken,
      window: 0
    });
    console.log("tokenValidates", tokenValidates);

    if (tokenValidates) {
      // await db.query(userProfileQueries.updateUsersAuth, [enableTwoFactor, user_id]);
      let updateUsersAuth = await userModel.updateUsersAuth(req.body)
      let getexuserdetails = await userModel.getexuserdetails(req.body)

      // db.query(`select * from users where id=?`, user_id, async function (error, user) {

      // if (error) {
      //   return res.status(400).send({
      //     success: false,
      //     msg: "unexpected error occured",
      //     error
      //   });
      // }

      // if (google_otp_login == true) {
      //   emailActivity.Activity(getexuserdetails[0].email, 'Login Details', `Your account has been Logged-In IP- ${ip}, ${city},${country},${browsername},${browserversion} ${datetime}!`, getexuserdetails[0].first_name)
      // }
       return res.status(200).send({
        success: true,
        msg: "Result",
        response: tokenValidates,
        // email_auth: getexuserdetails[0].email_auth,
        email: getexuserdetails[0].email,
        id: getexuserdetails[0].id,
        logingetexuserdetails: {
          id: getexuserdetails[0].id,
          user_email: getexuserdetails[0].email,
          user_name: getexuserdetails[0].first_name,
          device_date: new Date(),
          is_kyc: getexuserdetails[0].is_kyc,
          is_enable_factor: getexuserdetails[0].is_enable_google_auth_code,
          email_auth: getexuserdetails[0].email_auth,
          // sms_auth: getexuserdetails[0].sms_auth
        }
      });

    }
    else {
     
      return res.status(200).send({
        success: false,
        msg: "wrong secetkey entered"
      });
    }
  }
  catch (error) {
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}






exports.disableAuth = async (req, res) => {
  const type = req.body.type
  const email = req.body.email
  // console.log("disableauthemail", req.body);
  if (type == 'email_auth') {
    req.body.useremail = {
      email_auth: 0,
    }
  } else if (type == 'google_auth') {
    req.body.useremail = {
      is_enable_google_auth_code: 0,
    }
  }

  //   console.log(useremail)

  // await db.query(authQueries.updateUserData, [useremail, email], async function (error, response) 
  let pairlist = await userModel.updateUserDatass(req.body);


  {


    {
      return res.status(200).send({
        success: true,
        msg: `Your ${type == 'email_auth' ? 'E-mail' : 'Google 2FA'} Authentication  is disabled`,
      })
    }

  }


}

exports.getDashUserOrder = async (req, res) => {

  if (!req.body.user_id) {
      return res.status(400).send({
          success: false,
          msg: "UserID required "
      });
  }

  let data = await userModel.getUserDashOpenOrder(req.body); 



      if (data.length > 0) {
          res.status(200).send({
              success: true,
              msg: "User Order List",
              response: data
          });
      } else {
          res.status(400).send({
              success: false,
              msg: "No Data"
          });
      }

}


exports.orderHistory = async (req, res) => {

  var user_id = req.body.user_id;



  if (!user_id) {
      return res.status(200).send({
          success: false,
          msg: "UserID required "
      });
  }

  
  let data = await userModel.orderHistory(req.body); 



     if (data.length > 0) {
          res.status(200).send({
              success: true,
              msg: "User Order History",
              response: data
          });
      } else {
          res.status(200).send({
              success: false,
              msg: "Order history not found."
          });
      }

}

exports.getSLCLive = async (req, res) => {
  try {
    // var user_id = req.body.user_id;
    let slcLive = await userModel.getlivepriceSLC(req.body);
   if (slcLive) {
      return res.status(200).send({
        success: true,
        msg: "SLC  details",
        data: slcLive,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};
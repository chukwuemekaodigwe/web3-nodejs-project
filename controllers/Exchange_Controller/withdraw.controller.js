const config = require('../../config');
const withdrawModel = require('../../models/Exchange Model/withdraw.model');
const { validationResult } = require('express-validator');
var nodemailer = require('nodemailer')
const emailActivity = require('../emailActivity.controller');
const AdminModel = require('../../models/admin.model');
var speakeasy = require("speakeasy");
const tansferAPIs = require('../API/tansferAPIs');
const mysql = require('mysql2');
// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();


// exports.cryptowithdraw = async (req, res) => {


//     try {
//         let dataCoin = await withdrawModel.getSingalCoinDetail(req.body);

//         // if ((parseFloat(req.body.balance).toFixed(6)) - (parseFloat(dataCoin[0].withdraw_fee).toFixed(6)) < 0) {
//         //     return res.status(200).send({
//         //         success: false,
//         //         msg: `Withdraw Amount should be greater network fee!`
//         //     });
//         // }

//         let result = await withdrawModel.balanceCheck(req.body);


//         var fee = (parseFloat(req.body.balance * dataCoin[0].withdraw_fee) / 100)

//         let newWithFeeAmount = parseFloat(req.body.balance) - parseFloat(fee)

//         if (newWithFeeAmount > result[0].balance) {
//             return res.status(200).send({
//                 success: false,
//                 msg: "Insufficient balance",

//             });
//         }
//         // if (req.body.balance < dataCoin[0].withdraw_min_limit) {
//         //     return res.status(200).send({
//         //         success: false,
//         //         msg: `Min Amount Required to Withdraw ${dataCoin[0].withdraw_min_limit}`,

//         //     });
//         // }
//         // else if (req.body.balance > dataCoin[0].withdraw_max_limit) {
//         //     return res.status(200).send({
//         //         success: false,
//         //         msg: `Max Amount over Exceed ${dataCoin[0].withdraw_max_limit}`,

//         //     });
//         // }


//         else {

//             let result = await withdrawModel.getSingalUser(req.body);

//             let data = await withdrawModel.userwithdrawCoins(req.body);

//             let newWithFeeAmount = parseFloat(req.body.balance) - parseFloat(fee)


//             // var withremoveFeeAmount = (parseFloat(usd_amount) + fee);
//             //    var currentbalance = parseFloat(balance[0].Balance) - parseFloat(withremoveFeeAmount)

//             //Withdraw Functionality run for direct cut same amount how many amount it request for but admin return it amount with fee cut price //

//             // let newAmount = parseFloat(req.body.balance) -parseFloat(fee)
//             //      var currentbalance = parseFloat(balance[0].Balance) - parseFloat(usd_amount)
//             var metamaskPrivateKey = process.env.METAMASKPRIVATEKEY  //'9ac7d97559e62ba49c6d21f17302da6fc66db9e6df0dbc1f62ef42da14d2ebb4A8h/srkTZIj/F3O2foOSNAgL0fHltunPf8YCHoDUOfjNEUHvhGCbU06lsFWllUj3a2g3OHBTRmHuD7BLZt9rrJgKv7FhrjmNaYJjN2J4Jbo='
//             var metaMaskPublicKey =  process.env.METAMASKPUBLICKEY //'0xA59C7912A71E573235cad72f19322c0994B162fc'



//             console.log('adminwallet', req.body.balance, fee, newWithFeeAmount) //0.010000
//             // const apiResponse = await tansferAPIs.transfer(dataCoin[0].symbol, coin_id, balance, to_address, data[0].public_key, data[0].private_key, data[0].test_contract);
//             const apiResponse = await tansferAPIs.transfer(dataCoin[0].symbol, req.body.coin_id, newWithFeeAmount, req.body.to_address, metaMaskPublicKey, metamaskPrivateKey, data[0].contract, data[0].Bnb_contract, data[0].Trc_contract, req.body.withdrawtype);
//             console.log('Usdtjson', apiResponse)
//             const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${dataCoin[0].symbol}USDT`, {
//                 method: 'GET', headers: {
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json'
//                 },
//             })

//             const Usdtjson = await response.json();
//             //   console.log('Usdtjson',Usdtjson)
//             const actualAmountinUsdt = parseFloat(req.body.balance).toFixed(6) * parseFloat(Usdtjson.askPrice).toFixed(6)
//             console.log('apiResponseapiResponse', apiResponse)

//             if (apiResponse && apiResponse.hash) {
//                 console.log('dataCoin[0]dataCoin[0]', dataCoin[0])
//                 let trx_number = new Date().getTime();
//                 let trx_fee = parseFloat(req.body.balance) - parseFloat(fee);
//                 var hash = apiResponse.hash;
//                 var transaction = {
//                     user_id: req.body.user_id,
//                     coin_id: req.body.coin_id,
//                     trx_number: trx_number,
//                     trx_type: 4,
//                     amount: req.body.balance,
//                     trx_fee: trx_fee,
//                     status: 1,
//                     from_address: metaMaskPublicKey,
//                     to_address: req.body.to_address,
//                     hash: hash,
//                     usd_amount: 0,
//                     datetime: new Date(),
//                     block: 0,
//                     date: new Date()
//                 }

//                 console.log(`transaction`, transaction)

//                 let data = await withdrawModel.userwithdrawCoins(req.body);
//                 await promisePool.query(`insert into exchange_transaction SET ? `, transaction);

//                 let data1 = await withdrawModel.userWithdraw(req.body);
//                 if (data1) {
//                     let headerMSG = `Congratulations Transaction Successfull !`
//                     let headerMSG1 = `Silky Exchange is delighted to have you on board !`

//                     emailActivity.Activity(req.body.email, 'Withdraw Status', headerMSG, headerMSG1, `Congratulations  your  amount ${req.body.balance}  ${dataCoin[0].symbol}   to address ${req.body.to_address} has been withdraw!`)

//                     return res.status(200).send({
//                         success: true,
//                         //  msg: "User Withdraw Succesfull",
//                         msg: 'Congratulation!! Your transaction is done.'
//                     });
//                 } else {
//                     console.log('errr')
//                     return res.status(400).send({
//                         success: false,
//                         msg: "Something went wrong, Please try again!"
//                     });
//                 }

//             } else {
//                 console.log('sdsdsdsdsd', apiResponse)
//                 return res.status(200).send({
//                     success: false,
//                     msg: apiResponse.msg,
//                     //  error: apiResponse.error
//                 });
//             }



//         }

//     } catch (err) {
//         console.log('erererer', err)
//         return res.status(200).send({
//             success: false,
//             msg: "Something went wrong please try again.",
//         });
//     }

// }



exports.cryptowithdraw = async (req, res) => {


    try {
        let dataCoin = await withdrawModel.getSingalCoinDetail(req.body);

        // if ((parseFloat(req.body.balance).toFixed(6)) - (parseFloat(dataCoin[0].withdraw_fee).toFixed(6)) < 0) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Withdraw Amount should be greater network fee!`
        //     });
        // }

        let result = await withdrawModel.balanceCheck(req.body);


        var fee = (parseFloat(req.body.balance * dataCoin[0].withdraw_fee) / 100)

        let newWithFeeAmount = parseFloat(req.body.balance) - parseFloat(fee)

        if (newWithFeeAmount > result[0].balance) {
            return res.status(200).send({
                success: false,
                msg: "Insufficient balance",

            });
        }
        // if (req.body.balance < dataCoin[0].withdraw_min_limit) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Min Amount Required to Withdraw ${dataCoin[0].withdraw_min_limit}`,

        //     });
        // }
        // else if (req.body.balance > dataCoin[0].withdraw_max_limit) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Max Amount over Exceed ${dataCoin[0].withdraw_max_limit}`,

        //     });
        // }


        else {

            let result = await withdrawModel.getSingalUser(req.body);

            let data = await withdrawModel.userwithdrawCoins(req.body);

            let newWithFeeAmount = parseFloat(req.body.balance) - parseFloat(fee)


            // var withremoveFeeAmount = (parseFloat(usd_amount) + fee);
            //    var currentbalance = parseFloat(balance[0].Balance) - parseFloat(withremoveFeeAmount)

            //Withdraw Functionality run for direct cut same amount how many amount it request for but admin return it amount with fee cut price //

            // let newAmount = parseFloat(req.body.balance) -parseFloat(fee)
            //      var currentbalance = parseFloat(balance[0].Balance) - parseFloat(usd_amount)
            // var metamaskPrivateKey = process.env.METAMASKPRIVATEKEY  //'9ac7d97559e62ba49c6d21f17302da6fc66db9e6df0dbc1f62ef42da14d2ebb4A8h/srkTZIj/F3O2foOSNAgL0fHltunPf8YCHoDUOfjNEUHvhGCbU06lsFWllUj3a2g3OHBTRmHuD7BLZt9rrJgKv7FhrjmNaYJjN2J4Jbo='
           var metaMaskPublicKey =  process.env.METAMASKPUBLICKEY 

            console.log('adminwallet', req.body.balance, fee, newWithFeeAmount) //0.010000
            // const apiResponse = await tansferAPIs.transfer(dataCoin[0].symbol, coin_id, balance, to_address, data[0].public_key, data[0].private_key, data[0].test_contract);
            // const apiResponse = await tansferAPIs.transfer(dataCoin[0].symbol, req.body.coin_id, newWithFeeAmount, req.body.to_address, metaMaskPublicKey, metamaskPrivateKey, data[0].contract, data[0].Bnb_contract, data[0].Trc_contract, req.body.withdrawtype);
            // console.log('Usdtjson', apiResponse)
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${dataCoin[0].symbol}USDT`, {
                method: 'GET', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })

            const Usdtjson = await response.json();
            //   console.log('Usdtjson',Usdtjson)
            const actualAmountinUsdt = parseFloat(req.body.balance).toFixed(6) * parseFloat(Usdtjson.askPrice).toFixed(6)
            // console.log('apiResponseapiResponse', apiResponse)

            // if (apiResponse && apiResponse.hash) {
                console.log('dataCoin[0]dataCoin[0]', dataCoin[0])
                let trx_number = new Date().getTime();
                // let trx_fee = parseFloat(req.body.balance) - parseFloat(fee);
                // var hash = apiResponse.hash;
                 console.log('apiResponseapiResponse',newWithFeeAmount,req.body.balance,fee )

                var transaction = {
                    user_id: req.body.user_id,
                    coin_id: req.body.coin_id,
                    trx_number: trx_number,
                    trx_type: 4,
                    amount: newWithFeeAmount,
                    trx_fee: fee,
                    status: 0,
                    from_address: metaMaskPublicKey,
                    to_address: req.body.to_address,
                    usd_amount: 0,
                    datetime: new Date(),
                    block: 0,
                    date: new Date()
                }

                console.log(`transaction`, transaction)

                let data2 = await withdrawModel.userwithdrawCoins(req.body);
                await promisePool.query(`insert into exchange_transaction SET ? `, transaction);

                let data1 = await withdrawModel.userWithdraw(req.body);
                if (data1) {
                    let headerMSG = `Congratulations Transaction Successfull !`
                    let headerMSG1 = `Silky Exchange is delighted to have you on board !`

                    emailActivity.Activity(req.body.email, 'Withdraw Status', headerMSG, headerMSG1, `Congratulations  your   amount ${req.body.balance}  ${dataCoin[0].symbol}   to address ${req.body.to_address} has been requested!`)

                    return res.status(200).send({
                        success: true,
                        //  msg: "User Withdraw Succesfull",
                        msg: 'Congratulation!! Your Withdrawal request submit successfully!!.'
                    });
                } else {
                    console.log('errr')
                    return res.status(400).send({
                        success: false,
                        msg: "Something went wrong, Please try again!"
                    });
                }

            // } else {
            //     console.log('sdsdsdsdsd', apiResponse)
            //     return res.status(200).send({
            //         success: false,
            //         msg: apiResponse.msg,
            //         //  error: apiResponse.error
            //     });
            // }



        }

    } catch (err) {
        console.log('erererer', err)
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again.",
        });
    }

}

exports.depositForm = async (req, res) => {

    var user_id = req.body.user_id;
    var coin_id = req.body.coin_id;
    var bank_id = req.body.bank_id;
    var admin_bank_id = req.body.admin_bank_id;

    var transaction_id = req.body.transaction_id;
    var deposit_amount = parseFloat(req.body.deposit_amount);
    var date = req.body.transaction_date
    var usdt_amount = req.body.usdt_amount
    // var fee = parseFloat(req.body.fee);
    var receipt_url = (!req.files['receipt']) ? null : req.files['receipt'][0].filename;

    var fileExtension = (!req.files['receipt']) ? '' : req.files['receipt'][0].originalname.replace(/^.*\./, '');
    console.log('fileExtension', fileExtension);
    usdt_amount = parseFloat(usdt_amount).toFixed(6);

    // console.log('receipt_urlreceipt_url',receipt_url)
    if (fileExtension != '' && !['jpg', 'jpeg', 'JPEG', 'png'].includes(fileExtension)) {
        return res.status(400).send({
            success: false,
            msg: `Please Select image  File Type!`,
        });
    }



    if (!req.body.user_id || !coin_id || !req.body.usdt_amount) {
        var required = (!req.body.user_id) ? 'user_id' : (!req.body.coin_id) ? 'coin_id' : (!req.body.usdt_amount) ? 'usd_amount' : '';
        return res.status(400).send({
            success: false,
            msg: `${required} required`
        });
    }

    const [checkStatuskyc, invalid] = await promisePool.query(`Select kyc_approval from registration where id=${user_id}`);


    if (checkStatuskyc.length == 0 || checkStatuskyc[0].kyc_approval == '' || !checkStatuskyc[0].kyc_approval || checkStatuskyc[0].kyc_approval == null || checkStatuskyc[0].kyc_approval == 2 || checkStatuskyc[0].kyc_approval == 0) {
        return res.status(200).send({
            success: false,
            msg: `Please complete your kyc than request for deposit INR`,
        });
    }
    // else if (usd_amount < parseFloat(DepositLimitation[0].minimum_limit)) {
    //     return res.status(400).send({
    //         success: false,
    //         msg: `Minimum ${DepositLimitation[0].minimum_limit} USDT Amount Required for Deposit`,
    //     });
    // } 
    else {


        const [transactionCheck, invalid1] = await promisePool.query(`Select transaction_id from deposit_Inr where transaction_id='${transaction_id}'`);
        if (transactionCheck.length > 0) {
            return res.status(200).send({
                success: false,
                msg: "This transaction id Already used",
            });
        }
        try {
            var trx_number = new Date().getTime();
            var datetime = new Date();
            var transaction = {
                user_id: user_id,
                coin_id: coin_id,
                fee: req.body.fee,
                bank_id: bank_id,
                admin_bank_id: admin_bank_id,
                transaction_date: date,
                trx_number: trx_number,
                amount: deposit_amount,
                status: 0,
                datetime: datetime,
                transaction_image: receipt_url,
                usdt_amount: usdt_amount,
                transaction_id: transaction_id
            }

            await promisePool.query(`insert into deposit_Inr SET ? `, transaction);

            res.status(200).send({
                success: true,
                msg: "Request submitted your money will come in within one day",
                // response: result[0]
            });






        } catch (er) {
            console.log('er', er)
            res.status(400).send({
                msg: "Something went wrong! Please try again.",
                er
            });
        }
    }
}




exports.checkCryptowithdrawvalidation = async (req, res) => {
    try {
        if (!req.body.user_id || !req.body.coin_id || !req.body.balance) {
            var required = (!req.body.user_id) ? 'user_id' : (!req.body.coin_id) ? 'coin_id' : (!req.body.balance) ? 'balance' : '';
            return res.status(400).send({
                success: false,
                msg: `${required} required`
            });
        }

        let dataCoin = await withdrawModel.getSingalCoinDetail(req.body);

        // console.log('hello',req.body.balance,dataCoin[0].withdraw_fee)


        // if ((parseFloat(req.body.balance).toFixed(6)) - (parseFloat(dataCoin[0].withdraw_fee).toFixed(6)) < 0) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Withdraw Amount should be greater network fee!`
        //     });
        // }


        let result = await withdrawModel.balanceCheck(req.body);



        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${dataCoin[0].symbol}USDT`, {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        const Usdtjson = await response.json();
        //   console.log('Usdtjson',Usdtjson)
        const actualCoininUsdt = parseFloat(req.body.balance).toFixed(6) * parseFloat(Usdtjson.askPrice).toFixed(6)


        //   console.log('actualCoininUsdt', actualCoininUsdt)
        if (req.body.balance > result[0].balance) {
            return res.status(200).send({
                success: false,
                msg: "Insufficient balance",

            });
        }
        // if (req.body.balance < dataCoin[0].withdraw_min_limit) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Min Amount Required to Withdraw ${dataCoin[0].withdraw_min_limit}`,

        //     });
        // }
        // else if (req.body.balance > dataCoin[0].withdraw_max_limit) {
        //     return res.status(200).send({
        //         success: false,
        //         msg: `Max Amount over Exceed ${dataCoin[0].withdraw_max_limit}`,

        //     });
        // }
        // const [WithdrawLimitation, invalids] = await promisePool.query(`Select * from fee_type where id=4`);

        // const [checkStatuskyc, invalid] = await promisePool.query(`Select is_kyc_verify from user_profile_kyc where user_id=${req.body.user_id}`);

        // const [withdrawLimitNonKYC, invali] = await promisePool.query(`Select withdrawLimitNonKYC from coins where id=5`);

        //  const [checktodayWithdraw, ett] = await promisePool.query(`Select usd_amount from transaction where user_id=${user_id} and coin_id=5 and datetime = NOW()`);


        // var totalwithdrawToday = 0

        // for (let x in checktodayWithdraw) {
        //     totalwithdrawToday += parseFloat(checktodayWithdraw[x].usd_amount)
        // }



        //console.log('checkStatuskyccheckStatuskyc', checkStatuskyc[0].is_kyc_verify)
        // if (checkStatuskyc.length == 0 || checkStatuskyc[0].is_kyc_verify == '' || !checkStatuskyc[0].is_kyc_verify || checkStatuskyc[0].is_kyc_verify == null || checkStatuskyc[0].is_kyc_verify == 2 || checkStatuskyc[0].is_kyc_verify == 0) {
        //     return res.status(400).send({
        //         success: false,
        //         msg: `Please complete your kyc than request for withdraw`,
        //     });
        // }

        // else if (checkStatuskyc[0].is_kyc_verify != 1 && parseFloat(withdrawLimitNonKYC) > totalwithdrawToday) {
        //     return res.status(400).send({
        //         success: false,
        //         msg: `Your Daily Withdraw Limit over `,
        //     });
        // }

        // else if (actualCoininUsdt < parseFloat(WithdrawLimitation[0].minimum_limit)) {
        //     return res.status(400).send({
        //         success: false,
        //         msg: `Minimum ${parseFloat(parseFloat(WithdrawLimitation[0].minimum_limit).toFixed(8) / parseFloat(Usdtjson.askPrice).toFixed(6)).toFixed(8)} ${dataCoin[0].symbol} Amount Required for Withdraw`,
        //     });
        // }

        // else {
        return res.status(200).send({
            success: true,
            msg: `Validation true`,
        });
        // }
    } catch (err) {
        console.log('err', err);
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again.",
        });
    }
}

exports.withdrawAuthentication = async (req, res) => {



    if (req.body.email == '' || req.body.email == null || req.body.email == undefined || !req.body.email) {
        return res.status(400).send({
            success: false,
            msg: 'email is required!'
        })
    }

    if (req.body.type == '' || req.body.type == null || req.body.type == undefined || !req.body.type) {
        return res.status(400).send({
            success: false,
            msg: 'type is required!'
        })
    }

    if (req.body.type == 'send_otp') {
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
            // auth: {
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
            to: `${req.body.email}`,
            subject: 'Email  Verification Code',
            html: `<div style="background-color:#f4f4f4">
           <h2>[SilkyExchange] Verification code : ${otp} </h2>
           <h3>If this was not you, please inform Support. Beware of scam calls and SMS phishing. Verify sources with SilkyExchange Verify.</h3>
           <div>
        `
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);

            }
        })
        var useremail = {
            email_otp: otp,
        }

        let result = await withdrawModel.updateUserData(otp, req.body);

        return res.status(200).send({

            success: true,
            msg: "We have sent verification code on your email please check!!",

        });

    } else {

        if (req.body.email_otp == '' || req.body.email_otp == null || req.body.email_otp == undefined || !req.body.email_otp) {
            return res.status(200).send({
                success: false,
                msg: 'email_otp is required!'
            })
        }

        let result = await withdrawModel.getSingalUser(req.body);


        // await db.query(authQueries.getSingalUser, [email], async function (error, result) {
        //     console.log(result[0].email_otp)

        if (req.body.email_otp == result[0].email_otp) {
            return res.status(200).send({
                success: true,
                msg: "Congratulation your authentication done!"
            })


        } else {
            return res.status(200).send({
                success: false,
                msg: "Code is wrong, Please Try Again"
            });
        }

        // });
    }
}



exports.coinDetail = async (req, res) => {




    let data = await withdrawModel.getSingalCoinDetail(req.body);



    if (data.length > 0) {
        res.status(200).send({
            success: true,
            msg: "Coin Data",
            response: data[0]
        });
    } else {
        res.status(200).send({
            success: false,
            msg: "No Data found."
        });
    }

}
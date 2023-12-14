const UserModel = require('../models/user.model');
const emailActivity = require('./emailActivity.controller');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('../config')
const CryptoJS = require("crypto-js");
const requestIp = require('request-ip');
const Web3API = require('web3');
const TronWeb = require("tronweb");
var cw = require('crypto-wallets');
var keySize = 256;
var iterations = 100;
// var cw = ''
const bip39 = require('bip39')

const axios = require("axios");
const HttpProvider = TronWeb.providers.HttpProvider; // This provider is optional, you can just use a url for the nodes instead

const fullNode = new HttpProvider("https://api.trongrid.io/"); // Full node http endpoint
const solidityNode = new HttpProvider("https://api.trongrid.io/"); // Solidity node http endpoint
const eventServer = "https://api.trongrid.io/"; // Contract events http endpoint

// const fullNodeTest = new HttpProvider("https://api.shasta.trongrid.io/"); // Full node http endpoint
// const solidityNodeTest = new HttpProvider("https://api.shasta.trongrid.io/"); // Solidity node http endpoint
// const eventServerTest = "https://api.shasta.trongrid.io/"; // Contract events http endpoint

let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);


exports.login = async (req, res) => {
    try {

        const errors = validationResult(req)
             // console.log('getUsersEmail123',errors,req.body)
   
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }

        let getUsersEmail = await UserModel.getUsersDetails(req.body.email);
        // console.log('getUsersEmail',getUsersEmail)
        if (getUsersEmail.length > 0) {
            if (getUsersEmail[0].is_email_verify === 0) {
                const Token = jwt.sign({
                    email: req.body.email
                }, config.JWT_SECRET_KEY)

                let headerMSG = `You're almost there!`
                let headerMSG1 = `Silky Exchange is delighted to have you on board ! <br/>To start exploring Silky Exchange, please confirm your Email address.`
                let mailmsg = `
                <h2>Please <a href='${config.mailUrl}verifyAccount/${Token}'>click here </a> to activate your account</h2>`

                let mailMsg = emailActivity.Activity(req.body.email, 'Account Activation Link', headerMSG, headerMSG1, mailmsg);

                return res.status(200).send({
                    success: false,
                    msg: "We have Sent a mail, Please activate your account"
                });
            } else if (getUsersEmail[0].is_active == 0) {
                return res.status(200).send({
                    success: false,
                    msg: "Your account is Deactivated, Please contact Admin."
                });
            } else if (getUsersEmail[0].blocked == 1) {
                return res.status(200).send({
                    success: false,
                    msg: "Your account is Block, Please contact Admin."
                });
            }
            let hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);
            if (getUsersEmail[0].password === hash) {
                const jwtToken = jwt.sign({
                    email: req.body.email,
                    id: getUsersEmail[0].id,
                    'bnb_address': getUsersEmail[0].bnb_address,
                    'referral_code': getUsersEmail[0].referral_code,

                }, config.JWT_SECRET_KEY, {
                    expiresIn: config.SESSION_EXPIRES_IN
                });

                // Insert Activity
                await UserModel.insertActivity({
                    "user_id": getUsersEmail[0].id,
                    "activity_type": 'Login',
                    "ip": requestIp.getClientIp(req)
                });


                // await db.query(`select * from coins where is_visible=1 `, async function (error, coins) {
                req.body.user_id = getUsersEmail[0].id
                let insertDevice = await UserModel.insertDevice(req.body);

                let coins = await UserModel.getcoindetail();
                // console.log(`query,,,select * from coins where is_visible=1  `,coins)
                for (let n in coins) {

                    let wallets = await UserModel.getuserwallet(getUsersEmail[0].id, coins[n].id);

                    // await db.query(`select * from user_wallet where user_id=${getUsersEmail[0].id} and coin_id=${coins[n].id}`, async function (err3, wallets) {
                    // if (error) {
                    //     return res.status(400).send({
                    //         success: false,
                    //         msg: "Error : Server not responding please try again later! ",
                    //         error
                    //     });
                    // }

                    if (wallets.length == 0) {
                        //   ===for Eth  wallet=====
                        const web3 = new Web3API(new Web3API.providers.HttpProvider('https://mainnet.infura.io'));
                        let account = web3.eth.accounts.create(web3.utils.randomHex(32));
                        var ETHwallet = web3.eth.accounts.wallet.add(account);
                        let keystore = ETHwallet.encrypt(web3.utils.randomHex(32));
                        //===================For Trc Wallet ===============//

                        const trcaccount = await tronWeb.createAccount();

                        let TRCwallet = { privateKey: trcaccount.privateKey, address: trcaccount.address.base58 }

                        //    return { privateKey: wallet.privateKey, public_key: wallet.address }

                        let wallet = {}


                        if (['LTC', 'BTC', 'TRX'].includes(coins[n].symbol)) {
                            wallet = await web3fun(coins[n].symbol)
                        } else {
                            wallet = { privateKey: ETHwallet.privateKey, public_key: ETHwallet.address, trc_privatekey: TRCwallet.privateKey, trc_publickey: TRCwallet.address }
                        }
                        // console.log('TRCwalletTRCwallet', wallet)

                        let datetime = new Date()
                        if (wallet) {
                            var userwallet = {
                                user_id: getUsersEmail[0].id,
                                coin_id: coins[n].id,
                                balance: 0,
                                public_key: wallet.public_key,
                                private_key: await encriptedKey(wallet.privateKey, process.env.EKEY),//process.env.EKEY
                                bnb_publickey: ETHwallet.address,
                                bnb_privatekey: await encriptedKey(ETHwallet.privateKey, process.env.EKEY),//process.env.EKEY
                                trc_publickey: wallet.trc_publickey,
                                trc_privatekey: await encriptedKey(wallet.trc_privatekey, process.env.EKEY),//process.env.EKEY
                                ip: null,
                                datetime: datetime
                            }
                        }


                        await UserModel.insertUserWallet(userwallet);

                        // await db.query(authQueries.insertUserWallet, userwallet);

                    }
                    // console.log('wallets[0].public_key', wallets[0].public_key)
                    if (wallets.length > 0 && (wallets[0].public_key == null || !wallets[0].public_key)) {
                        //   ===for Eth  wallet=====
                        const web3 = new Web3API(new Web3API.providers.HttpProvider('https://mainnet.infura.io'));
                        let account = web3.eth.accounts.create(web3.utils.randomHex(32));
                        var ETHwallet = web3.eth.accounts.wallet.add(account);
                        let wallet = {}
                        // console.log('TRCwalletTRCwallet', TRCwallet)

                        if (['LTC', 'BTC', 'TRX'].includes(coins[n].symbol)) {
                            wallet = await web3fun(coins[n].symbol)
                        } else {
                            wallet = { privateKey: ETHwallet.privateKey, public_key: ETHwallet.address }
                        }

                        // console.log('resetwallet', wallet)

                        var userwallet = {
                            public_key: wallet.public_key,
                            private_key: await encriptedKey(wallet.privateKey, process.env.EKEY),//process.env.EKEY
                        }
                        console.log('wallet', wallet.public_key)

                        await UserModel.updateUserWallet(userwallet, getUsersEmail[0].id, coins[n].id);
                        // await db.query(authQueries.updateUserWallet, [userwallet, user[0].id, coins[n].id]);

                    }

                    if (wallets.length > 0 && coins[n].Trc_contract !== null && (wallets[0].trc_publickey == null || wallets[0].trc_publickey == '' || !wallets[0].trc_publickey)) {
                        const trcaccount = await tronWeb.createAccount();

                        let TRCwallet = { privateKey: trcaccount.privateKey, address: trcaccount.address.base58 }

                        var userwallet = {
                            trc_publickey: TRCwallet.address,
                            trc_privatekey: await encriptedKey(TRCwallet.privateKey, process.env.EKEY), //process.env.EKEY
                        }

                        await UserModel.updateUserWallet(userwallet, getUsersEmail[0].id, coins[n].id);
                        // await db.query(authQueries.updateUserWallet, [userwallet, user[0].id, coins[n].id]);
                    }
                    if (wallets.length > 0 && coins[n].Bnb_contract !== null && (wallets[0].bnb_publickey == null || wallets[0].bnb_publickey == '' || !wallets[0].bnb_publickey)) {
                        const web3 = new Web3API(new Web3API.providers.HttpProvider('https://mainnet.infura.io'));
                        let account = web3.eth.accounts.create(web3.utils.randomHex(32));
                        var ETHwallet = web3.eth.accounts.wallet.add(account);

                        var userwallet = {
                            bnb_publickey: ETHwallet.address,
                            bnb_privatekey: await encriptedKey(ETHwallet.privateKey, process.env.EKEY),//process.env.EKEY
                        }


                        await UserModel.updateUserWallet(userwallet, getUsersEmail[0].id, coins[n].id);
                        // await db.query(authQueries.updateUserWallet, [userwallet, user[0].id, coins[n].id]);
                    }
                    else {
                        console.log('AllCoins Added to User IN aLL Wallet')
                    }

                    // })
                }

                // })


                return res.status(200).send({
                    success: true,
                    msg: "Login Successful",
                    data: {
                        'id': getUsersEmail[0].id,
                        'email': getUsersEmail[0].email,
                        'bnb_address': getUsersEmail[0].bnb_address,
                        'referral_code': getUsersEmail[0].referral_code,
                        'kyc_approval': getUsersEmail[0].kyc_approval,
                        'authToken': jwtToken,
                        'device_date': getUsersEmail[0].datetime,
                        'is_enable_factor': getUsersEmail[0].is_enable_google_auth_code,
                        'email_auth': getUsersEmail[0].email_auth,
                        }
                    
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Password does not match"
                });
            }
            // }
        } else {
            return res.status(200).send({
                success: false,
                msg: "User not found."
            });
        }
    } catch (err) {
        console.log('err', err);
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again.",
            err
        });
    }
}


async function encriptedKey(pvkey, hash) {
    var private_key = pvkey

    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var pass = hash;

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var encrypted = CryptoJS.AES.encrypt(private_key, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    });
    return privateKey = salt.toString() + iv.toString() + encrypted.toString();
}

async function web3fun(symbol) {


    const mnemonic = bip39.generateMnemonic()
    // console.log(mnemonic, 'mnemonic')
    // console.log('symbol', symbol)
    if (symbol == 'LTC') {
        try {
            var LTCWallet = cw.generateWallet('LTC');
            return { privateKey: LTCWallet.privateKey, public_key: LTCWallet.address }
        } catch (error) {
            return { privateKey: null, public_key: null }
        }
    } else if (symbol == 'BTC') {
        console.log('Bitcoin', symbol)

        //Main-Net
        // const bitcoinhdWallet = await axios.post('https://api.blockcypher.com/v1/btc/main/addrs') // mainnet
        // const bitcoinhdWallet = await axios.post('https://api.blockcypher.com/v1/btc/test3/addrs') //testnet
        const bitcoinhdWallet = await axios.post('https://api.blockcypher.com/v1/btc/main/wallets/alice/addresses/generate?token=0e42a92b197845b38e9bd7fdf080ee89')
        console.log('bitcoinhdWalletbitcoinhdWallet', bitcoinhdWallet.data.private, bitcoinhdWallet.data.address)

        var bitcoinWallet = cw.generateWallet('BTC');

        return { privateKey: bitcoinhdWallet.data.private, public_key: bitcoinhdWallet.data.address }
    } else if (symbol == 'TRX') {
        const trcaccount = await tronWeb.createAccount();

        //let TRCwallet = { privateKey: trcaccount.privateKey, address: trcaccount.address.base58 }

        //const data1 = await trcaccount.json();
        //    console.log('LTC', { privateKey:data1.privateKey, public_key: data1.address })
        console.log('TRCWALLET', trcaccount)
        return { privateKey: trcaccount.privateKey, public_key: trcaccount.address.base58 }
    } 
    // else if (symbol == 'INR') {
      
    //     return { privateKey: '', public_key: '' }
    // }
};


exports.LoginWithAddress = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }
        let getUsersEmail = await UserModel.getUsersDetailsAddress(req.body.address);
        if (getUsersEmail.length > 0) {
            // if (getUsersEmail[0].is_email_verify === 0) {
            //     return res.status(200).send({
            //         success: false,
            //         msg: "Please activate your account"
            //     });
            // } else if (getUsersEmail[0].is_active == 0) {
            //     return res.status(200).send({
            //         success: false,
            //         msg: "Your account is Deactivated, Please contact Admin."
            //     });
            // } else {
            const jwtToken = jwt.sign({
                email: getUsersEmail[0].email,
                id: getUsersEmail[0].id,
                'bnb_address': getUsersEmail[0].bnb_address,
            }, config.JWT_SECRET_KEY, {
                expiresIn: config.SESSION_EXPIRES_IN
            });

            // Insert Activity
            await UserModel.insertActivity({
                "user_id": getUsersEmail[0].id,
                "activity_type": 'Login',
                "ip": requestIp.getClientIp(req)
            });

            return res.status(200).send({
                success: true,
                msg: "Login Successful",
                data: {
                    'id': getUsersEmail[0].id,
                    'email': getUsersEmail[0].email,
                    'bnb_address': getUsersEmail[0].bnb_address,
                    'authToken': jwtToken,
                }
            });
            // }
        } else {
            return res.status(200).send({
                success: false,
                msg: "User not registered."
            });
        }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again.",
            err
        });
    }
}

exports.activateAccount = async (req, res) => {
    let token = req.body.token;
    if (token) {
        jwt.verify(token, config.JWT_SECRET_KEY, async function (err, decodedToken) {
            if (err) {
                return res.status(200).send({
                    success: false,
                    msg: "Incorrect or Expired Link"
                });
            }
            let updateStatus = await UserModel.accountVerify(decodedToken.email);
            if (updateStatus) {
                let headerMSG = ``
                let headerMSG1 = `Silky Exchange is delighted to have you  ! `
                let mailmsg = `
                <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                <h4>Congratulation Your Account Have Been Successfully Verified</h4>
                </div>`
                emailActivity.Activity(decodedToken.email, 'Account Successfully verified', headerMSG, headerMSG1, mailmsg);

                return res.status(200).send({
                    success: true,
                    msg: "Account Successfully Verified"
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Something went wrong please try again."
                });
            }
        })
    } else {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.ForgotPassword = async (req, res) => {
    try {
        let getUsersEmail = await UserModel.getUsersDetails(req.body.email);
        if (getUsersEmail.length > 0) {
            const Token = jwt.sign({
                email: req.body.email
            }, config.JWT_SECRET_KEY)

            let mailmsg = `
                    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
                    <h4>Please <a href='${config.mailUrl}resetpassword/${Token}'>Click here </a> to Reset  your Password</h4>
                    </div>`
            let headerMSG = ``
            let headerMSG1 = `Silky Exchange is delighted to have you  ! `
            let mailMsg = emailActivity.Activity(req.body.email, 'Reset Password Link', headerMSG, headerMSG1, mailmsg,);
            if (mailMsg) {
                return res.status(200).send({
                    success: true,
                    msg: "Please Check your email for a link to reset your password."
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Something went wrong please try again."
                });
            }
        } else {
            return res.status(200).send({
                success: false,
                msg: "Email not registered!"
            });
        }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}


exports.Resetpassword = async (req, res) => {
    try {
        jwt.verify(req.body.token, config.JWT_SECRET_KEY, async function (err, decodedToken) {
            if (err) {
                return res.status(200).send({
                    success: false,
                    msg: "Incorrect or Expired Link"
                });
            }
            const hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);
            let updatePassword = await UserModel.updatePassword(hash, decodedToken.email);
            if (updatePassword) {
                return res.status(200).send({
                    success: true,
                    msg: "Your password changed successfully, You can login now."
                });
            } else {
                return res.status(200).send({
                    success: false,
                    msg: "Something went wrong please try again."
                });
            }
        })
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.resendmail = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(200).send({
                success: false,
                msg: `${errors.errors[0].msg}`,
            });
        }

        let getUsersEmail = await UserModel.getUsersDetails(req.body.email);
        if (getUsersEmail.length > 0) {
            if (getUsersEmail[0].is_email_verify == 0) {
                const Token = jwt.sign({
                    email: req.body.email
                }, config.JWT_SECRET_KEY)

                let headerMSG = `You're almost there!`
                let headerMSG1 = `Silky Exchange is delighted to have you on board ! <br/>To start exploring Silky Exchange, please confirm your Email address.`
                let mailmsg = `
                <h2>Please <a href='${config.mailUrl}verifyAccount/${Token}'>click here </a> to activate your account</h2>`

                let mailMsg = emailActivity.Activity(req.body.email, 'Account Activation Link', headerMSG, headerMSG1, mailmsg);

                return res.status(200).send({
                    success: true,
                    msg: "We have Sent a mail, Please activate your account"
                });


            }

            else if (getUsersEmail[0].is_email_verify == 1) {
                return res.status(200).send({
                    success: false,
                    msg: "Your account verification already done."
                });
            }

            else if (getUsersEmail[0].is_active == 0) {
                return res.status(200).send({
                    success: false,
                    msg: "Your account is Deactivated, Please contact Admin."
                });
            } else if (getUsersEmail[0].blocked == 1) {
                return res.status(200).send({
                    success: false,
                    msg: "Your account is Block, Please contact Admin."
                });
            }
        }
    }
    catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }

}

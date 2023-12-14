const AccountModel = require('../models/account.model');
const UserModel = require('../models/user.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');

exports.getUserEthBal = async (req, res) => {
    const user = req.user_id
    // let bal = await AccountModel.getUserBalBasedOnToken(user, 'ETH')

    // if (bal) {
    //     return res.status(200).send({
    //         success: true,
    //         //  msg: 'Etherum balance',
    //         msg: 'Etherum balance is ' + bal,
    //     })
    // } else {
    //     return res.status(404).send({
    //         success: false,
    //         msg: 'No records found',

    //     })
    // }
let bal =  await AccountModel.getUserBalBasedOnToken(user, 'ETH')
    
    //.then((bal) => {
     // console.log(bal)
        if (bal) {
            return res.status(200).send({
                success: true,
                //  msg: 'Etherum balance',
                msg: 'Etherum balance is ' + bal,
            })
        } else {
            return res.status(404).send({
                success: false,
                msg: 'No records found',

            })
        }
   // })
}

exports.getUserBalBasedOnToken = async (req, res) => {
    const user = req.user_id
    const token = req.params.token

    if (token) {
        let bal = await AccountModel.getUserBalBasedOnToken(user, token.toUpperCase())
        //console.log({'bal': bal})
        if (bal) {
            return res.status(200).send({
                success: true,
                msg: `${token.toUpperCase()} balance is ${bal}`,
            })
        } else {
            return res.status(404).send({
                success: false,
                msg: 'No records found',

            })
        }


    } else {
        return res.status(500).send({
            success: true,
            msg: 'Please provide the token parameter',

        })
    }

}
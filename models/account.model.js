const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();
const UserModel = require('./user.model');
const { hasNextPage } = require('xrpl');


class AccountModel {
    getUserBalBasedOnToken = async (user, token) => {
        var bal = 0
        
        await UserModel.getcoindetail().then(async (coins) => {
            let c = coins.find((el) => el.symbol == token)

              if (!c) return
            
            let wallet = await UserModel.getuserwallet(user, c.id);

            let w = wallet.map((el) => el.Balance)

            bal = w.reduce((a, b) => Number(a) + Number(b));

            return bal

        })

        return bal
    }


}

module.exports = new AccountModel()


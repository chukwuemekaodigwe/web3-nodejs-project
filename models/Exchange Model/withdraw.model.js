const config = require('../../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class WithdrawModel {
    getSingalCoinDetail = async (data) => {
        let sql = `select id,name,symbol,icon,contract,user_ids,minimum_trade_limit,maximum_trade_limit,Bnb_contract,test_contract,withdrawLimitNonKYC,is_withdraw,is_deposit,withdraw_fee,deposit_fee,datetime,trade_fee from coins where id=${data.coin_id}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

   




    balanceCheck = async (data) => {
        let sql = `SELECT balance,coin_id,public_key  FROM user_wallet WHERE user_id=${data.user_id} AND coin_id=${data.coin_id}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    getSingalUser = async (data) => {
        let sql = `select email,email_otp from registration where email ='${data.email}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
    userwithdrawCoins = async (data) => {
        let sql = `select c.contract,c.test_contract,c.Bnb_contract,c.Trc_contract from coins as c where c.id=${data.coin_id}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    
    userWithdraw = async (data) => {
        let sql = `update user_wallet SET balance = (balance-${data.balance}) where user_id=${data.user_id} and coin_id=${data.coin_id}
        `;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    updateUserData = async (data1,data) => {
        let sql = `Update registration SET email_otp =${data1} where email='${data.email}' `;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

}
module.exports = new WithdrawModel;
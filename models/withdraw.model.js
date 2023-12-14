
const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class WithdrawModel {
    userWithdraw = async (withdrawData) => {
        let sql = `INSERT INTO withdraw(user_id, bnb_address, amount, bnb_amount,fee,type, ip) VALUES( '${withdrawData.user_id}'  , '${withdrawData.bnb_address}', '${withdrawData.tokenAmount}', '${withdrawData.bnbAmount}','${withdrawData.fee}', '${withdrawData.type}','${withdrawData.ip}' ) `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUserWithdrawableBalance = async (id) => {
        let sql = `SELECT balance from registration WHERE id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    
    settingData = async (id) => {
        let sql = `SELECT *,COALESCE(getUserWithdrawToday(${id}),0) as todayWithdraw from settings where id = 1`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateBalance = async (withdrawDetails) => {
        let sql = `UPDATE registration SET balance = balance-${withdrawDetails.tokenAmount} WHERE id = '${withdrawDetails.user_id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getWithdrawList = async (id) => {
        let sql = `SELECT amount, bnb_amount, status,type, txn_hash,fee, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(approveDate, '%Y-%m-%d %H:%i:%s') as approveDate FROM withdraw WHERE user_id = '${id}' ORDER BY id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

}

module.exports = new WithdrawModel;
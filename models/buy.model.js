
const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class BuyModel {
    getActivePhase = async () => {
        let sql = `SELECT id, phase, quantity, price, status, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') as start_date, DATE_FORMAT(end_date, '%Y-%m-%d %H:%i:%s') as end_date FROM phase WHERE status = 1`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    insertPurchaseTrx = async (trxData) => {
        let sql = `INSERT INTO transactions(user_id, bnb_address, amount,fee, token,usd_amount,
             withdrable, phase, transactionHash, locking_duration,user_transaction_id,image ) 
        VALUES( '${trxData.user_id}'  , '${trxData.bnb_address}', '${trxData.amount}','${trxData.fee}', '${trxData.token}', '${trxData.usd_amount}', '${trxData.withdrable}', '${trxData.phase}', '${trxData.transactionHash}' , '${trxData.locking_duration}','${trxData.transaction_id}','${trxData.image}') `;

        // let sql = `INSERT INTO transactions(user_id, bnb_address, amount, token, withdrable, phase, transactionHash, locking_duration ) VALUES( '${trxData.user_id}'  , '${trxData.bnb_address}', '${trxData.amount}', '${trxData.token}', '${trxData.withdrable}', '${trxData.phase}', '${trxData.transactionHash}' , '${trxData.locking_duration}') `;
        const [result, fields] = await promisePool.query(sql);
        
        
        return result;

    }


    getUserDetails = async (id) => {
        let sql = `SELECT u.id,u.email,u.balance, u.vesting_balance, u.bnb_address, 
        r.id as refid,r2.id as refid2, u.refer_by FROM registration u LEFT JOIN registration as r ON u.referred_by_id = r.id left join registration as r2 on r2.id=r.referred_by_id where u.id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateBalance = async (balance, id) => {
        let sql = `UPDATE registration SET balance = '${balance}' WHERE id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updatePurchaseTrx = async (payement_id,receipt_url, id) => {
        let sql = `UPDATE transactions SET stripe_payement_id = '${payement_id}',receipt_url = '${receipt_url}',status=1 WHERE id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }
    

   
    updateRefBalance = async (balance, id) => {
        let sql = `UPDATE registration SET balance = COALESCE(balance, 0) + '${balance}' WHERE id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }    

    getTokenPurchase = async (id) => {
// t.stripe_payement_id,t.receipt_url, 
        let sql = `SELECT t.token, t.amount,t.transactionHash,t.fee,t.status, DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') as created_at, p.phase FROM transactions as t LEFT JOIN phase as p ON t.phase = p.id WHERE t.user_id = '${id}' ORDER BY t.id DESC `;
        const [result, fields] = await promisePool.query(sql);
        console.log('id13322',id,result)  
        return result;
    }  
 
    getTokenCheckTransactionId = async (id1) => {
        let sql = `SELECT t.token, t.amount, t.transactionHash,t.fee,t.status, DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM transactions as t  WHERE  t.user_transaction_id='${id1}' ORDER BY t.id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }  
 
    getSettingData = async (id) => {
        let sql = `SELECT * FROM settings as s cross join (select duration,percentage*100 as percent from staking_period where id =1) as a`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }
    
    


    referralTokenCredited = async (trxData) => {
        let sql = `INSERT INTO history(user_id, bnb_address, type, amount, history, _from,referral_percent, ip) VALUES( '${trxData.user_id}'  , '${trxData.bnb_address}', '2' ,'${trxData.amount}', 'Referral Token Credited', '${trxData.from}', '${trxData.refPercentage}', '${trxData.ip}') `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }  
    
    getReferredByUserDetails = async (id) => {
        let sql = `Select balance from registration WHERE id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }    

}

module.exports = new BuyModel;
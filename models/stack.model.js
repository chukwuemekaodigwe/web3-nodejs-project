const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class StackModel {
  
  updateUserBalance = async (data) => {
    // if(data.wallet == "slc"){
      let sql = `UPDATE registration SET balance = balance-'${data.amount}' WHERE id = '${data.user_id}' `;
      const [result, fields] = await promisePool.query(sql);
      
      return result.affectedRows;  
    // }
    // else{
    //   let sql = `UPDATE registration SET vesting_balance = vesting_balance-'${data.amount}' WHERE id = '${data.user_id}' `;
    //   const [result, fields] = await promisePool.query(sql);
    //   return result.affectedRows;  
    // }
  }

  submitStacking = async (data,duration) => {
    console.log("apy data",data);
    let sql = `INSERT INTO stacking(user_id, phase_id, amount, fee, usd_amount, apy, period, remaining, bnb_address, wallet,is_withdraw) VALUES('${data.user_id}', '1', '${data.amount}', '${data.fee}', '${data.usd_amount}', '${data.apy}', '${data.period}', '${duration}', '${data.bnb_address}', 'vesting', '${data.is_withdraw}')`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }

  getUserStackingHistory = async (data) => {
    
    let sql = `SELECT * FROM stacking WHERE user_id=${data.user_id}  ORDER BY id DESC`
    
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  getUserStackingHistorybyid = async (data) => {
    
    let sql = `SELECT * FROM stacking WHERE user_id=${data.id}  ORDER BY id DESC`
    
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  // , DATE_FORMAT(created_at, '%Y-%m-%d') as created_at1
  getStackingPrice = async (data) => {
    let sql = `SELECT * FROM staking_period`
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }

  getEarningHistory = async (data) => {
    let sql = `SELECT h.stacking_id, h.type, r.email ,h.amount, h._from, h.referral_percent, DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM history as h LEFT JOIN registration as r ON h._from = r.id WHERE h.type = '${data.type}' AND h.user_id = '${data.user_id}' ORDER BY h.id DESC`
    
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }

}

module.exports = new StackModel;
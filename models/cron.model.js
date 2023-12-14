const config = require('../config');
const mysql = require('mysql2');
const { id } = require('@ethersproject/hash');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class CronModel {

    getTransaction = async () => {
        let sql = `SELECT * FROM transactions where business_added = 0 ORDER BY id`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateBalance = async (data) => {

        if (data.buyer_id == data.user_id) {
            console.log("Yes");
        } else {
            let sql = `UPDATE business_calculation SET total_business = total_business+'${data.amount}', remaining_balance = remaining_balance+'${data.amount}' WHERE direct_referral_id = ${data.user_id}  `;
            const [result, fields] = await promisePool.query(sql);
            
            console.log(sql);
        }

        let sqlForTrx = `UPDATE transactions SET business_added = 1 WHERE id = ${data.id}  `;
        const [result1, fields1] = await promisePool.query(sqlForTrx);
        
        return result1;
    }

    getReferralUser = async (user_id) => {
        let sql = `SELECT * FROM registration where id = ${user_id}`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getMyReferralList = async (user_id) => {
        let sql = `SELECT b.*,r.stage,r.bnb_address, r.block,m.business,m.percent,m.amount FROM business_calculation as b left join registration as r on r.id=b.user_id left join matching_bonus as m on m.id=r.stage+1 where b.user_id = ${user_id} ORDER BY b.id`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    checkMemberBusiness = async (user_id, amount) => {
        let sql = `SELECT sum(case when remaining_balance>${amount / 2} then ${amount / 2} else remaining_balance end) as balance  FROM business_calculation WHERE user_id = ${user_id}`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateBusinessBalance = async (data) => {
        let sql = `UPDATE business_calculation SET remaining_balance = '${data.remaining_balance}', capture_balance = '${data.capture_balance}' WHERE direct_referral_id = ${data.user_id}  `;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateUserStage = async (data) => {
        let sql = `UPDATE registration SET stage = ${data.stage}, block = ${data.block} WHERE id = ${data.user_id}  `;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    addReward = async (data) => {
        let sql = `INSERT INTO history(user_id, bnb_address, type, amount, usd_amount, history, ip, block, stage) VALUES('${data.user_id}', '${data.bnb_address}','${data.type}', '${data.amount}', '${data.usd_amount}', '${data.history}', '${data.ip}', '${data.block}', '${data.stage}')`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateUserBalance = async (token, user_id) => {
        let sql = `UPDATE registration SET balance = balance + ${token} WHERE id = ${user_id}  `;
        const [result, fields] = await promisePool.query(sql);
        
        console.log(sql);
        return result;
    }

    updateAllocationsUserBalance = async (token, user_id) => {
        let sql = `UPDATE registration SET reward_wallet = reward_wallet + ${token} WHERE id = ${user_id}  `;
        const [result, fields] = await promisePool.query(sql);
        
        console.log(sql);
        return result;
    }

    getPlanDetails = async (block) => {
        let sql = `SELECT * FROM earning_projections WHERE block = ${block}  `;
        const [result, fields] = await promisePool.query(sql);
        
        console.log(sql);
        return result;
    }

    getActivePhase = async () => {
        let sql = `SELECT * FROM phase WHERE status = 1 `;
        const [result, fields] = await promisePool.query(sql);
        
        console.log(sql);
        return result;
    }

    checkTotalPurchase = async (user_id) => {
        let sql = `SELECT COALESCE(sum(token),0) as token FROM transactions WHERE user_id = ${user_id} AND date(created_at) >= '20220701' `;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getCapingPlan = async (amount) => {
        let sql = `SELECT daily_caping FROM caping_plan WHERE minimum < ${amount} AND maximum > ${amount}`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }



    usersStakingIncome = async (amount) => {
        let sql1 = `SELECT round(((amount*apy/100)/period),2) as roi,user_id FROM stacking where status=0 and id not in (select stacking_id from history where date(created_at)=CURRENT_DATE and type=1 and amount>0) and round(((amount*apy/100)/period),2)>0 and is_withdraw=1 order by id desc`;

       const [result1, fields1] = await promisePool.query(sql1);
       
       console.log('res1',result1);
       var i=0;
       while( i < result1.length) {
        let sql2=`UPDATE registration SET balance=COALESCE(balance,0)+${result1[i].roi} WHERE id=${result1[i].user_id}`
    
        const [result2, fields2] = await promisePool.query(sql2);
        i++;
    }
console.log('sdsdsdsds');

        let sql = `insert into history (stacking_id,bnb_address,type,amount,history,_from,created_at,user_id,status)SELECT id,bnb_address,1,round(((amount*apy/100)/period),2),'ROI Token Credited' as history,null,now(),user_id,is_withdraw FROM stacking where status=0 and id not in (select stacking_id from history where date(created_at)=CURRENT_DATE and type=1 and amount>0) and round(((amount*apy/100)/period),2)>0 order by id desc`;
        // console.log(sql);
        const [result, fields] = await promisePool.query(sql);
       
        // console.log('res11111',result);
        
        return result;
    }

    selectCompletedStaking = async (amount) => {
        let sql = `select s.id, s.user_id,s.status, s.amount,amount+round((amount*apy/100),2) as income, s.created_at, s.period, date_add(s.created_at, interval s.period DAY) as enddate from stacking  as s WHERE date_add(s.created_at, interval s.period DAY) < now() AND s.status = 0`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    CompletedStakingHistory = async (data) => {
        let sql = `UPDATE  history SET status=1 WHERE stacking_id=${data} and type=1`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    CompletedStakingData = async (data) => {
        let sql = ` UPDATE  stacking SET status=1 WHERE id=${data}`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    
    updateStakingBalance = async (amount,sum,id) => {
        let sql = ` UPDATE  registration SET stacking_balance=stacking_balance-${amount},balance=balance+${sum} WHERE id=${id}`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }
    
}

module.exports = new CronModel;
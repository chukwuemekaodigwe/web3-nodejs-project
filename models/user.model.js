
const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class UserModel {

    getUsersDetails = async (email, bnb_address) => {
        let sql = `SELECT * FROM registration where email = '${email}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUsersDetailsAddress = async (bnb_address) => {
        let sql = `SELECT * FROM registration where bnb_address = '${bnb_address}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUserDetailsByAddress = async (referral_code) => {
        let sql = `SELECT * FROM registration where referral_code = '${referral_code}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    insertActivity = async (activityData) => {
        let sql = `INSERT INTO activity(activity_type, user_id, ip) VALUES( '${activityData.activity_type}'  , '${activityData.user_id}', '${activityData.ip}' ) `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.insertId;
    }

    saveUserDetails = async (userDetails) => {
        let sql = `INSERT INTO registration(email, password, googleAuthCode, QR_code, referred_by_id, refer_by, referral_code ) VALUES('${userDetails.email}', '${userDetails.password}', '${userDetails.googleAuthCode}', '${userDetails.QR_code}', '${userDetails.referred_by_id}' , '${userDetails.refer_by}' , '${userDetails.referral_code}' ) `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.insertId;
    }

    saveBusinessCalculationArr = async (userDetails) => {
        let sql = `INSERT INTO business_calculation(user_id, direct_referral_id, total_business, capture_balance, remaining_balance) VALUES('${userDetails.user_id}', '${userDetails.direct_referral_id}', '0', '0', '0') `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.insertId;
    }

    accountVerify = async (email) => {
        let sql = `UPDATE registration SET is_email_verify = 1 WHERE email = '${email}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.affectedRows;
    }

    updatePassword = async (password, email) => {
        let sql = `UPDATE registration SET password = '${password}' WHERE email = '${email}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.affectedRows;
    }

    getUsersDetailsById = async (id) => {
        let sql = `SELECT id, first_name, last_name,bnb_address, email, bio, profile_pic, balance as mnt_balance, vesting_balance, block, stage FROM registration where id = '${id}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateProfile = async (reqData, user_id) => {
        let sql = `UPDATE registration SET 
            first_name = '${reqData.first_name}',
            last_name = '${reqData.last_name}',
            profile_pic = '${reqData.profilePic}',
            bio = '${reqData.bio}',
            bnb_address = '${reqData.bnb_address}',
            mobile_number = '${reqData.mobile_number}',
            date_of_birth = '${reqData.date_of_birth}',
            nationality = '${reqData.nationality}'
        WHERE id = ${user_id}
        `;
        const [result, fields] = await promisePool.query(sql);
        
        return result.affectedRows;
    }

    deactiveaccount = async (data) => {
        let sql = `UPDATE registration SET is_active = '${data.is_active}' WHERE id = '${data.id}'`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result.affectedRows;
    }

    getPhase = async () => {
        let sql = `SELECT id, phase, quantity, price, status, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') as start_date, DATE_FORMAT(end_date, '%Y-%m-%d %H:%i:%s') as end_date FROM phase`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getMntWalletDetails = async (id) => {
      
        let sql = `SELECT r.balance as totalMntBalance, r.vesting_balance, getTotalBuy(r.id) as totalTokenBuy, getTotalTokenStack(r.id) as totalTokenStack, getTotalReferralEarning(r.id) as totalReferralEarning, getTokenStackEarning(r.id) as tokenStackEarning  FROM registration as r WHERE r.id = ${id} `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getTotalRefIncome = async (user_id) => {
        let sql = `SELECT sum(amount) as amount FROM history WHERE user_id = ${user_id} AND type = 2 `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getDirectReferralCount = async (user_id) => {
        let sql = `SELECT count(id) as totalRefCount FROM registration WHERE referred_by_id = ${user_id} `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getReferralUsersList = async (user_id) => {
        let sql = `SELECT id, email, first_name, referral_code , DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM registration WHERE referred_by_id = '${user_id}' ORDER BY id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getNodesList = async (user_id) => {
        let sql = `SELECT id, email, bnb_address , DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, (getUserPurchasePublicSale(id)+ coalesce(getTeamPurchasePublicSale(id),0) )as totalBusiness FROM registration WHERE referred_by_id = ${user_id} ORDER BY id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getstatisticsList = async (user_id) => {
        let sql = `SELECT stage, block, getTokenStackEarning(${user_id}) as totalStakingEarning, getTotalWithdraw(${user_id}) as totalWithdraw, getTotalBuy(${user_id}) as totalBuy, getTotalReferralEarning(${user_id}) as totalReferralEarning,(select COALESCE(sum(amount),0) from history where user_id=${user_id} AND type IN(4,5,6)) as totalEarning, (select COALESCE(sum(amount),0) from history where user_id=${user_id} AND type IN(2,4,5,6)) as totalIncome, (select COALESCE(sum(token),0)*0.15 from transactions where user_id=${user_id} and date(created_at) >= '20220701') as totalpurchase from registration WHERE id = ${user_id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    addNewsLetter = async (email) => {
        let sql = `INSERT INTO subscribers(email) VALUES('${email}')`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getNewsLetter = async (email) => {
        let sql = `SELECT * FROM subscribers where email = '${email}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    addcontactRequest = async (data) => {
        let sql = `INSERT INTO contact_us(name, email, phone, subject, message) VALUES('${data.name}', '${data.email}', '${data.phone}', '${data.subject}', '${data.message}')`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getEarningProjections = async (data) => {
        let sql = `SELECT * FROM earning_projections`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUsersReferrals = async (user_id) => {
        let sql = `select a.id, a.email, a.total_deposit, a.created_at, u.email as referred_by,(select sum(amount) from history where user_id='${user_id}') as refEarning,getTeamPurchasePublicSale('${user_id}')as totalDeposit from (select id,total_deposit, bnb_address, referred_by_id, email, created_at from (select * from registration order by referred_by_id, id) registration, (select @pv := '${user_id}') initialisation where find_in_set(referred_by_id, @pv) > 0 and @pv := concat(@pv, ',', id)) as a left join registration as u on u.id=a.referred_by_id ORDER BY a.id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUsersReferralsList = async (user_id) => {
        let sql = `select a.id, a.email, a.total_deposit, a.created_at, u.email as referred_by from (select id,total_deposit, bnb_address, referred_by_id, email, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at from (select * from registration order by referred_by_id, id) registration, (select @pv := '${user_id}') initialisation where find_in_set(referred_by_id, @pv) > 0 and @pv := concat(@pv, ',', id)) as a left join registration as u on u.id=a.referred_by_id ORDER BY a.id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    checkPlanDetails = async (usd_amount) => {
        let sql = `SELECT name FROM caping_plan WHERE minimum < ${usd_amount} AND maximum > ${usd_amount}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getRewardsListQry = async () => {
        let sql = `SELECT * FROM rewards`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getRewardSlots = async (block) => {
        let sql = `SELECT * FROM rewards WHERE blocks <= ${block} order by  blocks DESC LIMIT 1`;
        console.log(sql);
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getBlockExpansionIncomeQry = async () => {
        let sql = `SELECT * FROM block_expansion_income`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getTokenAllocationQry = async () => {
        let sql = `SELECT * FROM token_allocation`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getCapingPlanQry = async () => {
        let sql = `SELECT * FROM caping_plan`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getuserBlog = async (user_id) => {
        let sql = `SELECT id,image,title,description ,blog_type, title_url from blog ORDER BY id DESC  `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }
    getuserblogid = async (data) => {
        let sql = `SELECT id,image,title,introduction,description,blog_type, DATE_FORMAT(datetime, "%M %d, %Y") as created_at from blog WHERE title_url LIKE '${data.id}%'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getRecentuserBlog = async (data) => {
        let sql = `SELECT id,image,title,description,datetime, title_url from blog ORDER BY id DESC LIMIT 5`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUpcomingEventsListQry = async (data) => {
        let sql = `SELECT id, title, description, DATE_FORMAT(datetime, "%d") as created_at_date, DATE_FORMAT(datetime, "%M") as created_at_month FROM blog WHERE blog_type = 2 ORDER BY id`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getUserBlogSlider = async (data) => {
        let sql = `SELECT * from  blog where addslider=1 ORDER BY id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getuserAchiever = async () => {
        let sql = `SELECT id,images,name,designation,bio from achiever  ORDER BY id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

   getkyc = async () => {
        let sql = `SELECT id, first_name, email, kyc_document, kyc_proof_of_address, kyc_document_image, kyc_document_type , kyc_document_type2, kyc_document_image2, kyc_approval, kyc_document2, user_photo, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM registration  WHERE kyc_document !='' ORDER BY created_at DESC`;
        const [result, fields] = await promisePool.query(sql);
        return result;
    }



    updatekycapproval = async (data) => {
        let sql = `UPDATE registration SET  kyc_approval = '1' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    rejectkycapproval = async (data) => {
        let sql = `UPDATE registration SET  kyc_approval = '2' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updatekyc = async (data) => {
        let sql = `UPDATE registration SET  kyc_document = '${data.kyc_document}', date_of_birth = '${data.date_of_birth}', kyc_document2 = '${data.kyc_document2}', kyc_proof_of_address = '${data.kyc_proof_of_address}', kyc_document_image = '${data.kyc_document_image}' , kyc_document_image2 = '${data.kyc_document_image2}' , kyc_document_type = '${data.kyc_document_type}', kyc_document_type2 = '${data.kyc_document_type2}'  ,kyc_approval = '${data.kyc_approval}',   first_name = '${data.first_name}',   user_photo = '${data.user_photo}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    showkyc = async (data) => {
        console.log(data);
        let sql = `SELECT id, first_name, last_name, email, kyc_document, kyc_document2, date_of_birth, kyc_proof_of_address, kyc_document_image, kyc_document_image2, user_photo, is_kyc, kyc_document_type, kyc_document_type2,   kyc_approval, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at FROM registration WHERE id = ${data.id}  `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    updateiskyc = async (data) => {
        let sql = `UPDATE registration SET  is_kyc = '1' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

  

    

    disableiskyc = async (data) => {
        let sql = `UPDATE registration SET  is_kyc = '0' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    showiskyc = async (data) => {
        console.log(data);
        let sql = `SELECT is_kyc FROM registration   `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }


    insertUserWallet = async (data) => {
        let sql = `INSERT INTO user_wallet(user_id, coin_id,Balance,balanceInOrder,public_key,private_key,bnb_publickey,bnb_privatekey,trc_publickey,trc_privatekey,ip,datetime) VALUES('${data.user_id}', '${data.coin_id}', '${data.balance}','0', '${data.public_key}', '${data.private_key}','${data.bnb_publickey}','${data.bnb_privatekey}','${data.trc_publickey}','${data.trc_privatekey}','${data.ip}','${data.datetime}')`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }
    
    updateUserWallet = async (data,user_id,coin_id) => {
        console.log('data',data)
        let sql = `UPDATE user_wallet SET public_key='${data.public_key}',private_key='${data.private_key}' where user_id = ${user_id} and coin_id = ${coin_id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

   getcoindetail = async (data) => {
        console.log(data);
        let sql = `SELECT * FROM coins  where is_visible=1`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getuserwallet = async (data,data1) => {
        // console.log('data',data);
        let sql = `select * from user_wallet where user_id=${data} and coin_id=${data1}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    insertDevice = async (data) => {
        // console.log("insertDevice",data);
        // let sql =  `INSERT INTO device_management (user_id, browsername, browserversion,city,country,ip_address,datetime) VALUES( '${data.user_id}'  , '${data.browsername}', '${data.browserversion}','${data.city}','${data.country}','${data.ip}','${new Date()}'`;
        let sql = `INSERT INTO device_management (user_id, browsername, browserversion, city , country,ip_address, datetime) VALUES('${data.user_id}', '${data.browsername}', '${data.browserversion}', '${data.city }', '${data.country}','${data.ip}','${new Date()}')`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    insertExchangetoICO = async (data) => {
            // console.log("insertDevice",data);
            let newBNB_amount =parseFloat(data.amount*10);
            let sql = `INSERT INTO withdraw (user_id,amount,bnb_amount,fee,status,type) VALUES('${data.user_id}', '${data.amount}', '${newBNB_amount}', '0', '1','4')`;
            const [result, fields] = await promisePool.query(sql);
          
            let sql1 = `UPDATE registration SET balance =balance+${data.amount} WHERE id=${data.user_id}`;
            const [result1, fields1] = await promisePool.query(sql1);
          
            let sql2 = `UPDATE user_wallet SET Balance = Balance-${data.amount} WHERE user_id=${data.user_id} and coin_id=11`;
            const [result2, fields2] = await promisePool.query(sql2);
          
            return result;
        }

    insertICOtoExchange = async (data) => {
        // console.log("insertDevice",data);
        let newBNB_amount =parseFloat(data.amount*10);
        let sql = `INSERT INTO withdraw (user_id, amount,bnb_amount,fee,status,type) VALUES('${data.user_id}', '${data.amount}', '${newBNB_amount}', '0', '1','3')`;
        const [result, fields] = await promisePool.query(sql);
      
        let sql1 = `UPDATE registration SET balance =balance-${data.amount} WHERE id=${data.user_id}`;
        const [result1, fields1] = await promisePool.query(sql1);
      
        let sql2 = `UPDATE user_wallet SET Balance = Balance+${data.amount} WHERE user_id=${data.user_id} and coin_id=11`;
        const [result2, fields2] = await promisePool.query(sql2);
      
        return result;
    }
}

module.exports = new UserModel;
const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class AdminModel {
  
  getAdminInfo = async (data) => {
    let sql = `SELECT * FROM mnm_cp where username = '${data.username}'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }

  getDashboardStatistics = async (data) => {
    let sql = `SELECT COUNT(id)as totalUsers,SUM(CASE WHEN date_format(created_at,'%Y-%m-%d')=CURDATE() THEN 1 ELSE 0 end) as todayRegisteredUsers,
       (select COUNT(id) from subscribers) as totalSubscribers,
       (select COALESCE(sum(amount),0) from withdraw) as totalWithdraw,
       (select COALESCE(sum(amount),0) from stacking) as totalStaking,
       (select coalesce(sum(token),0) from transactions) as totalSell,
       (select coalesce(sum(token),0) from transactions where date(created_at)=CURRENT_DATE) AS todaySell,
       (select coalesce(sum(token),0) from transactions where date(created_at)>=(NOW() - INTERVAL 7 DAY)) AS weekSell,
       (select coalesce(sum(token),0) from transactions where date(created_at)>=(NOW() - INTERVAL 1 MONTH)) AS yearSell
        FROM registration`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }
  

  // getUsersList = async (data) => {
  //   let sql = `SELECT id, bnb_address, email, refer_by,getUserPurchase(id) as purchase_token,coalesce(getUserPurchase(id),0)*(select price from phase where id =3) as purchase_token_usd, balance as mnt_balance, total_deposit, vesting_balance, blocked, created_at from registration ORDER BY id DESC`;
  //   // ,  getTotalDeposit(id) as totalTeamDeposite, getTeamCount(id) as teamCount
  //   const [result, fields] = await promisePool.query(sql);
  //   return result;
  // }
  getUsersList = async (data) => {
    console.log("data",data);
    let fromdate = data.from_date;
    let todate = data.to_date;
    let type = data.type;
    let sql = `SELECT id, bnb_address, email, refer_by,getUserPurchase(id) as purchase_token,coalesce(getUserPurchase(id),0)*(select price from phase where id =3) as purchase_token_usd, balance as mnt_balance, total_deposit, vesting_balance, blocked, created_at from registration where 1`;
    if (type == 2) {
      sql = sql + ` and date(created_at)=CURRENT_DATE `;
    } else if (type == 3) {
      sql = sql + ` and date(created_at)>=(NOW() - INTERVAL 7 DAY) `;
    } else if (type == 4) {
      sql = sql + ` and date(created_at)>=(NOW() - INTERVAL 1 MONTH) `;
    } else {
      if (fromdate) {
        sql = sql + ` and date(created_at)>='${fromdate}'`;
      }
      if (todate) {
        sql = sql + ` and date(created_at)<='${todate}' `;
      }
    }
    sql = sql + ` ORDER BY id DESC `;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  };

  getUsersDetails = async (email) => {
    let sql = `SELECT * FROM registration where email = '${email}'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
}

getUsersListFilter = async (data) => {
    let sql = `SELECT * FROM registration WHERE email LIKE '%${data}%'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
}

  getUsersReferrals = async (data) => {
    let sql = `select a.id, a.email, a.total_deposit, a.created_at, u.email as referred_by,(select sum(amount) from history where user_id='${data.uid}') as refEarning,getTeamPurchase('${data.uid}')as totalDeposit from (select id,total_deposit, bnb_address, referred_by_id, email, created_at from (select * from registration order by referred_by_id, id) registration, (select @pv := '${data.uid}') initialisation where find_in_set(referred_by_id, @pv) > 0 and @pv := concat(@pv, ',', id)) as a left join registration as u on u.id=a.referred_by_id ORDER BY a.id DESC`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }

  getStackingHistory = async (data) => {
    let sql = `SELECT stacking.*, registration.email, getTotalStaking() as totalStaking FROM stacking LEFT JOIN registration ON registration.id=stacking.user_id ORDER BY stacking.id DESC `;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  
  getWithdrawalStatistics = async (data) => {
    let sql = `SELECT sum(CASE WHEN status=0 THEN amount ELSE 0 end) as pendingTokenAmount,
    sum(CASE WHEN  status=0 then bnb_amount else 0 end) as pendingBNBAmount,
      sum(CASE WHEN status=1 THEN amount ELSE 0 end) as approvedTokenAmount,
    sum(CASE WHEN  status=1 then bnb_amount else 0 end) as approvedBNBAmount,
      sum(CASE WHEN status=2 THEN amount ELSE 0 end) as rejectedTokenAmount,
    sum(CASE WHEN  status=2 then bnb_amount else 0 end) as rejectedBNBAmount
       FROM withdraw where type = 1`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }

  getWithdrawalStatisticsCrypto = async (data) => {
    let sql = `SELECT sum(CASE WHEN status=0 THEN amount ELSE 0 end) as pendingTokenAmountCrypto,
    sum(CASE WHEN  status=0 then amount else 0 end) as pendingBNBAmountCrypto,
      sum(CASE WHEN status=1 THEN amount ELSE 0 end) as approvedTokenAmountCrypto,
    sum(CASE WHEN  status=1 then amount else 0 end) as approvedBNBAmountCrypto,
      sum(CASE WHEN status=2 THEN amount ELSE 0 end) as rejectedTokenAmountCrypto,
    sum(CASE WHEN  status=2 then amount else 0 end) as rejectedBNBAmountCrypto
       FROM withdraw where type = 2`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }

  getMntWithdrawalHistory = async (data) => {
    let sql = `SELECT w.*,r.email , u.account_number, u.bank_name, u.ifsc_code FROM withdraw as w inner join registration as r on r.id=w.user_id LEFT join user_bank_detail as u on u.user_id=r.id where w.type = 1 ORDER BY w.id DESC`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  getCryptoMntWithdrawalHistory = async (data) => {
    let sql = `SELECT w.*,r.email , u.account_number, u.bank_name, u.ifsc_code FROM withdraw as w inner join registration as r on r.id=w.user_id LEFT join user_bank_detail as u on u.user_id=r.id where w.type = 2 ORDER BY w.id  DESC`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  getCryptoMntWithdrawalHistoryAdmin = async (data) => {
    let sql = `SELECT w.* , r.bnb_address , r.id as uid , r.email from withdraw as w inner join registration as r on w.bnb_address = r.bnb_address where w.user_id = 1 ORDER BY w.id  DESC`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  


  approveWithdrwalRequest = async (data) => {
    let date = new Date()
      let sql = `UPDATE withdraw SET approveDate ='${date}', status = 1 WHERE id = '${data.request_id}' `;
      const [result, fields] = await promisePool.query(sql);
      
      return result.affectedRows;  
  }

  rejectWithdrwalRequest = async (data) => {
    let sql1 = `SELECT * FROM withdraw where id = '${data.request_id}'`;
    const [result1, fields1] = await promisePool.query(sql1);
    
    if(result1)
    {
      let token = result1[0].amount;
      let user_id = result1[0].user_id;
      let sql3 = `UPDATE registration SET balance = balance+'${token}' WHERE id = '${user_id}' `;
      const [result3, fields3] = await promisePool.query(sql3);
      let sql4 = `UPDATE withdraw SET status = 2 WHERE id = '${data.request_id}' `;
      const [result4, fields4] = await promisePool.query(sql4);
      
      return true;
    }
    else {
      return false;
    }
    // let sql = `UPDATE withdraw SET status = 2 WHERE id = '${data.request_id}' `;
    // const [result, fields] = await promisePool.query(sql);
    // return result.affectedRows;  
  }
  
  getTransactionHistory = async (data) => {
    var type = data.type;
    let user_id = data.user_id;
    let whereUserId = '';
    if (user_id) {
      whereUserId = ` AND tr.user_id = ${user_id} `;
    }
    console.log("whereUserId", whereUserId);
    if (type == 1) {
      var sql = `SELECT tr.*,r.email, p.phase as phase_name,getDateWiseSale(CURRENT_DATE,CURRENT_DATE) AS totalSale FROM transactions as tr inner join registration as r on r.id=tr.user_id LEFT JOIN phase as p ON p.id=tr.phase where date(tr.created_at)=CURRENT_DATE ${whereUserId} ORDER BY tr.id DESC`;
    }
    if (type == 2) {
      var fromdate = data.from_date;
      var todate = data.to_date;
      var sql = `SELECT tr.*,r.email, p.phase as phase_name,getDateWiseSale('${fromdate}','${todate}') AS totalSale FROM transactions as tr inner join registration as r on r.id=tr.user_id LEFT JOIN phase as p ON p.id=tr.phase where date(tr.created_at)>='${fromdate}' and date(tr.created_at)<='${todate}' ${whereUserId} ORDER BY tr.id DESC`;
    }
    if (type == 3) {
      var sql = `SELECT tr.*,r.email, p.phase as phase_name,getTotalSale()  as totalSale FROM transactions as tr inner join registration as r on r.id=tr.user_id LEFT JOIN phase as p ON p.id=tr.phase WHERE 1 ${whereUserId} ORDER BY tr.id DESC`;
    }
    console.log(sql);
    const [result, fields] = await promisePool.query(sql);
    return result;
  }

  getPhaseList = async (data) => {
    let sql = `SELECT * FROM phase`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  
  updatePhase = async (data) => {
    let sql = `UPDATE phase SET price = '${data.price}' WHERE id = '${data.id}'`;
    console.log(sql);
    const [result, fields] = await promisePool.query(sql);
    
    return result.affectedRows;
  } 

  updatecryptowithdraw = async (data) => {
    let sql = `UPDATE withdraw SET status = 1 , txn_hash = '${data.txn_hash}' WHERE id = '${data.id}'`;
    console.log(sql);
    const [result, fields] = await promisePool.query(sql);
    
    return result.affectedRows;
  } 

  updatePhaseStatus = async (data) => {
    if(data.status == 1)
    {
      let sql = `UPDATE phase SET status = '0' WHERE id != '${data.id}'`;
      const [result, fields] = await promisePool.query(sql);
    }
    let sql1 = `UPDATE phase SET status = '${data.status}' WHERE id = '${data.id}'`;
    const [result1, fields1] = await promisePool.query(sql1);
    
    return result1.affectedRows;
  }

  getStackingSetting = async (data) => {
    let sql = `SELECT * FROM stacking_setting`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }

  getSystemSetting = async (data) => {
    let sql = `SELECT * FROM settings`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }

  updateSystemSetting = async (data) => {
    let sql = `UPDATE settings SET 
              deposit_fee = '${data.deposit_fee}',
              withdraw_fee = '${data.withdraw_fee}',
              direct_refer_point = '${data.direct_refer_point}',
              point_price = '${data.point_price}',
              social_media_points = '${data.social_media_points}',
              monthly_withdraw = '${data.monthly_withdraw}',
              locking_duration = '${data.locking_duration}',
              referral_percent = '${data.referral_percent}',
              referral_percent1 = '${data.referral_percent1}'
            WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result.affectedRows;
  }

  updateTradeFee = async (data) => {
    let sql = `UPDATE settings SET 
             
              trade_fee = '${data.trade_fee}'
            WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result.affectedRows;

  }

  getDynamicPrice = async (data) => {
    let sql = `SELECT * FROM dynamic_price`;
    const [result, fields] = await promisePool.query(sql);
    
    return result[0];
  }
  
  getSubscriberList = async (data) => {
    let sql = `SELECT * FROM subscribers ORDER BY id DESC`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  
  changePassword = async (newPassword, admin_id) => {
    let sql = `UPDATE mnm_cp SET password = '${newPassword}' WHERE id = '${admin_id}'`;
    const [result, fields] = await promisePool.query(sql);
    
    return result.affectedRows;
  } 
  
  getActivePhase = async () => {
    let sql = `SELECT id, phase, quantity, price, status, DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') as start_date, DATE_FORMAT(end_date, '%Y-%m-%d %H:%i:%s') as end_date FROM phase WHERE status = 1`;
    const [result, fields] = await promisePool.query(sql);
    
    return result;
  }
  
  insertActivity = async (activityData) => {
    let sql = `INSERT INTO activity(activity_type, user_id, ip) VALUES( '${activityData.activity_type}'  , '${activityData.user_id}', '${activityData.ip}' ) `;
    const [result, fields] = await promisePool.query(sql);
    
    return result.insertId;
  } 
  userblock=async(data)=>{
  let sql=`UPDATE registration set blocked=1 WHERE id= '${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
userUnblock=async(data)=>{
  let sql=`UPDATE registration set blocked=0 WHERE id= '${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
insertblog=async(data)=>{
  let sql = `INSERT INTO blog (image,title,description,blog_type,introduction, title_url) values('${data.image}','${data.title}','${data.description}','${data.blog_type}','${data.introduction}' ,'${data.titleUrl}')`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
updatetblog = async (data) => {
  let img = (!data.image)? '':'image="'+data.image+'", ';
  let sql =`UPDATE blog SET ${img}
            title = '${data.title}',
            blog_type = '${data.blog_type}',
            description = '${data.description}',
            introduction='${data.introduction}',
            title_url='${data.titleUrl}'
            WHERE id = '${data.id}'`;
  console.log(sql);     
  const [result, fields] = await promisePool.query(sql);
  
  return result.affectedRows;
}
getblog = async (data) => {
  let sql = `SELECT id,image,title,description,blog_type,introduction from blog ORDER BY id DESC  `;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
getblogid = async (data) => {
  let sql = `SELECT id,image,title,description,blog_type,introduction from blog WHERE id ='${data.id}'`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
blogdelete = async (data) => {
  let sql = `DELETE  FROM blog WHERE id ='${data.id}'`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
getuserDetails = async (data) => {
  let sql = `SELECT r.*, r1.email as refemail  from registration as r LEFT join registration as r1 on  r.referred_by_id=r1.id WHERE r.id='${data.id}'`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}

showusersDetails = async (data) => {
  let sql = `SELECT first_name, email , bnb_address , id as uid from registration `;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
getBlogSlider = async (data) => {
  let sql = `SELECT id,image,title,description,status,updated_at from  blog_slider  ORDER BY id DESC`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
getblogsliderid = async (data) => {
  let sql = `SELECT id,image,title,description,status from blog_slider WHERE id ='${data.id}'`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
updateBlogSlider = async (data) => {
  let img = (!data.image)? '':'image="'+data.image+'", ';
  let sql =`UPDATE blog_slider SET ${img}
            title = '${data.title}',
            status = '${data.status}',
            description = '${data.description}'
            WHERE id = '${data.id}'`;
            
  const [result, fields] = await promisePool.query(sql);
  
  return result.affectedRows;
}
activeBlog=async(data)=>{
  let sql=`UPDATE blog_slider set status=1 WHERE id= '${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
deactiveBlog=async(data)=>{
  
  let sql=`UPDATE blog_slider set status=0 WHERE id='${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
addBlogslider=async(data)=>{
  let sql=`UPDATE blog set 	addslider=1 WHERE id= '${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
notaddBlogslider=async(data)=>{
  
  let sql=`UPDATE blog set 	addslider=0 WHERE id='${data.id}'`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}
inserAchiever=async(data)=>{
  let sql = `INSERT INTO  achiever (images,name,designation,bio) values('${data.images}','${data.name}','${data.designation}','${data.bio}')`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}

insertTransactionHash=async(data)=>{
  let sql = `INSERT INTO  withdraw (bnb_address,amount,txn_hash,user_id,status,fee) values('${data.bnb_address}','${data.token}','${data.transactionHash}',1,1,0)`;
  const [result,fields]=await promisePool.query(sql);
  
  return result;
}


updateachieve = async (data) => {
  let img = (!data.images)? '':'images="'+data.images+'", ';
  let sql =`UPDATE achiever SET ${img}
            name = '${data.name}',
            designation = '${data.designation}',
            bio = '${data.bio}'
            WHERE id = '${data.id}'`;
         
  const [result, fields] = await promisePool.query(sql);
  
  return result.affectedRows;
}
getachiever = async () => {
  let sql = `SELECT id,images,name,designation,bio from achiever  ORDER BY id DESC  `;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
getachieverid = async (data) => {
  let sql = `SELECT id,images,name,designation,bio from achiever  WHERE id ='${data.id}'`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}
achieverdelete = async (data) => {
  let sql = `DELETE  FROM achiever WHERE id ='${data.id}'`;
  console.log(sql)
  const [result, fields] = await promisePool.query(sql);
  
  return result;
}




updatebuyrequest = async (data) => {
  // let sql1 = `INSERT INTO stacking(user_id, phase_id, amount, fee, usd_amount, apy, period, remaining, bnb_address, wallet) SELECT user_id,1,token,fee,amount,100,100,100,bnb_address,'vesting' from transactions where id ='${data.id}'`;

// console.log('data',data)
  let sql1 = `select COALESCE(balance,0) as balance from registration where id=${data.user_id}`

  let sql = `UPDATE transactions SET status = 1 WHERE id = '${data.id}'`;

  const [result1, fields1] = await promisePool.query(sql1);

// console.log('result11',result1,result1[0].balance,data.token,data.user_id)
  let updatebalance = parseFloat(result1[0].balance) + parseFloat(data.token) 

// console.log('result23',updatebalance)

  let sql2 = `UPDATE registration SET balance = '${updatebalance}' WHERE id = '${data.user_id}'`;


    const [result2, fields2] = await promisePool.query(sql2);
    
    const [result, fields] = await promisePool.query(sql);


  // }
  // let sql1 = `UPDATE transactions SET status = '${data.status}' WHERE id = '${data.id}'`;
  // const [result1, fields1] = await promisePool.query(sql1);
  
  return result.affectedRows;
}

rejectbuyrequest = async (data) => {
  // let sql1 = `INSERT INTO stacking(user_id, phase_id, amount, fee, usd_amount, apy, period, remaining, bnb_address, wallet) SELECT user_id,1,amount,fee,usd_amount,100,100,100,bnb_address,'vesting' from transactions where id ='${data.id}'`;

    let sql = `UPDATE transactions SET status = 2 WHERE id = '${data.id}'`;
    // const [result1, fields1] = await promisePool.query(sql1);
    const [result, fields] = await promisePool.query(sql);

  // }
  // let sql1 = `UPDATE transactions SET status = '${data.status}' WHERE id = '${data.id}'`;
  // const [result1, fields1] = await promisePool.query(sql1);
  
  return result.affectedRows;
}

getwithdrawhistory = async (data) => {
  let sql = `SELECT id,user_id,bnb_address,amount,round(amount*(select price from phase where id =3),2) as amountUSD,bnb_amount,(case when status=1 then 'Approved' when status=2 then 'Rejected' else 'Pending' end) as status, created_at,approveDate,getTotalApprovedWithdraw(${data.user_id}) as totalWithdraw, round(getUserWithdraw(${data.user_id})*(select price from phase where id =3),2) as totalWithdrawUSD from withdraw where user_id=${data.user_id}`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
};

getReferalEarning = async (data) => {
  let sql = `SELECT h.id,h.stacking_id,r.bnb_address,r.email,h.type,h.amount,h.history,h.created_at,h.usd_amount,getTotalReferralEarning(h.user_id) as totalRefEarning,h.referral_percent,round(getTotalReferralEarning(h.user_id)*(select price from phase where id =3),2) as totalRefEarningUSD from history as h left join registration as r on r.id=h._from WHERE h.type=2 and h.user_id =${data.user_id}`;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
};

getstackingEarning = async (data) => {
  let sql = `SELECT id,stacking_id,bnb_address,type,amount,history,created_at,usd_amount,getTokenStackEarning(user_id) as totalEarning,referral_percent,round(getTokenStackEarning(user_id)*(select price from phase where id =3),2) as totalEarningUSD from history WHERE  type=1 and user_id =${data.user_id}`;
  console.log(sql);
  const [result, fields] = await promisePool.query(sql);
  
  return result;
};

getPrchaseHistory = async (data) => {
  let sql = ` select id,amount,token,phase,transactionHash,created_at,user_id,status,usd_amount,getUserPurchase(user_id) as userPurchase,round(getUserPurchase(user_id)*(select price from phase where id =3),2) as userPurchaseUSD from transactions where user_id=${data.user_id} and status=1 order by id DESC `;
  const [result, fields] = await promisePool.query(sql);
  
  return result;
};

 getexchangetransaction = async (data) => {
    let sql = `SELECT et.* , r.email , c.name as coin_name , c.symbol , trx.trx_type_name FROM exchange_transaction as et inner join registration as r on r.id = et.user_id inner join coins as c on c.id = et.coin_id inner join trx_type as trx on trx.id = et.trx_type where et.trx_type = 4 order by et.id desc`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

   updateexchangetransaction = async (data) => {
    let sql = `UPDATE exchange_transaction SET status = 1 , hash = '${data.hash}' WHERE id = '${data.id.id}'`;
    const [result, fields] = await promisePool.query(sql);
    return result;
  }

   rejectexchangetransaction = async (data) => {
    let sql = `UPDATE exchange_transaction SET status = 2 WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);
    return result.affectedRows;
  }

  updateuserwallet = async (data) => {
    let sql = `UPDATE user_wallet SET Balance = Balance+'${data.amount}' WHERE user_id = '${data.user_id}' And coin_id = '${data.coin_id}' `;
    const [result, fields] = await promisePool.query(sql);
    return result.affectedRows;
  }
}
module.exports = new AdminModel;

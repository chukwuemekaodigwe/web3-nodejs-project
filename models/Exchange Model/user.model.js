const config = require('../../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();
const { manageWallet } = require("../../controllers/liveDepositManage");
const { getICOTransfer } = require('../../controllers/Exchange_Controller/user.controller');
class UserModel {
    getusernotification = async (data) => {
        let sql = `Select * from announcement where status=0  ORDER BY id  DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getuserdevice = async (data) => {
        let sql = `Select * from device_management where user_id ='${data.user_id}' order by datetime DESC LIMIT 5`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    getDeviceDetail = async (data) => {
        let sql = `Select * from device_management where user_id ='${data.user_id}' order by datetime`;
        const [result, fields] = await promisePool.query(sql);
           
        
        return result;
    }

    insertDeviceDetail = async (data) => {
        let sql = `INSERT INTO device_management (device, device_date , user_id) values('${data.device}', '${data.device_date}', '${data.user_id}') `;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
      }

      userWallet = async (data) => {
        // console.log('data',data)
        const id = `%${data.user_id}%`
        let sql = `SELECT cm.id,cm.name,cm.symbol,cm.is_deposit,cm.is_withdraw,cm.is_tradable,cm.deposit_fee,cm.withdraw_fee,cm.user_ids as coin_user_id,cm.test_contract,cm.contract,cm.Bnb_contract,cm.Trc_contract,cm.icon,ul.id as wallet_id,ul.user_id,ul.coin_id,concat(ul.balance,'') as balance,ul.balanceInOrder,ul.public_key,ul.private_key,ul.trc_privatekey,ul.trc_publickey,ul.bnb_privatekey,ul.bnb_publickey from coins as cm LEFT JOIN user_wallet as ul ON cm.id=ul.coin_id WHERE   ul.user_id=${data.user_id} ORDER BY id ASC`;
        const [result, fields] = await promisePool.query(sql);
           
        if (result[0].public_key != null) {
            const resp = manageWallet(result);
        
        }
        return result;
      }

      getuserdepositinr = async (data) => {
        console.log("data",data.user_id);
        let sql = ` Select * from deposit_Inr where user_id=${data.user_id} order by transaction_date DESC`;
        const [result, fields] = await promisePool.query(sql);
     
        return result;
      }

      getICOTransfer = async (data) => {
        console.log("data",data.user_id);
        let sql = ` Select * from withdraw where user_id=${data.user_id} and type=4 order by created_at DESC`;
        const [result, fields] = await promisePool.query(sql);
     
        return result;
      }


      favoritepair = async (data) => {
        let sql = `Select * from favorite where  user_id ='${data.user_id}' AND pair_id='${data.pair_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    removePair = async (data) => {
        let sql = `Delete from favorite where  user_id='${data.user_id}' AND pair_id='${data.pair_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    addPair = async (data) => {
        let sql = `INSERT INTO favorite (pair_id, datetime , user_id , status) values('${data.pair_id}', '${data.datetime}', '${data.user_id}' , 1) `;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    getfavoritepair = async (data) => {
        let sql = `SELECT cp.id as pair_id, concat(c1.symbol,'/',c2.symbol) as pair,fa.pair_id,fa.user_id,fa.status,c1.symbol as left_symbol,c1.name as left_coin_name,c2.symbol as right_symbol,c2.name as right_coin_name from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id LEFT JOIN favorite as fa ON fa.pair_id=cp.id   WHERE  fa.user_id='${data.user_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    orderBook = async (data) => {
        // console.log('data111',data)
        let sql = `SELECT o.id as order_id,o.price,o.amount,o.order_type,o.datetime FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id LEFT JOIN coins as cl ON cl.id=cp.left_coin_id LEFT JOIN coins as cr ON cr.id=cp.right_coin_id WHERE o.status=0 AND o.pair_id=${data} ORDER BY o.id DESC limit 20`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
        getQR = async (data) => {
        let sql = `Select email_otp , email_auth, is_enable_google_auth_code , QR_code , googleAuthCode from registration where id ='${data.id}'`;
        const [result, fields] = await promisePool.query(sql);
           // console.log('result',result,data)
        return result;
    }

    
    getUserOrder = async (data) => {
      
        let sql = `SELECT o.id as order_id,o.price,o.status,o.fee_amount,o.amount,o.order_type,o.datetime,cl.id as left_coin_id,cl.symbol as left_symbol,cr.id as right_coin_id,cr.symbol as right_symbol FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id LEFT JOIN coins as cl ON cl.id=cp.left_coin_id LEFT JOIN coins as cr ON cr.id=cp.right_coin_id WHERE o.user_id=${data}  ORDER BY o.id DESC`;
        const [result, fields] = await promisePool.query(sql);
           
        return result; 
    }
    updateUserData = async (data) => {
        let sql = `UPDATE registration SET  email_auth = 1   WHERE email = '${data}'`;
        const [result, fields] = await promisePool.query(sql);
           
        // console.log("result123",result);
        return result;

    }
    updateUserDatas = async (data) => {
        let sql = `UPDATE registration SET  email_otp = '${data.email_otp}'    WHERE email = '${data.email}'`;
        const [result, fields] = await promisePool.query(sql);
           
        // console.log("result123",result);
        return result;

    }

    coinList = async (data) => {
        let sql = `Select * from coins`;
        const [result, fields] = await promisePool.query(sql);
           
        return result; 
    }
    
    getSingalUser = async (data) => {
        let sql = `select email,email_otp from registration where email = '${data.email}'`;
        const [result, fields] = await promisePool.query(sql);
           
        console.log("dataasdf", result);
        return result;
    }

    getCoinListData = async (data) => {
        let sql = `SELECT cp.id as pair_id, concat(c1.symbol,'/',c2.symbol) as pair,c1.symbol as left_symbol,c1.id as left_coin_id,c1.name as left_coin_name,c2.symbol as right_symbol,c2.id as right_coin_id,fa.status,c2.name as right_coin_name from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id INNER JOIN favorite as fa ON fa.pair_id = cp.id AND fa.user_id=${data} where c2.symbol='USDT' Limit 10`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
    
    getCoinList = async (data,data1) => {
        let sql = `select * from (SELECT DISTINCT cp.id as pair_id,cp.is_active as is_active,c1.user_ids,c1.is_tradable as is_tradable, concat(c1.symbol,'/',c2.symbol) as pair,c1.symbol as left_symbol,c1.id as left_coin_id,c1.name as left_coin_name,c2.symbol as right_symbol,c2.id as right_coin_id,c2.name as right_coin_name,case when fa.id is null then 0 else 1 end as status from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id LEFT JOIN favorite as fa ON fa.pair_id=cp.id AND fa.user_id=${data}) as a where pair like '${data1}'  and a.is_active=1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    leftCoinList = async (data) => {
        let sql = `SELECT DISTINCT  cp.id as pair_id,c1.is_tradable, concat(c1.symbol,'/',c2.symbol) as pair,c1.symbol as left_symbol,c1.name as left_coin_name,c1.id as left_coin_id,c2.symbol as right_symbol,c2.id as right_coin_id,c2.name as right_coin_name from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id  where c2.symbol='USDT' and c1.id=${data} Limit 75`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    pairList = async (data) => {
        let sql = `SELECT DISTINCT  cp.id as pair_id,c1.is_tradable, concat(c1.symbol,'/',c2.symbol) as pair,c1.symbol as left_symbol,c1.name as left_coin_name,c1.id as left_coin_id,c2.symbol as right_symbol,c2.id as right_coin_id,c2.name as right_coin_name,case when fa.id is null then 0 else 1 end as status from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id left JOIN favorite as fa ON fa.pair_id = cp.id AND fa.user_id=${data} where c2.symbol='USDT'  and cp.is_active=1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    getUserPiarBalance = async (data,data1,data2) => {
        let sql = `SELECT cp.*,luw.balance as left_balance,ruw.balance as right_balance FROM coin_pairs as cp LEFT JOIN user_wallet as luw ON cp.left_coin_id = luw.coin_id LEFT JOIN user_wallet as ruw ON cp.right_coin_id = ruw.coin_id WHERE  cp.id=${data} AND ruw.user_id =${data1} AND luw.user_id = ${data2}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    } 

     
    
    
    getUsersEmail = async (data) => {
        let sql = `SELECT * ,lpad(registration.id,6,'0') as unic_id FROM registration WHERE email = '${data.email}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
    
    getBuyPairWithWalletBalance = async (data,data1) => {
        let sql = `SELECT cp.*,uw.coin_id,uw.Balance,uw.balanceInOrder,c.symbol FROM coin_pairs as cp LEFT JOIN user_wallet as uw ON cp.right_coin_id = uw.coin_id LEFT JOIN coins as c ON c.id=uw.coin_id WHERE  cp.id=${data} AND uw.user_id = ${data1}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    getSellPairWithWalletBalance = async (data,data1) => {
        let sql = `SELECT cp.*,uw.coin_id,uw.Balance,uw.balanceInOrder,c.symbol FROM coin_pairs as cp LEFT JOIN user_wallet as uw ON cp.left_coin_id = uw.coin_id LEFT JOIN coins as c ON c.id=uw.coin_id WHERE  cp.id=${data} AND uw.user_id = ${data1}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    MarketBuyOrderList = async (data,data1,data2) => {
        let sql = `SELECT * FROM orders where order_type= 'SELL' AND price > ${data} AND pair_id=${data1} AND status=0 and user_id!=${data2} ORDER BY id ASC limit 1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    MarketSellOrderList = async (data,data1,data2) => {
        let sql = `SELECT * FROM orders where order_type= 'BUY' AND price > ${data} AND pair_id=${data1} AND status=0 and user_id!=${data2} ORDER BY id ASC limit 1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    } 


    LimitBuyOrderList = async (data,data1,data2) => {
        let sql = `SELECT * FROM orders where order_type= 'SELL' AND (price <= ${data} || isMarket=1) AND pair_id=${data1} AND status=0  and user_id!=${data2}   ORDER BY id ASC limit 1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    LimitSellOrderList = async (data,data1,data2) => {
        let sql = `SELECT * FROM orders where order_type= 'BUY' AND (price >= ${data} || isMarket=1) AND pair_id=${data1} AND status=0 and user_id!=${data2} ORDER BY id ASC limit 1`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }


    getOrderForCancel = async (data,data1) => {
        let sql = `SELECT o.*,cp.left_coin_id,cp.right_coin_id FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id WHERE o.user_id=${data} AND o.status=0 AND o.id=${data1}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    getOrderForCancelcheck = async (data) => {
        let sql = `SELECT * FROM orders WHERE completed_by=${data} ORDER BY id DESC`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    orderCanceled = async (data,data1,data2) => {
        let sql = `UPDATE orders SET status=2,cancelled_date ='${data}' WHERE id=${data1} AND user_id=${data2}`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
  

    

    disableemailauth = async (data) => {
        let sql = `UPDATE registration SET  email_auth = 0 , email_otp = 0 WHERE id = '${data.id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
      }

      updateUserDatass = async (data) => {
        //   console.log("result123",data);
          if (data.type == 'email_auth') {
        let sql = `UPDATE registration SET email_auth = 0 , email_otp = 0   WHERE email = '${data.email}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
          } else if (data.type == 'google_auth'){
            let sql = `UPDATE registration SET is_enable_google_auth_code = 0   WHERE email = '${data.email}'`;
            const [result, fields] = await promisePool.query(sql);
               
            return result;
          }
        

    }

    getUserAuth = async (data) => {
        let sql = `Select email_otp,email_auth,googleAuthCode,is_enable_google_auth_code,QR_code from registration where id ='${data.user_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    updateUsersAuth = async (data) => {
        let sql = `UPDATE registration SET  is_enable_google_auth_code = 1   WHERE id = '${data.user_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        // console.log("result123",result);
        return result;

    }

    getexuserdetails = async (data) => {
        let sql = `select * from registration   WHERE id = '${data.user_id}'`;
        const [result, fields] = await promisePool.query(sql);
           
        // console.log("result123",result);
        return result;

    }

    trxHistory = async (data) => {
        let sql = `SELECT trx.id,trx.trx_number,concat((trx.usd_amount),'') as usd_amount,concat((trx.amount),'') as amount,concat((trx.trx_fee),'') as trx_fee,ty.trx_type_name,trx.datetime,trx.status,c.symbol FROM exchange_transaction as trx left join trx_type as ty ON trx.trx_type=ty.id LEFT JOIN coins as c ON trx.coin_id=c.id WHERE (trx.trx_type=1 OR trx.trx_type=2  OR trx.trx_type=3 OR trx.trx_type=4)`;

        if (data.user_id) {
            sql += ` AND trx.user_id= ${data.user_id} `;
        }
    
        if (data.from_date) {
            sql += ` AND DATE(trx.datetime) >= '${data.from_date}' `;
        }
    
        if (data.to_date) {
            sql += ` AND DATE(trx.datetime) <= '${data.to_date}' `;
        }
    
        if (data.coin) {
            sql += ` AND trx.coin_id = ${data.coin} `;
        }
    
        if (data.type) {
            sql += ` AND trx.trx_type = ${data.type} `;
        }
    
        sql += ' ORDER BY trx.id DESC ';
        const [result, fields] = await promisePool.query(sql);
           
        // console.log("result123",result);
        return result;

    }
    getUserDashOpenOrder = async (data) => {
        let sql = `SELECT o.id as order_id,o.price,o.amount,o.fee_amount,o.order_type,o.status,o.datetime,cl.id as left_coin_id,cl.symbol as leftSymbol,cr.id as right_coin_id,cr.symbol as rightSymbol FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id LEFT JOIN coins as cl ON cl.id=cp.left_coin_id LEFT JOIN coins as cr ON cr.id=cp.right_coin_id WHERE o.user_id=${data.user_id} AND o.status=0 ORDER BY o.id DESC limit 10`;
        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }

    orderHistory = async (data) => {
     
  if (data.status == 0) {
    var sql = "SELECT o.id as order_id,o.price,o.amount,o.remaining_amount,o.fee_amount,o.order_type,o.status,o.datetime,CONCAT(cl.symbol,cr.symbol,'') as pair,cl.symbol as leftSymbol,cr.symbol as rightSymbol FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id LEFT JOIN coins as cl ON cl.id=cp.left_coin_id LEFT JOIN coins as cr ON cr.id=cp.right_coin_id WHERE o.status=0";
} else {
    var sql = "SELECT o.id as order_id,o.price,o.amount,o.remaining_amount,o.fee_amount,o.order_type,o.status,o.datetime,CONCAT(cl.symbol,cr.symbol,'') as pair,cl.symbol as leftSymbol,cr.symbol as rightSymbol FROM orders as o LEFT JOIN coin_pairs as cp ON o.pair_id=cp.id LEFT JOIN coins as cl ON cl.id=cp.left_coin_id LEFT JOIN coins as cr ON cr.id=cp.right_coin_id WHERE (o.status=0 or o.status=1 or o.status=2 or o.status=3) ";
}
if (data.user_id) {
    sql += ` AND o.user_id = ${data.user_id} `;
}

if (data.from_date != "Invalid date") {
    sql += ` AND DATE(o.datetime) >= '${data.from_date}' `;
}

if (data.order_type == 'BUY' || data.order_type == 'SELL') {
    sql += ` AND o.order_type = '${data.order_type}' `;
}

if (data.order_type == 'COMPLETED' || data.order_type == 'OPEN' || data.order_type == 'CANCEL') {
    sql += ` AND o.status = '${data.order_type == 'COMPLETED' ? 1 : data.order_type == 'OPEN' ? 0 : 2}' `;
}

if (data.to_date != "Invalid date") {
    sql += ` AND DATE(o.datetime) <= '${data.to_date}' `;
}

if (data.left_coin) {
    sql += ` AND cl.id = ${data.left_coin} `;
}

if (data.right_coin) {
    sql += ` AND cr.id = ${data.right_coin} `;
}



sql += ' ORDER BY o.id DESC';

        const [result, fields] = await promisePool.query(sql);
           
        return result;
    }
   
    getlivepriceSLC = async (data) => {
        let sql = `SELECT price as currentPrice  FROM orders WHERE pair_id=10    ORDER BY id DESC LIMIT 1`;
        const [result, fields] = await promisePool.query(sql);

        console.log('result', result);
        
        let sql2 = `SELECT COALESCE(min(price),0) as  low,coalesce(max(price),0) as high,COALESCE(sum(price),0) as volume   FROM orders WHERE pair_id=10 AND date(datetime) = CURDATE()   ORDER BY id DESC LIMIT 1`;
        const [result2, fields2] = await promisePool.query(sql2);

        let sql1 = `SELECT price as oldPrice  FROM orders  WHERE pair_id=10 AND date(datetime) < CURRENT_DATE ORDER BY id DESC LIMIT 1`;
        const [result1, fields1] = await promisePool.query(sql1);
        
        let changePrice  = parseFloat(result[0].currentPrice) - parseFloat(result1[0].oldPrice); 

        let changePercentage = parseFloat(changePrice *100/result1[0].oldPrice);
 
        let newResult = {
            currentPrice: parseFloat(result[0].currentPrice),
            changePercentage : changePercentage,
            low : result2[0].low,
            high : result2[0].high,
            volume : result2[0].volume
        }
         return newResult;
    }
}
module.exports = new UserModel;
const config = require('../../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class AdminModel {

  getfees = async (data) => {
    let sql = `select * from fee_type`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getuserwalletlist = async (data) => {
    let sql = `SELECT Sum(Balance) as Balance ,uw.coin_id,c.name,c.symbol FROM user_wallet as uw LEFT JOIN coins as c on c.id=uw.coin_id
    GROUP BY uw.coin_id`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  admincoinlist = async (data) => {
    let sql = `select id,name,symbol,icon,contract,Bnb_contract,Trc_contract,test_contract,withdrawLimitNonKYC,is_withdraw,is_deposit,withdraw_fee,deposit_fee,datetime,user_ids,is_visible,is_tradable,trade_fee,opening_date,minimum_trade_limit,maximum_trade_limit from coins order by id desc`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getcurrencies = async (data) => {
    let sql = `select * from currency`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getexbankdetails = async (data) => {
    let sql = `select * from user_banks`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  adminpairlist = async (data) => {
    let sql = `SELECT cp.id as pair_id,cp.is_active, concat(c1.symbol,'/',c2.symbol) as pair,c1.symbol as left_symbol,c1.name as left_coin_name,c2.symbol as right_symbol,c2.name as right_coin_name from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getticket = async (data) => {
    console.log('data', data)
    let sql = `select * from ticket where user_id = '${data.user_id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  insertticket = async (data) => {
    let sql = `INSERT INTO ticket (user_id, title, reason , ticket_number) values('${data.user_id}', '${data.title}' , '${data.reason}' , '${data.ticket_number}') `;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  insertticketmessage = async (data) => {
    let sql = `insert into ticket_message SET ticket_id='${data.ticket_number}',sender='${0}',receiver='${data.user_id}',message='Welcome to SilkyExchange' `;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getwebcontent = async (data) => {
    let sql = `select * from web_content`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updatewebcontent = async (data) => {
    let sql = `UPDATE web_content SET  title = '${data.title}', description = '${data.description}', about = '${data.about}', privacy_policy = '${data.privacy_policy}', referral_content = '${data.referral_content}', deposit_content = '${data.deposit_content}' WHERE id = ${data.id}`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }



  updatedeposit_content = async (data) => {
    let sql = `UPDATE web_content SET   deposit_content = '${data.deposit_content}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updatereferral_content = async (data) => {
    let sql = `UPDATE web_content SET   referral_content = '${data.referral_content}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updatekyc_content = async (data) => {
    let sql = `UPDATE web_content SET   kyc_content = '${data.kyc_content}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updateprivacy_policy = async (data) => {
    let sql = `UPDATE web_content SET   privacy_policy = '${data.privacy_policy}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updateterms_condition = async (data) => {
    let sql = `UPDATE web_content SET   terms_condition = '${data.terms_condition}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updateabout = async (data) => {
    let sql = `UPDATE web_content SET   about = '${data.about}' WHERE id = 1`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }


  getannouncement = async (data) => {
    let sql = `select * from announcement`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  insertannouncement = async (data) => {
    let sql = `INSERT INTO announcement (title, description ) values('${data.title}', '${data.description}') `;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  updateannouncement = async (data) => {
    let sql = `UPDATE announcement SET  title = '${data.title}', description = '${data.description}' WHERE id = ${data.id}`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  deleteannouncement = async (data) => {
    let sql = `DELETE FROM  announcement where id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  inactiveannouncement = async (data) => {
    let sql = `UPDATE announcement SET  status = 1 WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  activeannouncement = async (data) => {
    let sql = `UPDATE announcement SET  status = 0 WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getallticket = async (data) => {
    let sql = `SELECT t.*,r.email, r.id, r.first_name FROM ticket as t LEFT JOIN registration as r ON t.user_id = r.id order by t.id desc`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  ticketapprove = async (data) => {
    let sql = `update ticket SET status=1 where ticket_number = ${data.ticket_number}`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  ticketreject = async (data) => {
    let sql = `update ticket SET status=2 where ticket_number = ${data.ticket_number}`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  transactiontype = async (data) => {
    let sql = `select * from trx_type`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  transactionFilterRecord = async (data) => {
    // var from_date = req.body.from_date;
    // var to_date = req.body.to_date;
    // var trx_type = req.body.trx_type;
    let from_date = data.from_date;
    let to_date = data.to_date;
    let trx_type = data.trx_type;

    let sql = `SELECT tr.id,tr.amount,tr.trx_fee,tr.datetime, case when tr.status=1 then 'Completed'  when tr.status=2 then 'Failed' else 'Pending' end as status,  tx.trx_type_name,u.email,c.name as coin_name FROM exchange_transaction as tr LEFT JOIN trx_type as tx ON tx.id=tr.trx_type LEFT JOIN registration as u ON u.id=tr.user_id LEFT JOIN coins as c ON c.id=tr.coin_id  WHERE  1 `;

    if (from_date) {
      sql += `  and DATE(tr.datetime) >= '${from_date}'`;
    }

    if (to_date) {
      sql += `  and DATE(tr.datetime) <=  '${to_date}' `;
    }

    if (trx_type) {
      sql += ` and tr.trx_type= ${trx_type} `;
    }
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  orderfilterrecord = async (data) => {
    // var from_date = req.body.from_date;
    // var to_date = req.body.to_date;
    // var trx_type = req.body.trx_type;
    let from_date = data.from_date1;
    let to_date = data.to_date1;
    let order_type = data.order_type;

    let sql = `SELECT o.id,o.order_type,o.amount,o.remaining_amount,o.price,o.fee_amount,o.completed_date,o.datetime as Date_time, case when o.status=1 then 'Completed'  when o.status=2 then 'Cancelled' else 'Pending' end as status, u.email, concat(c1.symbol,'/',c2.symbol) as Coin_pair  FROM orders as o LEFT JOIN registration as u ON u.id=o.user_id LEFT JOIN coin_pairs as cp ON cp.id=o.pair_id  left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id  WHERE  1 `;

    if (from_date) {
      sql += `  and DATE(o.datetime) >= '${from_date}'`;
    }

    if (to_date) {
      sql += `  and DATE(o.datetime) <=  '${to_date}' `;
    }

    if (order_type) {
      sql += ` and o.order_type= '${order_type}' `;
    }
    console.log(sql);
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

 depositadmininr = async (data) => {
    let sql = `select d.*,  r.email ,c.name  from deposit_Inr as d INNER JOIN registration as r on d.user_id = r.id inner join coins as c on c.id = d.coin_id ORDER BY d.id DESC`;
    const [result, fields] = await promisePool.query(sql);
    return result;
  }

  userdepositadmininr = async (data) => {
    let sql = `select usdt_amount from deposit_Inr where user_id = '${data.user_id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  approvedepositadmininr = async (data) => {
    let sql = `UPDATE deposit_Inr SET  status = 1  WHERE id = '${data.id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  update_user_wallet = async (data) => {
    let sql = `UPDATE user_wallet SET  balance = balance + '${data.usdt_amount}'  WHERE user_id = '${data.user_id}' and coin_id = '${data.coin_id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  rejectdepositadmininr = async (data) => {
    let sql = `UPDATE deposit_Inr SET  status = 2  WHERE id = ${data.id}`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getorders = async (data) => {
    let sql = `SELECT o.*,cp.*,u.email,lpad(u.id,6,'0') as unic_id,concat(c1.symbol,'/',c2.symbol) as pair FROM orders as o LEFT JOIN coin_pairs as cp ON cp.id=o.pair_id LEFT JOIN registration as u ON u.id=o.user_id  left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id  ORDER BY datetime  DESC`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

  getchat = async (data) => {
    let sql = `select * from ticket_message where ticket_id = '${data.ticket_id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }



  updateisactivecoinpair = async (data) => {
    let sql = `update coin_pairs set is_active=0 where id='${data.pair_id}'`;
    const [result, fields] = await promisePool.query(sql);
    console.log("sql", sql);
    return result;
  }

  updatecoinbyid = async (data) => {
    let sql = `UPDATE coins SET  withdraw_fee = '${data.withdraw_fee}', deposit_fee = '${data.deposit_fee}', trade_fee = '${data.trade_fee}', opening_date = '${data.opening_date}', minimum_trade_limit = '${data.minimum_trade_limit}', maximum_trade_limit = '${data.maximum_trade_limit}' WHERE id = ${data.id}`;
    const [result, fields] = await promisePool.query(sql);
    console.log("sql", sql);
    return result;
  }

  updateactivecoinpair = async (data) => {
    let sql = `update coin_pairs set is_active=1 where id='${data.pair_id}'`;
    const [result, fields] = await promisePool.query(sql);

    return result;
  }

}
module.exports = new AdminModel;
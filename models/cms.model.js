const config = require('../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

class CmsModel {
    showFaqs = async () => {
        let sql = `SELECT id, question, answer FROM cmsdata_faq order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
    }

    insertfaqs = async (data) => {
        let sql = `INSERT INTO cmsdata_faq (question, answer) values('${data.question}', '${data.answer}') `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updatefaqs = async (data) => {
        let sql = `UPDATE cmsdata_faq SET  question = '${data.question}', answer = '${data.answer}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      deletefaqs = async (id) => {
        let sql = `DELETE FROM  cmsdata_faq where id = '${id}' `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getaboutus = async () => {
        let sql = `SELECT id, title, description FROM cms_about_us order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updateaboutus = async (data) => {
        let sql = `UPDATE cms_about_us SET  title = '${data.title}', description = '${data.description}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      gettou = async () => {
        let sql = `SELECT id, title, description FROM cms_tou order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updatetou = async (data) => {
        let sql = `UPDATE cms_tou SET  title = '${data.title}', description = '${data.description}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getprivacypolicy = async () => {
        let sql = `SELECT id, title, description FROM cms_privacy_policy order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updateprivacypolicy = async (data) => {
        let sql = `UPDATE cms_privacy_policy SET  title = '${data.title}', description = '${data.description}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getcookiepolicy = async () => {
        let sql = `SELECT id, title, description FROM cms_cookie_policy order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updatecookiepolicy = async (data) => {
        let sql = `UPDATE cms_cookie_policy SET  title = '${data.title}', description = '${data.description}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getcontactus = async () => {
        let sql = `SELECT id, name, email, phone, subject,created_date, message FROM contact_us order by id DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getbankdetails = async () => {
        let sql = `SELECT * FROM user_bank_detail WHERE user_id= 1`;
        // let sql = `SELECT id, user_id, account_id, account_name, dashboard_access,  customer_refunds, branch_name, business_type, bank_name, account_number, holder_name, beneficiary_name, ifsc_code  FROM user_bank_detail where id=1 DESC `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }



      updatebankdetails = async (data) => {
        let sql = `UPDATE user_bank_detail SET  account_name = '${data.account_name}', branch_name = '${data.branch_name}', bank_name = '${data.bank_name}', account_number = '${data.account_number}', ifsc_code = '${data.ifsc_code}', pancard_number = '${data.pancard_number}'   WHERE user_id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getuserbankdetails = async (data) => {
        console.log(data);
        let sql = `SELECT * FROM user_bank_detail where user_id = '${data.id}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      insertusersbankdetails = async (data) => {
        let sql = `INSERT INTO user_bank_detail (user_id,account_name, branch_name, bank_name, account_number, ifsc_code,pancard_number) values('${data.id}','${data.account_name}', '${data.branch_name}', '${data.bank_name}', '${data.account_number}', '${data.ifsc_code}','${data.pancard_number}') `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }
      updateuserbankdetails = async (data) => {
        let sql = `UPDATE user_bank_detail SET  account_name = '${data.account_name}', branch_name = '${data.branch_name}', bank_name = '${data.bank_name}', account_number = '${data.account_number}', ifsc_code = '${data.ifsc_code}' WHERE id = ${data.id}`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      showkyc = async (data) => {
        let sql = `SELECT id, amount, token, fee, user_transaction_id,  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, image, status FROM transactions   where id = '${data.id}'`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      getbuyrequest = async (data) => {
        let sql = `SELECT t.id,r.first_name,r.email,t.amount,t.token,t.fee,t.user_transaction_id, DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') as created_at,t.image, t.user_id, t.status FROM transactions as t left join registration as r on r.id=t.user_id  ORDER BY t.id DESC  `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      
      getbankdetailsusers = async (data) => {
        console.log(data);
        let sql = `SELECT ub.*,r.email  FROM user_bank_detail as ub left join registration as r on r.id=ub.user_id where r.id !=1  ORDER BY ub.id DESC`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      minwithdraw = async (data) => {
        let sql = `SELECT min_withdraw from settings where id = 1  `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updatewithdraw = async (data) => {
        let sql = `UPDATE settings SET  min_withdraw = '${data.min_withdraw}' , daily_max_withdraw = '${data.daily_max_withdraw}'  WHERE id = 1`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      dailymaxwithdrawlimit = async (data) => {
        let sql = `SELECT COALESCE(sum(amount),0) as total FROM withdraw where user_id = '${data.user_id}' and date(created_at)=CURRENT_DATE`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      updatedailymaxwithdrawlimit = async (data) => {
        let sql = `UPDATE settings SET  daily_max_withdraw = '${data.daily_max_withdraw}' WHERE id = 1`;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }

      showwithdrawlimit = async (data) => {
        let sql = `SELECT daily_max_withdraw from settings where id = 1 `;
        const [result, fields] = await promisePool.query(sql);
        
        return result;
      }






}
module.exports = new CmsModel;
const config = require('../../config');
const adminModel = require('../../models/Exchange Model/admin.model');
const { validationResult } = require('express-validator');
const fs = require('fs');
var json2xls = require('json2xls');
const collect = require('collect.js');

const mysql = require('mysql2');
// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
const CryptoJS = require("crypto-js");

exports.getfees = async (req, res) => {
  try {
    let getfees = await adminModel.getfees(req.body);
    if (getfees.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Fees details",
        data: getfees,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getuserwalletlist = async (req, res) => {
  try {
    let getuserwalletlist = await adminModel.getuserwalletlist(req.body);
    if (getuserwalletlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Userwallet Details By Coin Id",
        data: getuserwalletlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.admincoinlist = async (req, res) => {
  try {
    let admincoinlist = await adminModel.admincoinlist(req.body);
    if (admincoinlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get coin list details",
        data: admincoinlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getcurrencies = async (req, res) => {
  try {
    let getcurrencies = await adminModel.getcurrencies(req.body);
    if (getcurrencies.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Fees details",
        data: getcurrencies,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getexbankdetails = async (req, res) => {
  try {
    let getexbankdetails = await adminModel.getexbankdetails(req.body);
    if (getexbankdetails.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Fees details",
        data: getexbankdetails,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.adminpairlist = async (req, res) => {
  try {
    let adminpairlist = await adminModel.adminpairlist(req.body);
    if (adminpairlist.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Fees details",
        data: adminpairlist,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getticket = async (req, res) => {
  try {
    let getticket = await adminModel.getticket(req.body);
    if (getticket.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Ticket details",
        response: getticket,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.insertticket = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    // req.body.user_id = req.body.id;
    // req.body.title = req.body.title;
    // req.body.email = req.body.email;
    // req.body.reason = req.body.reason;
    // req.body.datetime = new Date();
    req.body.ticket_number = new Date().getTime()
    console.log("insertticket", req.body);
    let result = await adminModel.insertticket(req.body);
    if (result) {
      // req.body.user_id = req.body.user_id;

      let result = await adminModel.insertticketmessage(req.body);
      console.log("insertticketmessage", req.body);
      return res.status(200).send({
        success: true,
        msg: "Inserted successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getwebcontent = async (req, res) => {
  try {
    let getwebcontent = await adminModel.getwebcontent(req.body);
    if (getwebcontent.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Fees details",
        data: getwebcontent[0],
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.updatewebcontent = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updatewebcontent(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}



exports.updatedeposit_content = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updatedeposit_content(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updatereferral_content = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updatereferral_content(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updatekyc_content = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updatekyc_content(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateprivacy_policy = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updateprivacy_policy(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateterms_condition = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updateterms_condition(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateabout = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updateabout(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}


exports.getannouncement = async (req, res) => {
  try {
    let getannouncement = await adminModel.getannouncement(req.body);
    if (getannouncement.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Announcement details",
        data: getannouncement,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.insertannouncement = async (req, res) => {
 
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.insertannouncement(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Inserted successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateannouncement = async (req, res) => {
 
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.updateannouncement(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.deleteannouncement = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.deleteannouncement(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Deleted successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.inactiveannouncement = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.inactiveannouncement(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Inactive successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.activeannouncement = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.activeannouncement(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Active successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getallticket = async (req, res) => {
  try {
    let getallticket = await adminModel.getallticket(req.body);
    if (getallticket.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Ticket details",
        data: getallticket,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.ticketapprove = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.ticketapprove(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.ticketreject = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.ticketreject(req.body);
    if (result) {
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.transactiontype = async (req, res) => {
  try {
    let transactiontype = await adminModel.transactiontype(req.body);
    if (transactiontype.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Transaction details",
        data: transactiontype,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};



exports.transactionFilterRecord = async (req, res) => {


console.log("transactionFilterRecord",req.body);
  let transactionFilterRecord = await adminModel.transactionFilterRecord(req.body);




  //   console.log('ssddqqqll',sql)
  // await db.query(sql, function (error, data) 
  if (transactionFilterRecord.length > 0) {
    // if (error) {
    //   return res.status(400).send({
    //     success: false,
    //     msg: "Error : Server not responding please try again later! ",
    //     error
    //   });
    // }


    // const collection = collect(data);
    const collection = collect(transactionFilterRecord);
    const Total_count = collection.count();

    const { Parser } = require('json2csv');

    const fields = ['id', 'email', 'coin_name', 'trx_type_name', 'amount', 'status', 'from_address', 'to_address', 'hash', 'receipt_url', 'datetime'];
    const opts = { fields };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(transactionFilterRecord);

      var userfile = 'transaction_report'.concat('.csv');

      fs.writeFile(`./transaction/csv/${userfile}`, csv, function (err) { //currently saves file to app's root directory
        // if (err) throw err;
        console.log('file saved');
      });


      var userfile = 'transaction_report'.concat('.xls');

      // fs.writeFile(`./excel/${userfile}`,csv, function(err) { 
      //   if (err) throw err;
      //   console.log('file saved');
      // });



    } catch (err) {
      // console.error(err);
    }

    var xls = json2xls(transactionFilterRecord);
    fs.writeFile(`./transaction/excel/${userfile}`, xls, 'binary', (err) => {
      if (err) {
        console.log("writeFileSync :", err);
      }
      console.log(userfile + " file is saved!");
    });

    return res.status(200).send({
      success: true,
      msg: "Transaction Filter Details",
      response: transactionFilterRecord,
      response1: Total_count
    });


  }
  else {
    return res.status(200).send({
      success: false,
      msg: "No data found",
    });
  }

}

exports.orderfilterrecord = async (req, res) => {


  console.log("orderfilterrecord",req.body);
    let orderfilterrecord = await adminModel.orderfilterrecord(req.body);
  
  
  
  
    //   console.log('ssddqqqll',sql)
    // await db.query(sql, function (error, data) 
    if (orderfilterrecord.length > 0) {
      // if (error) {
      //   return res.status(400).send({
      //     success: false,
      //     msg: "Error : Server not responding please try again later! ",
      //     error
      //   });
      // }
  
  
      // const collection = collect(data);
      const collection = collect(orderfilterrecord);
      const Total_count = collection.count();
  
      const { Parser } = require('json2csv');
  
      const fields = ['id', 'email', 'coin_name', 'trx_type_name', 'amount', 'status', 'from_address', 'to_address', 'hash', 'receipt_url', 'datetime'];
      const opts = { fields };
  
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(orderfilterrecord);
  
        var userfile = 'order_report'.concat('.csv');
  
        fs.writeFile(`./transaction/csv/${userfile}`, csv, function (err) { //currently saves file to app's root directory
          // if (err) throw err;
          console.log('file saved');
        });
  
  
        var userfile = 'order_report'.concat('.xls');
  
        // fs.writeFile(`./excel/${userfile}`,csv, function(err) { 
        //   if (err) throw err;
        //   console.log('file saved');
        // });
  
  
  
      } catch (err) {
        // console.error(err);
      }
  
      var xls = json2xls(orderfilterrecord);
      fs.writeFile(`./orders/excel/${userfile}`, xls, 'binary', (err) => {
        if (err) {
          console.log("writeFileSync :", err);
        }
        console.log(userfile + " file is saved!");
      });
  
      return res.status(200).send({
        success: true,
        msg: "orders Filter Details",
        response: orderfilterrecord,
        response1: Total_count
      });
  
  
    }else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  
  
  }


exports.depositadmininr = async (req, res) => {
  try {
    let depositadmininr = await adminModel.depositadmininr(req.body);
    if (depositadmininr.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Deposit INR details",
        data: depositadmininr,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getorders = async (req, res) => {
  try {
    let getorders = await adminModel.getorders(req.body);
    if (getorders.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Order details",
        data: getorders,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.getchat = async (req, res) => {
  try {
    let getchat = await adminModel.getchat(req.body);
    if (getchat.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Order details",
        data: getchat[0],
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "No data found",
      });
    }
  } catch (err) {
    return res.status(200).send({
      success: false,
      msg: "Something went wrong please try again.",
    });
  }
};

exports.approvedepositadmininr = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    console.log("approvedepositadmininr", req.body);
    let result = await adminModel.approvedepositadmininr(req.body);


    if (result) {
      let userdepositadmininr = await adminModel.userdepositadmininr(req.body);

      let usdt_amount = userdepositadmininr[0].usdt_amount;
      let coin_id = req.body.coin_id;
      console.log("update_user_wallet", req.body);
      let update_user_wallet = await adminModel.update_user_wallet(req.body)
      return res.status(200).send({
        success: true,
        msg: "Updated successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.rejectdepositadmininr = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).send({
        success: false,
        msg: `${errors.errors[0].msg}`,
      });
    }
    let result = await adminModel.rejectdepositadmininr(req.body);


    if (result) {

      return res.status(200).send({
        success: true,
        msg: "Rejected successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}


exports.activeDeactivecoinPairs = async (req, res) => {
  try {
    // req.body.left_symbol = req.body.symbol
req.body.symbol = req.body.left_symbol
    console.log('fiiddaat', req.body)
    // let getadminpairbysymbol = await adminModel.getadminpairbysymbol(req.body); {
      if (req.body.is_active== 1) {
        let updateisvisible = await adminModel.updateisactivecoinpair(req.body); {
          // if (error) {
          //   return res.status(400).send({
          //     success: false,
          //     msg: "Error : Server not responding please try again later! ",
          //     error
          //   });
          // } else {
            return res.status(200).send({
              success: true,
              msg: "coin in-active",
            });
          // }

        }
      } else {
        let updatevisible = await adminModel.updateactivecoinpair(req.body); {
          // if (error) {
          //   return res.status(400).send({
          //     success: false,
          //     msg: "Error : Server not responding please try again later! ",
          //     error
          //   });
          // } else {
            return res.status(200).send({
              success: true,
              msg: "coin active",
            });
          // }
        }
      }
    // }
  } catch (error) {
    console.log("error",error);
    return res.status(500).send({
      success: false,
      msg: "Error : internal server error!",
      error
    });
  }
}

exports.updatecoinbyid = async (req, res) => {
  try {
    console.log("updatecoinbyid",req.body);
        let updateisvisible = await adminModel.updatecoinbyid(req.body); {
          // if (error) {
          //   return res.status(400).send({
          //     success: false,
          //     msg: "Error : Server not responding please try again later! ",
          //     error
          //   });
          // } else {
            return res.status(200).send({
              success: true,
              msg: "Coin Updated",
            });
          // }

        }
      
  } catch (error) {
    console.log("error",error);
    return res.status(500).send({
      success: false,
      msg: "Error : internal server error!",
      error
    });
  }
}
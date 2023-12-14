const CmsModel = require('../models/cms.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');
const CryptoJS = require("crypto-js");
const config = require('../config')
const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin.model');

exports.showFaqs = async (req, res) => {
    try{
        let showFaqs = await CmsModel.showFaqs();
        if (showFaqs.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Faqs List",
                data: showFaqs
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  } 

  exports.insertfaqs = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.insertfaqs(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Inserted successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.updatefaqs = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.updatefaqs(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Updated successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.deletefaqs = async (req, res) => {    
    let id = req.body.id;

    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.deletefaqs(id);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Deleted successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.getaboutus = async (req, res) => {
    try{
        let getaboutus = await CmsModel.getaboutus();
        if (getaboutus.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get About us details",
                data: getaboutus[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  } 

  exports.updateaboutus = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.updateaboutus(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Updated successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.gettou = async (req, res) => {
    try{
        let gettou = await CmsModel.gettou();
        if (gettou.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Terms of Use details",
                data: gettou[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  } 

  exports.updatetou = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.updatetou(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Updated successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.getprivacypolicy = async (req, res) => {
    try{
        let getprivacypolicy = await CmsModel.getprivacypolicy();
        if (getprivacypolicy.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Terms of Use details",
                data: getprivacypolicy[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  } 

  exports.updateprivacypolicy = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.updateprivacypolicy(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Updated successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.getcookiepolicy = async (req, res) => {
    try{
        let getcookiepolicy = await CmsModel.getcookiepolicy();
        if (getcookiepolicy.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Cookie Policy details",
                data: getcookiepolicy[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  } 

  exports.updatecookiepolicy = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await CmsModel.updatecookiepolicy(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Updated successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.getcontactus = async (req, res) => {
    try{
        let getcontactus = await CmsModel.getcontactus();
        if (getcontactus.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Cookie Policy details",
                data: getcontactus
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  }

   exports.getbankdetails = async (req, res) => {
    try{
        let getbankdetails = await CmsModel.getbankdetails();
        if (getbankdetails.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Bank details",
                data: getbankdetails[0]
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    }catch(err){
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
  }

  exports.updatebankdetails = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      // console.log(req.body);
      let result1 = await CmsModel.getuserbankdetails(req.body);
     
      if(result1.length > 0){
      let result = await CmsModel.updatebankdetails(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Your Bank Detail Add Successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }else  if(result1.length == 0){
      let result = await CmsModel.insertusersbankdetails(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Your Bank Detail Add Successfully!"
        });
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Something went wrong Please try again!"
        });
      }
    }
    }
    catch(error)
    {
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }


  exports.getuserbankdetails = async (req, res) => {
    let getuserbankdetailsData = await CmsModel.getuserbankdetails(req.body);
    if (getuserbankdetailsData.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get phase details",
            data: getuserbankdetailsData[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getbuyrequest = async (req, res) => {
  try{
      let getbuyrequest = await CmsModel.getbuyrequest();
      // console.log('llllllllll',getbuyrequest);
      
      if (getbuyrequest.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Bank details",
              data: getbuyrequest
          });
      } else {
          return res.status(200).send({
              success: false,
              msg: "No data found"
          });
      }
  }catch(err){
      return res.status(200).send({
          success: false,
          msg: "Something went wrong please try again."
      });
  }
}

exports.getwithdrawhistory = async (req, res) => {
  try {
    let getwithdrawhistory = await adminModel.getwithdrawhistory(req.body);

    if (getwithdrawhistory.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Withdraw History details",
        data: getwithdrawhistory,
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

exports.getReferalEarning = async (req, res) => {
  try {
    let getReferalEarning = await adminModel.getReferalEarning(req.body);

    if (getReferalEarning.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get ReferalEarning details",
        data: getReferalEarning,
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

exports.getstackingEarning = async (req, res) => {
  console.log(req.body);
  try {
    let getstackingEarning = await adminModel.getstackingEarning(req.body);

    if (getstackingEarning.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Earning details",
        data: getstackingEarning,
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

exports.getPrchaseHistory = async (req, res) => {
  try {
    let getPrchaseHistory = await adminModel.getPrchaseHistory(req.body);

    if (getPrchaseHistory.length > 0) {
      return res.status(200).send({
        success: true,
        msg: "Get Purchase details",
        data: getPrchaseHistory,
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

exports.getbankdetailsusers = async (req, res) => {
  let getbankdetailsusersData = await CmsModel.getbankdetailsusers(req.body);
  if (getbankdetailsusersData.length > 0) {
      return res.status(200).send({
          success: true,
          msg: "Get phase details",
          data: getbankdetailsusersData
      });
  } else {
      return res.status(200).send({
          success: false,
          msg: "No data found"
      });
  }
}

exports.minwithdraw = async (req, res) => {
  try{
      let minwithdraw = await CmsModel.minwithdraw();
      // console.log('llllllllll',minwithdraw);
      if (minwithdraw.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Bank details",
              data: minwithdraw[0]
          });
      } else {
          return res.status(200).send({
              success: false,
              msg: "No data found"
          });
      }
  }catch(err){
      return res.status(200).send({
          success: false,
          msg: "Something went wrong please try again."
      });
  }
}

exports.updatewithdraw = async (req, res) => {    
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let result = await CmsModel.updatewithdraw(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Minimum Withdraw limit updated successfully!"
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.dailymaxwithdrawlimit = async (req, res) => {
  try{
      let dailymaxwithdrawlimit = await CmsModel.dailymaxwithdrawlimit(req.body);
      // console.log('llllllllll',dailymaxwithdrawlimit);
      if (dailymaxwithdrawlimit.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Daily Max Withdraw Limit details",
              data: dailymaxwithdrawlimit[0],
          });
      } else {
          return res.status(200).send({
              success: false,
              msg: "No data found"
          });
      }
  }catch(err){
    console.log(err);
      return res.status(200).send({
          success: false,
          msg: "Something went wrong please try again."
      });
  }
}

exports.updatedailymaxwithdrawlimit = async (req, res) => {    
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let result = await CmsModel.updatedailymaxwithdrawlimit(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Minimum Withdraw limit updated successfully!"
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.showwithdrawlimit = async (req, res) => {
  try{
      let showwithdrawlimit = await CmsModel.showwithdrawlimit(req.body);
      // console.log('llllllllll',showwithdrawlimit);
      if (showwithdrawlimit.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Daily Max Withdraw Limit details",
              data: showwithdrawlimit[0],
          });
      } else {
          return res.status(200).send({
              success: false,
              msg: "No data found"
          });
      }
  }catch(err){
    console.log(err);
      return res.status(200).send({
          success: false,
          msg: "Something went wrong please try again."
      });
  }
}
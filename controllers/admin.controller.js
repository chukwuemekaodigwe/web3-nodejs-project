const AdminModel = require('../models/admin.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');
const CryptoJS = require("crypto-js");
const config = require('../config')
const jwt = require('jsonwebtoken');
const BuyModel = require('../models/buy.model')
const emailActivity = require('./emailActivity.controller');

exports.adminLogin = async (req, res) => {
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let result = await AdminModel.getAdminInfo(req.body);
    if (result.length > 0) {
      
      let hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);

                if (result[0].password === hash) 
                {
                    const jwtToken = jwt.sign({
                        email: req.body.username,
                        id: result[0].id,
                        role:'cpadmin'
                    }, config.JWT_SECRET_KEY, {
                        expiresIn: config.SESSION_EXPIRES_IN
                    });
                    
                    // Insert Activity
                    await AdminModel.insertActivity({
                        "user_id": result[0].id,
                        "activity_type": 'Login',
                        "ip": requestIp.getClientIp(req)
                    });

                    return res.status(200).send({
                        success: true,
                        msg: "Login Successfully",
                        data: {
                            'id': result[0].id,
                            'username': result[0].username,
                            'authToken': jwtToken,
                            
                        }
                    });
                } else {
                    return res.status(200).send({
                        success: false,
                        msg: "Password does not match"
                    });
                }
  } else {
      return res.status(200).send({
          success: false,
          msg: "No data found"
      });
  }
  }
  catch(error){
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getDashboardStatistics = async (req, res) => {
  try{
    let result = await AdminModel.getDashboardStatistics(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal Statisctics!",
      data:result
    });
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

exports.getUsersList = async (req, res) => {
  try{
    // console.log("getUsersList",req.body);
    let result = await AdminModel.getUsersList(req.body);
    return res.status(200).send({
      success: true,
      msg: "Users List!",
      data:result
    });
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

exports.getUsersListFilter = async (req, res) => {
  try{
    console.log("getUsersListFilter",req.body.email);
    let result = await AdminModel.getUsersListFilter(req.body.email);
    return res.status(200).send({
      success: true,
      msg: "Users List!",
      data: result
    });
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

exports.loginAsUser = async (req, res) => {
  try{
   
    let getUsersEmail = await AdminModel.getUsersDetails(req.body.email);
        if (getUsersEmail.length > 0) {
               
                    const jwtToken = jwt.sign({
                        email: req.body.email,
                        id: getUsersEmail[0].id,
                        'bnb_address': getUsersEmail[0].bnb_address,
                    }, config.JWT_SECRET_KEY, {
                        expiresIn: config.SESSION_EXPIRES_IN
                    });

                   
                    await AdminModel.insertActivity({
                        "user_id": getUsersEmail[0].id,
                        "activity_type": 'Admin Login As User',
                        "ip": requestIp.getClientIp(req)
                    });

                    return res.status(200).send({
                        success: true,
                        msg: "Login Successfully",
                        data: {
                            'id': getUsersEmail[0].id,
                            'email': getUsersEmail[0].email,
                            'bnb_address': getUsersEmail[0].bnb_address,
                            'authToken': jwtToken,
                        }
                    });
               
        }
        else{
          return res.status(200).send({
                    success: false,
                    msg: "Something went wromg"
                });
        }
  }
  catch(error)
  {
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getUsersReferrals = async (req, res) => {
  try{
    let result = await AdminModel.getUsersReferrals(req.body);
    return res.status(200).send({
      success: true,
      msg: "User Referrals List!",
      data:result
    });
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

exports.getStackingHistory = async (req, res) => {
  try{
    let result = await AdminModel.getStackingHistory(req.body);
    return res.status(200).send({
      success: true,
      msg: "Stacking History!",
      data:result
    });
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

exports.getWithdrawalStatistics = async (req, res) => {
  try{
    let result = await AdminModel.getWithdrawalStatistics(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal Statisctics!",
      data:result
    });
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

exports.getWithdrawalStatisticsCrypto = async (req, res) => {
  try{
    let result = await AdminModel.getWithdrawalStatisticsCrypto(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal Statisctics!",
      data:result
    });
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

exports.getMntWithdrawalHistory = async (req, res) => {
  try{
    let result = await AdminModel.getMntWithdrawalHistory(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal History!",
      data:result
    });
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

exports.getCryptoMntWithdrawalHistory = async (req, res) => {
  try{
    let result = await AdminModel.getCryptoMntWithdrawalHistory(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal History!",
      data:result
    });
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

exports.getCryptoMntWithdrawalHistoryAdmin = async (req, res) => {
  try{
    let result = await AdminModel.getCryptoMntWithdrawalHistoryAdmin(req.body);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal History!",
      data:result
    });
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

exports.approveWithdrwalRequest = async (req, res) => {
  try{
    let result = await AdminModel.approveWithdrwalRequest(req.body);
    // console.log("req.body",req.body);
    let headerMSG =``
            let headerMSG1 = `Silky Exchange is delighted to have you  ! `
    let mailmsg = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
    <h4>Congratulation Your Withdraw Request Have Been Approved By Admin</h4>
    </div>`
     emailActivity.Activity(req.body.email, 'Withdraw Request Approved', headerMSG, headerMSG1, mailmsg);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Withdraw request approved!",
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.rejectWithdrwalRequest = async (req, res) => {
  try{
    let result = await AdminModel.rejectWithdrwalRequest(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Withdraw request rejected!",
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.getTransactionHistory = async (req, res) => {
  try{
    let result = await AdminModel.getTransactionHistory(req.body);
    // console.log(req.body, result);
    return res.status(200).send({
      success: true,
      msg: "Withdrawal History!",
      data:result
    });
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

exports.getPhaseList = async (req, res) => {
  try{
    let result = await AdminModel.getPhaseList(req.body);
    return res.status(200).send({
      success: true,
      msg: "Phase List!",
      data:result
    });
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

exports.updatePhase = async (req, res) => {
  try{
    let result = await AdminModel.updatePhase(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Phase price updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updatecryptowithdraw = async (req, res) => {
  try{
    let result = await AdminModel.updatecryptowithdraw(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Crypto withdraw updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updatePhaseStatus = async (req, res) => {
  try{
    let result = await AdminModel.updatePhaseStatus(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Phase status updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getStackingSetting = async (req, res) => {
  try{
    let result = await AdminModel.getStackingSetting(req.body);
    return res.status(200).send({
      success: true,
      msg: "Stacking Setting!",
      data:result
    });
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

exports.getSystemSetting = async (req, res) => {
  try{
    let result = await AdminModel.getSystemSetting(req.body);
    return res.status(200).send({
      success: true,
      msg: "System Setting!",
      data: result
    });
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

exports.updateSystemSetting = async (req, res) => {
  try{
    let result = await AdminModel.updateSystemSetting(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "System setting updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateTradeFee = async (req, res) => {
  try{
    let result = await AdminModel.updateTradeFee(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Trade Fee updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getDynamicPrice = async (req, res) => {
  try{
    let result = await AdminModel.getDynamicPrice(req.body);
    return res.status(200).send({
      success: true,
      msg: "Dynamic Price!",
      data:result
    });
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

exports.getSubscriberList = async (req, res) => {
  try{
    let result = await AdminModel.getSubscriberList(req.body);
    return res.status(200).send({
      success: true,
      msg: "Subscribers List!",
      data:result
    });
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

exports.changePassword = async (req, res) => {
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let result = await AdminModel.getAdminInfo(req.body);
    if (result.length > 0) 
    {  
      let currentPassword = CryptoJS.SHA256(req.body.currentPassword).toString(CryptoJS.enc.Hex);

      if(currentPassword === result[0].password)
      {
        let newPassword = CryptoJS.SHA256(req.body.newPassword).toString(CryptoJS.enc.Hex);

        if(req.body.newPassword == req.body.confirmPassword)
        {
          let response = await AdminModel.changePassword(newPassword, result[0].id);
          if(response)
          {
            return res.status(200).send({
              success: true,
              msg: "Password updated successfully!"
            });
          }
          else{
            return res.status(200).send({
              success: false,
              msg: "Password update failed!"
            });
          }
        }
        else{
          return res.status(200).send({
            success: false,
            msg: "Confirm password dose not match!"
          });
        }
      }
      else{
        return res.status(200).send({
          success: false,
          msg: "Current password dose not match!"
        });
      }
  } else {
      return res.status(200).send({
          success: false,
          msg: "Invalid user!"
      });
  }
  }
  catch(error){
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getActivePhaseAdmin = async (req, res) => {
  try{
      let getActivePhaseData = await AdminModel.getActivePhase();
      if (getActivePhaseData.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get phase details",
              data: getActivePhaseData[0]
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


exports.userblock = async (req, res) => {
  try{
    console.log("userblock",req.body);
    let result = await AdminModel.userblock(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "User Blocked!",
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.userUnblock = async (req, res) => {
  try{
    let result = await AdminModel.userUnblock(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "User UnBlock!",
      });
     
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.insertblog = async (req, res) => {
  let image=(!req.files['image']) ? null : req.files['image'][0].filename;
  req.body.image = image;
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let title = req.body.title;
    let titleUrl = title.replace(/[^a-zA-Z ]/g, "");
    let titleUrl1 = titleUrl.replace(/ /g, '-');
    req.body.titleUrl = titleUrl1;
    let result = await AdminModel.insertblog(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "insert successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateblog = async (req, res) => {
  let image=(!req.files['image']) ? null : req.files['image'][0].filename;
  if(image){
    req.body.image = image;
  }
  try{  

    let title = req.body.title;
    let titleUrl = title.replace(/[^a-zA-Z ]/g, "");
    let titleUrl1 = titleUrl.replace(/ /g, '-');
    req.body.titleUrl = titleUrl1;   

    let result = await AdminModel.updatetblog(req.body);
    // console.log(result)
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Update successfully!"
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
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getblog = async (req, res) => {
  try{
      let getblog = await AdminModel.getblog();
      if (getblog.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Blog details",
              data: getblog
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
exports.getblogid = async (req, res) => {
  // console.log(req.body)
  try{
      let getblogid = await AdminModel.getblogid(req.body);
     
      if (getblogid.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Blog details",
              data: getblogid
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
exports.blogdelete = async (req, res) => {
  try{
    let result = await AdminModel.blogdelete(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Blocg Deleted!",
      });
      getUsersList();
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.getuserDetails = async (req, res) => {
 
  try{
      let getuserDetails = await AdminModel.getuserDetails(req.body);
     
      if (getuserDetails.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Blog details",
              data: getuserDetails[0]
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

exports.showusersDetails = async (req, res) => {
 
  try{
      let showusersDetails = await AdminModel.showusersDetails(req.body);
     
      if (showusersDetails.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Blog details",
              data: showusersDetails
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

exports.insertTransactionHash = async (req, res) => {
 
  try{
   
      let insertTransactionHash = await AdminModel.insertTransactionHash(req.body);
     
      if (insertTransactionHash) {
          return res.status(200).send({
              success: true,
              msg: "Transaction updated details",
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

exports.getBlogSlider = async (req, res) => {
  try{
      let getBlogSlider = await AdminModel.getBlogSlider();
      if (getBlogSlider.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get BlogSlider ",
              data: getBlogSlider
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

exports.getblogsliderid = async (req, res) => {
  try{
      let getblogsliderid = await AdminModel.getblogsliderid(req.body);
     
      if (getblogsliderid.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Blog details",
              data: getblogsliderid
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

exports.updateBlogSlider = async (req, res) => {
  let image=(!req.files['image']) ? null : req.files['image'][0].filename;
  if(image){
    req.body.image = image;
  }
  try{  
    let result = await AdminModel.updateBlogSlider(req.body);
    // console.log(result)
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Update successfully!"
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
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.activeBlog = async (req, res) => {
  try{
    let result = await AdminModel.activeBlog(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Slider Active!",
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.deactiveBlog = async (req, res) => {
  try{
    let result = await AdminModel.deactiveBlog(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Slider Deactive!",
      });
     
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.addBlogslider = async (req, res) => {
  try{
    let result = await AdminModel.addBlogslider(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Slider Add!",
      });
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.notaddBlogslider = async (req, res) => {
  try{
    let result = await AdminModel.notaddBlogslider(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: " No AddSlider!",
      });
     
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.inserAchiever = async (req, res) => {
  let images=(!req.files['images']) ? null : req.files['images'][0].filename;
  req.body.images = images;
  
  try{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }
    let result = await AdminModel.inserAchiever(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "insert successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.updateachieve = async (req, res) => {
  let images=(!req.files['images']) ? null : req.files['images'][0].filename;
  if(images){
    req.body.images = images;
  }
  // console.log(req.body)
  try{  
    let result = await AdminModel.updateachieve(req.body);
    // console.log(result)
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Update successfully!"
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
    // console.log(error);
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getachiever = async (req, res) => {
  try{
      let getachiever = await AdminModel.getachiever();
      if (getachiever.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Achiever details",
              data: getachiever
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
exports.getachieverid = async (req, res) => {
 
  try{
      let getachieverid = await AdminModel.getachieverid(req.body);
     
      if (getachieverid.length > 0) {
          return res.status(200).send({
              success: true,
              msg: "Get Achiever details",
              data: getachieverid
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
exports.achieverdelete = async (req, res) => {
  try{
    let result = await AdminModel.achieverdelete(req.body);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Achievers Deleted!",
      });
     
    }
    else{
      return res.status(200).send({
        success: false,
        msg: "Something went wrong. Please try again!",
      });
    }
  }
  catch(error)
  {
    return res.status(200).send({
      success: false,
      msg: "Server Error! Please try again.",
      error
    });
  }
}

exports.updatebuyrequest = async (req, res) => {
  try{

               
    let result = await AdminModel.updatebuyrequest(req.body);
    if(result)
        {
          let refPercentage = 0;
          let refPercentage1 = 0;
          let getSettingData = await BuyModel.getSettingData(); // Get locking duration details
          if (getSettingData) {
              refPercentage = getSettingData[0].referral_percent;
              refPercentage1 = getSettingData[0].referral_percent1;
              req.body.locking_duration = getSettingData[0].locking_duration;
          } else {
              req.body.locking_duration = 9;
              refPercentage = 4;
          }
          let getUserDetails = await BuyModel.getUserDetails(req.body.user_id);
// console.log('abc',getUserDetails,req.body.user_id)
          if (getUserDetails[0].refid && getUserDetails[0].refer_by) {
            let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage / 100).toFixed(2);
            let refArr = {
                'user_id': getUserDetails[0].refid,
                'bnb_address': getUserDetails[0].refer_by,
                'amount': refTokenPercentageAmount,
                'from':  req.body.user_id,///getUserDetails[0].refid,
                'refPercentage': refPercentage,
                'status':1,
                'ip': requestIp.getClientIp(req)
            }
            await BuyModel.referralTokenCredited(refArr); // Referral token credited 
            await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid);

        }
                    if (getUserDetails[0].refid2) {
            let refTokenPercentageAmount = parseFloat(req.body.token * refPercentage1 / 100).toFixed(2);
            let refArr = {
                'user_id': getUserDetails[0].refid2,
                'bnb_address': null,
                'amount': refTokenPercentageAmount,
                'from': req.body.user_id, //getUserDetails[0].refid2,//getUserDetails[0].bnb_address,
                'refPercentage': refPercentage1,
                'status':1,
                'ip': requestIp.getClientIp(req)
            }
            await BuyModel.referralTokenCredited(refArr); // Referral token credited 
            await BuyModel.updateRefBalance(refTokenPercentageAmount, getUserDetails[0].refid2);

        }

        let headerMSG =``
                    let headerMSG1 = `Silky Exchange is delighted to have you  ! `
        let mailmsg = `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        <h4>Congratulation You Have Successfully Purchased Token</h4>
        </div>`
         emailActivity.Activity( getUserDetails[0].email, 'Buy Request Approved By Admin',headerMSG, headerMSG1, mailmsg);
      return res.status(200).send({
        success: true,
        msg: "Transaction status updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}



exports.rejectbuyrequest = async (req, res) => {
  try{
    let result = await AdminModel.rejectbuyrequest(req.body);
    let headerMSG =``
            let headerMSG1 = `Silky Exchange is delighted to have you  ! `
    let mailmsg = `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        <h4>Your Token Purchase Has Been Rejected</h4>
        </div>`
         emailActivity.Activity( req.body.email, 'Buy Request Rejected By Admin', headerMSG, headerMSG1,  mailmsg);
    if(result)
    {
      return res.status(200).send({
        success: true,
        msg: "Transaction status rejected successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}

exports.getexchangetransaction = async (req, res) => {
  try {
    console.log();
    console.log(req.body, "result");
    let result = await AdminModel.getexchangetransaction(req.body);
    return res.status(200).send({
      success: true,
      msg: "Exchange Transaction History!",
      data: result
    });
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



exports.updateexchangetransaction = async (req, res) => {
  try {
    console.log("id-->", req.body.id, "hash-->", req.body.hash);
    let result = await AdminModel.updateexchangetransaction(req.body);
    if (result) {
      let headerMSG = ``
      let headerMSG1 = `Silky Exchange is delighted to have you  ! `
      let mailmsg = `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        <h4>Congratulation You Have Successfully Purchased Token</h4>
        </div>`
      emailActivity.Activity(req.body.id.email, 'Exchange Transaction Request Approved By Admin', headerMSG, headerMSG1, mailmsg);
      return res.status(200).send({
        success: true,
        msg: "Exchange Transaction status updated successfully!"
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
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}


exports.rejectexchangetransaction = async (req, res) => {
  try {
    console.log(req.body.id, req.body.email);
    let result = await AdminModel.rejectexchangetransaction(req.body);
    let headerMSG = ``
    let headerMSG1 = `Silky Exchange is delighted to have you  ! `
    let mailmsg = `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:25px;text-align:left;color:#000">
        <h4>Your Exchange Transaction Request Has Been Rejected</h4>
        </div>`
    emailActivity.Activity(req.body.email, 'Exchange Transaction Request Request Rejected By Admin', headerMSG, headerMSG1, mailmsg);
    if (result) {
      let result1 = await AdminModel.updateuserwallet(req.body);
      if (result1)
      {
      return res.status(200).send({
        success: true,
        msg: "Transaction status rejected successfully!"
      });
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
    }
    else {
      return res.status(200).send({
        success: false,
        msg: "Something went wrong Please try again!"
      });
    }
  }
  catch (error) {
    // console.log(error)
    return res.status(200).send({
      success: false,
      msg: "Server Error",
      error
    });
  }
}
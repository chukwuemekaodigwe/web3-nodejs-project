const UserModel = require('../models/user.model');
const requestIp = require('request-ip');
const { validationResult } = require('express-validator');
const CryptoJS = require("crypto-js");

exports.getUserProfile = async (req, res) => {
    console.log("in getUserProfile");
    console.log(req.user_id);
    let getUserDetails = await UserModel.getUsersDetailsById(req.user_id);
    if (getUserDetails.length > 0) {

        let block = getUserDetails[0].block;
        // let block = 30;
        let rankName = '';
        let badge = '';
        if (block > 0) {
            let getUserDetails = await UserModel.getRewardSlots(block);
            if (getUserDetails.length > 0) {
                rankName = getUserDetails[0].rank;
                badge = getUserDetails[0].badge;
            }
        }

        getUserDetails[0].rank_name = rankName;
        getUserDetails[0].badge = badge;

        return res.status(200).send({
            success: true,
            msg: "Get user details",
            data: getUserDetails[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getCountry = async (req, res) => {
    let countryList = await UserModel.getCountry();
    if (countryList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Country list",
            data: countryList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.UpdateUserProfile = async (req, res) => {
    let profile_pic = (!req.files['profile_pic']) ? null : req.files['profile_pic'][0].filename;
    if (profile_pic) {
        req.body.profilePic = profile_pic;
    } else {
        req.body.profilePic = req.body.old_profile_pic;
    }

        const response2 = await fetch(`http://blockchainexpert.co.in:7000/api/eth/getBalance/${req.body.bnb_address}`, {
            method: 'GET', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
    
        });
        const usdPrice = await response2.json();
        if(usdPrice.invalidrequest){
        return res.status(200).send({
            success: false,
            msg: usdPrice.invalidrequest
                });

    }

    let updateProfile = await UserModel.updateProfile(req.body, req.user_id);
    if (updateProfile) {
        // Insert Activity
        // await UserModel.insertActivity({
        //     "user_id": req.user_id,
        //     "activity_type": 'Profile Update',
        //     "ip": requestIp.getClientIp(req)
        // });
        return res.status(200).send({
            success: true,
            msg: "Profile updated!!!"
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.updatePassword = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(200).send({
            success: false,
            msg: `${errors.errors[0].msg}`,
        });
    }

    let getUserDetails = await UserModel.getUsersDetails(req.email);
    if (!getUserDetails) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }

    let oldDbPassword = getUserDetails[0].password;
    let oldPassword = CryptoJS.SHA256(req.body.old_password).toString(CryptoJS.enc.Hex);

    if (oldDbPassword != oldPassword) {
        return res.status(200).send({
            success: false,
            msg: "Old password wrong please enter correct password."
        });
    }

    const hash = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);
    let updatePassword = await UserModel.updatePassword(hash, req.email);
    if (updatePassword) {
        return res.status(200).send({
            success: true,
            msg: "Your password changed successfully."
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.deactiveaccount = async (req, res) => {
    try{
      let result = await UserModel.deactiveaccount(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Account deactivate successfully!"
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
      console.log(error)
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

exports.getPhase = async (req, res) => {
    let getPhaseData = await UserModel.getPhase(req.user_id);
    if (getPhaseData.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get phase details",
            data: getPhaseData
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getMntWalletDetails = async (req, res) => {
console.log("asdf11222",req.body.id);
    let getMntWalletDetails = await UserModel.getMntWalletDetails(req.body.id);
    if (getMntWalletDetails.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get wallet details",
            data: getMntWalletDetails[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getMntWalletsDetails = async (req, res) => {
    console.log("req.body",req.body);
    let getMntWalletDetails = await UserModel.getMntWalletDetails(req.body.user_id);

    if (getMntWalletDetails.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get wallet details",
            data: getMntWalletDetails[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getTotalRefIncome = async (req, res) => {
    let getTotalRefIncome = await UserModel.getTotalRefIncome(req.user_id);
    if (getTotalRefIncome.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get wallet details",
            data: getTotalRefIncome[0].amount
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getDirectReferralCount = async (req, res) => {
    let getDirectReferralCount = await UserModel.getDirectReferralCount(req.user_id);
    if (getDirectReferralCount.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get Total referral details",
            data: getDirectReferralCount[0].totalRefCount
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getReferralUsersList = async (req, res) => {
    let getReferralUsersList = await UserModel.getReferralUsersList(req.user_id);
    if (getReferralUsersList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Referral Users List",
            data: getReferralUsersList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getNodesList = async (req, res) => {
    let getNodesList = await UserModel.getNodesList(req.user_id);
    if (getNodesList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Nodes Users List",
            data: getNodesList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getstatisticsList = async (req, res) => {
    let getstatisticsList = await UserModel.getstatisticsList(req.user_id);
    if (getstatisticsList.length > 0) {

        let totalpurchase = parseFloat(getstatisticsList[0].totalpurchase);
        console.log(totalpurchase);
        let currentActivePlan = '';
        if (totalpurchase > 0) {
            let getPlanListRes = await UserModel.checkPlanDetails(totalpurchase);
            if (getPlanListRes.length > 0) {
                currentActivePlan = getPlanListRes[0].name
            }
        }
        getstatisticsList[0].currentPlan = currentActivePlan;
        return res.status(200).send({
            success: true,
            msg: "Statistics List",
            data: getstatisticsList[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getEarningProjections = async (req, res) => {
    let getEarningProjections = await UserModel.getEarningProjections();
    if (getEarningProjections.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Earning projections List",
            data: getEarningProjections
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getTeamReferral = async (req, res) => {
    let getTeamReferral = await UserModel.getUsersReferrals(req.user_id);
    if (getTeamReferral.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Users Referrals List",
            data: getTeamReferral
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getTeamReferralList = async (req, res) => {
    let getTeamReferralList = await UserModel.getUsersReferralsList(req.body.uid);
    if (getTeamReferralList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Users Referrals List",
            data: getTeamReferralList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getRewardsList = async (req, res) => {
    let getRewardsList = await UserModel.getRewardsListQry();
    if (getRewardsList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Reward List",
            data: getRewardsList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getBlockExpansionIncome = async (req, res) => {
    let getBlockExpansionIncome = await UserModel.getBlockExpansionIncomeQry();
    if (getBlockExpansionIncome.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Block Expansion Income List",
            data: getBlockExpansionIncome
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getTokenAllocation = async (req, res) => {
    let getTokenAllocation = await UserModel.getTokenAllocationQry();
    if (getTokenAllocation.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Token allocation List",
            data: getTokenAllocation
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getCapingPlan = async (req, res) => {
    let getCapingPlan = await UserModel.getCapingPlanQry();
    if (getCapingPlan.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Caping List",
            data: getCapingPlan
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getUpcomingEventsList = async (req, res) => {
    let getUpcomingEventsList = await UserModel.getUpcomingEventsListQry();
    if (getUpcomingEventsList.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Upcoming Events List",
            data: getUpcomingEventsList
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getuserBlog = async (req, res) => {
    let getuserBlog = await UserModel.getuserBlog();
    if (getuserBlog.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "User Blog List",
            data: getuserBlog
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getuserblogid = async (req, res) => {
    //  console.log(req.body)
    try {
        let getuserblogid = await UserModel.getuserblogid(req.body);

        if (getuserblogid.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get Blog details",
                data: getuserblogid
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.getRecentuserBlog = async (req, res) => {
    let getRecentuserBlog = await UserModel.getRecentuserBlog();
    if (getRecentuserBlog.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "User Blog List",
            data: getRecentuserBlog
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getRecentuserBlog = async (req, res) => {
    let getRecentuserBlog = await UserModel.getRecentuserBlog();
    if (getRecentuserBlog.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "User Blog List",
            data: getRecentuserBlog
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.getUserBlogSlider = async (req, res) => {
    try {
        let getUserBlogSlider = await UserModel.getUserBlogSlider();
        if (getUserBlogSlider.length > 0) {
            return res.status(200).send({
                success: true,
                msg: "Get BlogSlider ",
                data: getUserBlogSlider
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "No data found"
            });
        }
    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "Something went wrong please try again."
        });
    }
}

exports.getuserAchiever = async (req, res) => {
    let getuserAchiever = await UserModel.getuserAchiever();
    if (getuserAchiever.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "User Achiever List",
            data: getuserAchiever
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}  

exports.getkyc = async (req, res) => {
    let getkycData = await UserModel.getkyc(req.body);
    if (getkycData.length > 0) {
        return res.status(200).send({
            success: true,
            msg: "Get Kyc details",
            data: getkycData
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}



exports.updatekycapproval = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await UserModel.updatekycapproval(req.body);
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

  exports.rejectkycapproval = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await UserModel.rejectkycapproval(req.body);
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


  exports.updatekyc = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let kyc_document_image = (!req.files['kyc_document_image']) ? null : req.files['kyc_document_image'][0].filename;
      let kyc_document_image2 = (!req.files['kyc_document_image2']) ? null : req.files['kyc_document_image2'][0].filename;
      let user_photo = (!req.files['user_photo']) ? null : req.files['user_photo'][0].filename;

      if (kyc_document_image) {
          req.body.kyc_document_image = kyc_document_image;
      } else {
          req.body.kyc_document_image = req.body.old_kyc_document_image;
      }

      if (kyc_document_image2) {
        req.body.kyc_document_image2 = kyc_document_image2;
    } else {
        req.body.kyc_document_image2 = req.body.old_kyc_document_image2;
    }

    if (user_photo) {
        req.body.user_photo = user_photo;
    } else {
        req.body.user_photo = req.body.old_user_photo;
    }
      req.body.kyc_approval =0
      console.log('hello',req.body.kyc_approval)
      let result = await UserModel.updatekyc(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "Your KYC request submit successfully!"
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
        console.log("kycdetails",error);
      return res.status(200).send({
        success: false,
        msg: "Server Error",
        error
      });
    }
  }

  exports.showkyc = async (req, res) => {
      console.log("123",req.body);
    let showkycData = await UserModel.showkyc(req.body);
    if (showkycData.length > 0) {
        return res.status(200).send({
            success: true,
            msg: " Kyc details",
            data: showkycData[0]
        });
    } else {
        return res.status(200).send({
            success: false,
            msg: "No data found"
        });
    }
}

exports.showuserkyc = async (req, res) => {
    console.log("123",req.body);
  let showuserkycData = await UserModel.showkyc(req.body);
  if (showuserkycData.length > 0) {
      return res.status(200).send({
          success: true,
          msg: " Kyc details",
          data: showuserkycData[0]
      });
  } else {
      return res.status(200).send({
          success: false,
          msg: "No data found"
      });
  }
}

exports.updateiskyc = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await UserModel.updateiskyc(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "KYC Enabled successfully!"
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

  exports.disableiskyc = async (req, res) => {    
    try{
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          return res.status(200).send({
              success: false,
              msg: `${errors.errors[0].msg}`,
          });
      }
      let result = await UserModel.disableiskyc(req.body);
      if(result)
      {
        return res.status(200).send({
          success: true,
          msg: "KYC Disabled!"
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

  exports.showiskyc = async (req, res) => {
    console.log("123",req.body);
  let showiskycData = await UserModel.showiskyc();
  if (showiskycData.length > 0) {
      return res.status(200).send({
          success: true,
          msg: " Kyc details",
          data: showiskycData[0]
      });
  } else {
      return res.status(200).send({
          success: false,
          msg: "No data found"
      });
  }
}


exports.ExchangeTransferICO = async (req, res) => {
    try {

        let exchangeICO;
       if(req.body.exchangetype ==1){
             exchangeICO = await UserModel.insertExchangetoICO(req.body);
        }else if(req.body.exchangetype ==2){
             exchangeICO = await UserModel.insertICOtoExchange(req.body);
            
        }

       
        if (exchangeICO) {

            return res.status(200).send({
                success: true,
                msg: "Amount Transfer  Successfully!!",
            });
        } else {
            return res.status(200).send({
                success: false,
                msg: "Something went wrong please try again."
            });
        }

    } catch (err) {
        return res.status(200).send({
            success: false,
            msg: "User not registered due to internal error",
            err
        });
    }
}
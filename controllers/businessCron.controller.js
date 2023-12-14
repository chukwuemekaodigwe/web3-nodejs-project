const CronModel = require('../models/cron.model');
const requestIp = require('request-ip');

exports.businessCronTest = async (req, res) => {
    console.log("gggg");
}

exports.businessCron = async (req, res) => {
    let getTransaction = await CronModel.getTransaction(); // Get pending buying transactions
    if (getTransaction.length > 0) {
        // console.log('getTransaction.length',getTransaction.length);
        for (let i = 0; i < getTransaction.length; i++) {
            console.log('i', i);
            await checkReferredUser(getTransaction[i], getTransaction[i].user_id, getTransaction[i].user_id); // Check upline referral user function call here
        }
        console.log(">>>>>>>>>>>");
    }

    async function checkReferredUser(transactionDetails, user_id, buyer_id) {

        console.log({
            'amount': transactionDetails.usd_amount,
            'buyerId': user_id,
            'id': transactionDetails.id
        });

        let updateTransaction = await CronModel.updateBalance({
            'amount': transactionDetails.usd_amount,
            'user_id': user_id,
            'buyer_id' : buyer_id,
            'id': transactionDetails.id
        }); // Update balance in business calculation table

        if (updateTransaction.affectedRows) {
            let getReferralUser = await CronModel.getReferralUser(user_id); // Get referral user

            if (getReferralUser[0].referred_by_id && getReferralUser[0].referred_by_id != null) {

                let getMyReferralList = await CronModel.getMyReferralList(user_id); // get my downline referral list
                if (getMyReferralList.length > 0) {

                    let stageBusiness = parseFloat(getMyReferralList[0]['business']);
                    let halfStageBusiness = parseFloat(getMyReferralList[0]['business'] / 2);

                    if (getMyReferralList.length > 1) { // Check my downline referral. Should be atleast two member
                        let checkMemberBusiness = await CronModel.checkMemberBusiness(user_id, getMyReferralList[0].business); // check total members business 

                        if (parseFloat(checkMemberBusiness[0].balance) >= parseFloat(getMyReferralList[0].business)) {

                            for (let j = 0; j < getMyReferralList.length; j++) {
                                let remainingBalance = getMyReferralList[j].remaining_balance;
                                let capture_balance = getMyReferralList[j].capture_balance;
                                let uid = getMyReferralList[j].direct_referral_id;

                                console.log('=====>>>', { 'stageBusiness': stageBusiness, 'halfStageBusiness': halfStageBusiness, 'remainingBalance': remainingBalance, 'capture_balance': capture_balance });

                                if ((stageBusiness >= halfStageBusiness) && (halfStageBusiness <= remainingBalance)) {
                                    remainingBalance = parseFloat(remainingBalance) - parseFloat(halfStageBusiness);
                                    stageBusiness = parseFloat(stageBusiness) - parseFloat(halfStageBusiness);
                                    capture_balance = parseFloat(capture_balance) + parseFloat(halfStageBusiness);
                                } else {
                                    if (stageBusiness >= remainingBalance) {
                                        stageBusiness = parseFloat(stageBusiness) - parseFloat(remainingBalance);
                                        capture_balance = parseFloat(capture_balance) + parseFloat(remainingBalance);
                                        remainingBalance = 0;
                                    } else {
                                        remainingBalance = parseFloat(remainingBalance) - parseFloat(stageBusiness);
                                        capture_balance = parseFloat(capture_balance) + parseFloat(stageBusiness);
                                        stageBusiness = 0;
                                    }
                                }
                                console.log('<<<=====', { 'stageBusiness': stageBusiness, 'halfStageBusiness': halfStageBusiness, 'remainingBalance': remainingBalance, 'capture_balance': capture_balance });

                                let updateBusinessBalanceArr = {
                                    'remaining_balance': parseFloat(remainingBalance).toFixed(2),
                                    'capture_balance': parseFloat(capture_balance).toFixed(2),
                                    'user_id': uid
                                }

                                console.log('updateBusinessBalanceArr', updateBusinessBalanceArr);

                                // Update balance (remaining and capture) in business_calculation table
                                await CronModel.updateBusinessBalance(updateBusinessBalanceArr);

                            }

                            let currentStageBusiness = parseFloat(getMyReferralList[0]['business']).toFixed(2);
                            let stage = parseInt(getMyReferralList[0]['stage']);
                            let block = parseInt(getMyReferralList[0]['block']);
                            let percent = parseFloat(getMyReferralList[0]['percent']).toFixed(2);

                            if (stage == 0) {
                                stage = 1;
                            } else if (stage == 3) {
                                stage = 0;
                                block = block + parseInt(1);
                            } else {
                                stage = stage + parseInt(1);
                            }

                            console.log('updateUserStageArr', { 'stage': stage, 'block': block, 'user_id': user_id });
                            // Once level completed (update user's stage and block)
                            let updateUserStage = await CronModel.updateUserStage({ 'stage': stage, 'block': block, 'user_id': user_id });

                            // console.log('updateUserStage', updateUserStage);

                            let getActivePhase = await CronModel.getActivePhase();
                            let currentUsdPrice = 0.15;
                            if (getActivePhase.length > 0) {
                                currentUsdPrice = parseFloat(getActivePhase[0].price);
                            }

                            rewardAmount = currentStageBusiness * percent / 100;
                            // get total token purchased 
                            let checkTotalPurchase = await CronModel.checkTotalPurchase(user_id);

                            console.log('checkTotalPurchase', checkTotalPurchase);

                            let userPurchasedToken = 0;
                            if (checkTotalPurchase.length > 0) {
                                userPurchasedToken = checkTotalPurchase[0].token;
                                // console.log('userPurchasedToken', userPurchasedToken);
                                if (userPurchasedToken) {

                                    let userPurchasedTokenInUSD = parseFloat(userPurchasedToken) * currentUsdPrice;
                                    console.log('userPurchasedTokenInUSD', userPurchasedTokenInUSD);
                                    // get caping plan
                                    let getCapingPlan = await CronModel.getCapingPlan(userPurchasedTokenInUSD);

                                    console.log('getCapingPlan', getCapingPlan);

                                    if (getCapingPlan.length > 0) {
                                        let capingAmount = getCapingPlan[0].daily_caping;

                                        if (rewardAmount > capingAmount) {
                                            console.log('reward amount greater hai caping amount se');
                                            rewardAmount = capingAmount;
                                        }
                                        let tokenBalance = parseFloat((rewardAmount) / currentUsdPrice).toFixed(2);
                                        console.log('rewardAmount,  tokenBalance', rewardAmount, tokenBalance);

                                        // Once level completed (Insert reward transaction in history table)
                                        let rewardArr = {
                                            'bnb_address': getMyReferralList[0]['bnb_address'],
                                            'type': 4,
                                            'amount': tokenBalance,
                                            'usd_amount': rewardAmount,
                                            'history': 'Level Complete',
                                            'ip': requestIp.getClientIp(req),
                                            'user_id': user_id,
                                            'block': block,
                                            'stage': stage
                                        }
                                        console.log('rewardArr', rewardArr);
                                        let addReward = await CronModel.addReward(rewardArr);
                                        console.log('addReward', addReward);
                                        if (addReward) {
                                            // Balance column update on registration table
                                            let addUserBalance = await CronModel.updateUserBalance(tokenBalance, user_id);
                                            console.log('addUserBalance', addUserBalance);
                                        }
                                    }
                                }
                            }

                            // Checking in which plan block exists
                            let getPlanDetails = await CronModel.getPlanDetails(block);
                            if (getPlanDetails.length > 0) {
                                let rewards = getPlanDetails[0].rewards;
                                let allocations = getPlanDetails[0].allocations;

                                if (allocations) {
                                    // Allocations data insert
                                    let allocationsArr = {
                                        'bnb_address': getMyReferralList[0]['bnb_address'],
                                        'type': 5,
                                        'amount': allocations,
                                        'usd_amount': parseFloat(allocations) * currentUsdPrice,
                                        'history': 'Allocations',
                                        'ip': requestIp.getClientIp(req),
                                        'user_id': user_id,
                                        'block': block,
                                        'stage': stage
                                    }
                                    console.log('allocationsArr', allocationsArr);
                                    await CronModel.addReward(allocationsArr);

                                    await CronModel.updateAllocationsUserBalance(allocations, user_id);
                                    console.log('Rewards balance update');                                    
                                }

                                if (rewards) {
                                    //Rewards data insert
                                    let rewardsArr = {
                                        'bnb_address': getMyReferralList[0]['bnb_address'],
                                        'type': 6,
                                        'amount': parseFloat(rewards) / currentUsdPrice,
                                        'usd_amount': rewards,
                                        'history': 'Rewards',
                                        'ip': requestIp.getClientIp(req),
                                        'user_id': user_id,
                                        'block': block,
                                        'stage': stage
                                    }
                                    console.log('rewardsArr', rewardsArr);
                                    await CronModel.addReward(rewardsArr);

                                    let rewAmount = parseFloat(rewards) / currentUsdPrice;
                                    await CronModel.updateUserBalance(rewAmount, user_id);
                                    console.log('Rewards balance update');
                                }
                            }
                        }
                    }
                }

                // console.log(1);
                // await sleep(3000);
                // console.log(2);  
                // If referral user exist then call function again
                await checkReferredUser(transactionDetails, getReferralUser[0].referred_by_id, buyer_id);
            } else {
                
            }
        }
    }
}

// function sleep(ms) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// }



exports.usersStakingIncome = async (db, req, res) => {
    console.log(" in usersStakingIncome");
    let data = await CronModel.usersStakingIncome();

}

// exports.updateCompleteStaking = async (db, req, res) => {
//     console.log("in updateCompleteStaking");
//     let data = await CronModel.selectCompletedStaking();
   
//         if(data.length>0){
//         if (err) { } else {
//             var ids = []
//             for (var i = 0; i < data.length; i++) {
//                 var id = data[i].id;
//                 console.log(id);
//                 ids[i] = id
//             }
//             var str = ids.join([separator = ',']);
//             console.log("str- ",str);
         
            
//             await CronModel.CompletedStakingHistory(data[0].id);
//             await CronModel.CompletedStakingData(data[0].id);
//             await CronModel.updateStakingBalance(data[0].amount,data[0].income,data[0].user_id);

          
//         }
//     }
// }


exports.updateCompleteStaking = async (db, req, res) => {
    console.log("in updateCompleteStaking");
    let data = await CronModel.selectCompletedStaking();
   
        if(data.length>0){
            // console.log("in updateCompleteStaking",data.length);
            
            for(let i=0; i<data.length; i++){

                await CronModel.CompletedStakingHistory(data[i].id);
                await CronModel.CompletedStakingData(data[i].id);
                await CronModel.updateStakingBalance(data[i].amount,data[i].income,data[i].user_id);
                // console.log('i',i)
            }
       
    }
}
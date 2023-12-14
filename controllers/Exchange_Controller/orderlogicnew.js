
const config = require('../config');
const userModel = require('../models/Exchange Model/user.model');



const mysql = require('mysql2');
// create the pool
const pool = mysql.createPool({host:config.mysqlHost, user: config.user,password: config.password, database: config.database,port: config.mysqlPort});
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
// query database using promises




exports.LimitBuyOrderList = async function(type,user_id,amount,withFeeAmount,isMarket,price,pair_id,fee,left_coin_id,right_coin_id,res){
    
    
    var currentAmount = amount;
    var InsertData = {
        "isMarket":isMarket,
        "order_type":type,
        "amount":amount,
        "remaining_amount":amount,
        "fee_type_id":1,
        "fee_amount":fee,
        "status":0,
        "price":price,
        "pair_id":pair_id,
        "user_id":user_id,
        "datetime":new Date(),
        "completed_by":0
    }

    const [orderRes, error]  = await promisePool.query(`insert into orders SET ?`,InsertData);
  
// await db.query(orderQueries.InsertOrder,InsertData,async function(error,orderRes){
    
    var newOrderID = orderRes.insertId;
    
    withFeeAmount = withFeeAmount.toFixed(6);
    let balanceInOrder = parseFloat(amount * price).toFixed(6);
    // console.log('balanceInOrder', balanceInOrder)
    if(type =='BUY'){
        let balanceInOrder = parseFloat(amount * price).toFixed(6);
        await promisePool.query(`UPDATE user_wallet SET Balance=Balance-${withFeeAmount}, balanceInOrder=balanceInOrder+${balanceInOrder} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`);
    }else{
        let balanceInOrder = parseFloat(amount).toFixed(6);
   
        await promisePool.query(`UPDATE user_wallet SET Balance=Balance-${withFeeAmount}, balanceInOrder=balanceInOrder+${balanceInOrder} WHERE coin_id = ${left_coin_id} AND user_id=${user_id} `);
    }

        while(currentAmount > 0)
        {

            let result =''

            if(type == 'BUY'){
                result = (isMarket == 1)? await userModel.MarketBuyOrderList(price,pair_id,user_id) : await userModel.LimitBuyOrderList(price,pair_id,user_id)

                //  qqLimit = (isMarket == 1)?  orderQueries.MarketBuyOrderList :orderQueries.LimitBuyOrderList;                
            }else{
                result = (isMarket == 1)? await userModel.MarketSellOrderList(price,pair_id,user_id) : await userModel.LimitSellOrderList(price,pair_id,user_id)
  
            }
            

            // const [result,fields] = await promisePool.query(qqLimit,[price,pair_id]);
            
                if(result.length>0)
                {
                  
                    // console.log('result',result);
                    var remainingAmount = result[0].remaining_amount;
                    var oldOrdId = result[0].id;
                    var old_price = result[0].price;
                    var Find_user_id = result[0].user_id;

                    var executeAmountForCreator = 0;
                    var executeAmountForFind = 0;
                    
                    if(remainingAmount>currentAmount){
                        await promisePool.query(`UPDATE orders SET remaining_amount=remaining_amount-${currentAmount} WHERE id = ${oldOrdId}`);
                        await promisePool.query(`UPDATE orders SET remaining_amount=0,completed_by=${oldOrdId},status=1 WHERE id = ${newOrderID}`);
                    
                        executeAmountForCreator = currentAmount;
                        executeAmountForFind = remainingAmount-currentAmount;

                        remainingAmount=remainingAmount-currentAmount;
                        currentAmount=0;

                    }else if(remainingAmount<currentAmount){
                       
                        await promisePool.query(`UPDATE orders SET remaining_amount=0,completed_by=${newOrderID},status=1 WHERE id = ${oldOrdId}`);
                        await promisePool.query(`UPDATE orders SET remaining_amount=${currentAmount}-${remainingAmount} WHERE id = ${newOrderID}`);
                                                
                        executeAmountForCreator = currentAmount-remainingAmount;
                        executeAmountForFind = remainingAmount;
                        
                        currentAmount=currentAmount-remainingAmount;
                        remainingAmount=0;
                    }else{
                        await promisePool.query(`UPDATE orders SET remaining_amount=0,completed_by=${oldOrdId},status=1 WHERE id = ${newOrderID}`);
                        await promisePool.query(`UPDATE orders SET remaining_amount=0,completed_by=${newOrderID},status=1 WHERE id = ${oldOrdId}`);
                       
                        executeAmountForCreator = currentAmount;
                        executeAmountForFind = remainingAmount;
                       
                        remainingAmount=0;
                        currentAmount=0;               
                        
                          }

                    if(type =='BUY'){
                        //    console.log('7',`UPDATE user_wallet SET Balance=Balance+${executeAmountForFind}, balanceInOrder=balanceInOrder-${executeAmountForFind} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`)  
                        //    console.log('10',`UPDATE user_wallet SET Balance=Balance+${executeAmountForCreator*price}, balanceInOrder=balanceInOrder-${executeAmountForCreator*price} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id} `)
                        //     await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${executeAmountForCreator}, balanceInOrder=balanceInOrder-${executeAmountForCreator} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`);
                        //     await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${executeAmountForCreator*price}, balanceInOrder=balanceInOrder-${executeAmountForCreator*price} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id} `);
                        
                    //    console.log('BUYsssssss',executeAmountForCreator,price, `UPDATE user_wallet SET  balanceInOrder=balanceInOrder-${parseFloat(executeAmountForCreator * price)} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`)
    
                       
                        /*For Seller */
                                                                                                                    //* * old_price
                        await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${parseFloat(executeAmountForCreator  * old_price).toFixed(5)} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id}`);
    
                        await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${parseFloat(executeAmountForCreator).toFixed(5)} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`);
    
                        await promisePool.query(`UPDATE user_wallet SET balanceInOrder=balanceInOrder-${executeAmountForFind*old_price} WHERE coin_id = ${left_coin_id} AND user_id=${Find_user_id}`);
    
                        await promisePool.query(`UPDATE user_wallet SET  balanceInOrder=balanceInOrder-${parseFloat(executeAmountForCreator * price)} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`);
                      
                      
                          console.log('7',executeAmountForFind,old_price,`UPDATE user_wallet SET balanceInOrder=balanceInOrder-${executeAmountForFind*old_price} WHERE coin_id = ${left_coin_id} AND user_id=${Find_user_id}`)  
                          console.log('10',executeAmountForCreator,price,`UPDATE user_wallet SET  balanceInOrder=balanceInOrder-${parseFloat(executeAmountForCreator * price)} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`)
                       
    
                        }else{
                        //        console.log('8',`UPDATE user_wallet SET Balance=Balance+${executeAmountForCreator*price}, balanceInOrder=balanceInOrder-${executeAmountForCreator*price} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`)
                        //  console.log('9',`UPDATE user_wallet SET Balance=Balance+${executeAmountForFind}, balanceInOrder=balanceInOrder-${executeAmountForFind} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id}`)
                         
                        //     await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${executeAmountForCreator*price}, balanceInOrder=balanceInOrder-${executeAmountForCreator*price} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`);
                        //     await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${executeAmountForFind}, balanceInOrder=balanceInOrder-${executeAmountForFind} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id} `);
                       
                    
                    
                            /*For Buy User */
    
                          
                            // console.log('BUY', `UPDATE user_wallet SET Balance=Balance+${parseFloat(parseFloat(executeAmount) - (parseFloat(old_coin_order_fee) + parseFloat(old_coin_tdsvda_fee) + parseFloat(old_coingst_quantity_fee))).toFixed(5)} WHERE coin_id = ${left_coin_id} AND user_id=${Find_user_id}`)
    
                          
    
                           
                            /*For Sell user */
                          
                            await promisePool.query(`UPDATE user_wallet SET  balanceInOrder=balanceInOrder-${parseFloat(parseFloat(executeAmountForFind*price)).toFixed(5)} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id} `);
    
                            await promisePool.query(`UPDATE user_wallet SET balanceInOrder=balanceInOrder-${parseFloat(executeAmountForFind * old_price).toFixed(5)} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`);
    
                            await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${parseFloat(executeAmountForFind * price).toFixed(5)} WHERE coin_id = ${left_coin_id} AND user_id=${Find_user_id}`);
                            await promisePool.query(`UPDATE user_wallet SET Balance=Balance+${parseFloat(executeAmountForCreator).toFixed(5)} WHERE coin_id = ${right_coin_id} AND user_id=${user_id}`);
    
                            
                            console.log('a',executeAmountForFind,old_price,`UPDATE user_wallet SET  balanceInOrder=balanceInOrder-${parseFloat(parseFloat(executeAmountForFind*price)).toFixed(5)} WHERE coin_id = ${right_coin_id} AND user_id=${Find_user_id}`)
                            console.log('b',executeAmountForCreator,price,`UPDATE user_wallet SET balanceInOrder=balanceInOrder-${parseFloat(executeAmountForFind * old_price).toFixed(5)} WHERE coin_id = ${left_coin_id} AND user_id=${user_id}`)
                             
                         
                    }
    
                }
                else{
                    console.log('sdasdadad')
                   return res.status(200).send({
                        success: true,
                        msg: "Order Created Successfully."
                    });
                }

            if(currentAmount ==0){
                console.log('abc')
             return   res.status(200).send({
                    success: true,
                    msg: "Order Created Successfully"
                });
            }
        }


// return res.status(200).send({
//         success: true,
//         msg: "Order Created Successfully"
//     });


// });

}



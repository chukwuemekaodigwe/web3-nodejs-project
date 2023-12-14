const config = require('../config');
// const walletQueries = require('../services/walletQueries');
var fetch = require('node-fetch');
const moment = require('moment')
const mysql = require('mysql2');
// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
// query database using promises
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
// const fullNodeTest = new HttpProvider("https://api.shasta.trongrid.io/"); // Full node http endpoint
// const solidityNodeTest = new HttpProvider("https://api.shasta.trongrid.io/"); // Solidity node http endpoint
// const eventServerTest = "https://api.shasta.trongrid.io/"; // Contract events http endpoint

const fullNode = new HttpProvider("https://api.trongrid.io/"); // Full node http endpoint
const solidityNode = new HttpProvider("https://api.trongrid.io/"); // Solidity node http endpoint
const eventServer = "https://api.trongrid.io/"; // Contract events http endpoint


let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);


async function checklatestBlock(address, coin_id) {
    // console.log('check latest block')
    var blockid = 0
    // console.log(`select * from exchange_transaction where to_address='${address}' and coin_id='${coin_id}'`)
    const [quertyData, fields] = await promisePool.query(`select * from exchange_transaction where to_address='${address}' and coin_id='${coin_id}'`);
  
    // console.log('quertyData',quertyData[0].block)
    if (quertyData.length > 0) {
        blockid = quertyData[0].block
    } 
     
    return blockid
  
}
async function checklatestDate(address, coin_id) {
    var lastdate = null
    // console.log(`select * from exchange_transaction where to_address='${address}' and coin_id='${coin_id}'`)
    const [quertyData, fields] = await promisePool.query(`select * from exchange_transaction where to_address='${address}' and coin_id='${coin_id}'`);
 
    if (quertyData.length > 0) {
        lastdate = moment(quertyData[0].date).unix()
    }
    
    return lastdate

}
async function checkUsdtPrice(coin) {
    var usdtprice = 0
    const response2 = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`, {
        method: 'GET', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });
    const usdPrice = await response2.json();
    //  console.log(`usdPriceusdPrice`,usdPrice)
    if (usdPrice && usdPrice.price) {
        usdtprice = parseFloat(usdPrice.price).toFixed(12)
    }
    return usdtprice
}

async function checkBEP20deposit(bnb_publickey, coin_id, user_id, symbol, bnb_contract, bscAPIkey) {
    const Block = await checklatestBlock(bnb_publickey, coin_id)
    var trx_number = new Date().getTime();

    // TESTNET
    // var response = await fetch(`https://api-testnet.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)

    // Mainnet
    var response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)
    // console.log('BNBRUN', `https://api.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)
    var getETH_trx = await response.json();

    var result = getETH_trx.result;

    if (result.length > 0) {
        for (var i = 0; i < result.length; i++) {
            var hash = result[i].hash;
            var from = result[i].from;
            var to = result[i].to;

            var contractAddress = result[i].contractAddress;
            // console.log('getBNBtokenResult', result)
            var tokenDecimal = parseInt(result[i].tokenDecimal);
            var value = parseFloat(result[i].value) / 10 ** tokenDecimal;
            var blockId = result[i].blockNumber
            var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');
            // console.log('checkcondition', date, value, contractAddress.toUpperCase(), bnb_contract.toUpperCase(), to.toUpperCase(), bnb_publickey.toUpperCase())
            if (result[i].confirmations != '' && to.toUpperCase() == bnb_publickey.toUpperCase() && contractAddress.toUpperCase() == bnb_contract.toUpperCase()) {
                var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                const [ethTrx, fields] = await promisePool.query(sql);
                // console.log('bep20TrxethTrx', ethTrx)
                if (ethTrx.length == 0) {

                    var exchange_transaction = {
                        user_id: user_id,
                        coin_id: coin_id,
                        trx_number: trx_number,
                        block: blockId,
                        trx_type: 3,
                        amount: value,
                        usd_amount: await checkUsdtPrice(symbol) * value,
                        status: 1,
                        from_address: from,
                        to_address: bnb_publickey,
                        hash: hash,
                        date: date,
                        datetime: new Date()
                    }
                    // console.log('exchange_transaction', exchange_transaction)
                 

                    //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been  deposited!`, result[0].username)

                    const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                    // console.log('insert,erro1', insert)
                    await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(exchange_transaction.amount)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                    
                }

            }
        }
    }
}

exports.manageWallet = async function (data) {
    try {

        //  console.log('datadata.length', data)
        for (var j = 0; j < data.length; j++) {
            // console.log('jjjjjjjjjjjj', j)
            var my_address = data[j].public_key;
            var trc_publickey = data[j].trc_publickey
            var bnb_publickey = data[j].bnb_publickey
            var symbol = data[j].symbol;
            var fee=parseFloat(data[j].deposit_fee/100)

            //  console.log('symbolsymbol', symbol)
            var user_id = data[j].user_id;
            var coin_id = data[j].coin_id;
            var contract = data[j].contract
            var bnb_contract = data[j].Bnb_contract
            var trc_contract = data[j].Trc_contract
            // console.log('trc_contract', trc_contract)
            var test_contract = data[j].test_contract
            var trx_number = new Date().getTime();
            var datetime = new Date();
            var etherscanAPIkey = 'RVCXGDXZ2PYSGX9Q25RBU9YUSMUSGRPM78';
            var bscAPIkey = 'JUF4CFG6EG8IHMHVAYHXGZRYJBQFJVS39P';

            // console.log(`['BCH,LTC'].includes(symbol)`,['USDC','LTC'].includes(symbol))

            if (symbol == 'ETH') {
                const Block = await checklatestBlock(my_address, coin_id)
                // var response = await fetch(`https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${etherscanAPIkey}`); //test trx
                // console.log('ethAPiUrl', `https://api.etherscan.io/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=999999999&sort=desc&apikey=${etherscanAPIkey}`)
       //Testnet
         // var response = await fetch(`http://api-goerli.etherscan.io/api?module=account&action=txlist&address=${my_address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanAPIkey}`); //test trx
          
                //Mainnet
                var response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=999999999&sort=desc&apikey=${etherscanAPIkey}`); //mainnet
                var getETH_trx = await response.json();

                // var getETH_trx = { "status": "1", "message": "OK", "result": [{ "blockNumber": "11462310", "timeStamp": "1608097628", "hash": "0xa2aab8f385068d56a279c6d871795bc3651e8b66db5a84c5899e9f140bcf7f10", "nonce": "88", "blockHash": "0x477aeed077738a438d41d42a7a79977826ee610a6f982b44b3574ed015877a46", "exchange_transactionIndex": "88", "from": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "to": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "value": "100000000000000000", "gas": "21000", "gasPrice": "79000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "5275434", "gasUsed": "21000", "confirmations": "1085845" }, { "blockNumber": "11463472", "timeStamp": "1608113114", "hash": "0xe26a963647194f8fae24053b745dd49213d962d8f3d36f286c5008b3a6efa4ac", "nonce": "0", "blockHash": "0x6fc6e37e67a2462872848f18edbb2ee31747f52a6bac5eeda44d3277ba8107ed", "exchange_transactionIndex": "40", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "80000000000000000", "gas": "21000", "gasPrice": "69000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "1454173", "gasUsed": "21000", "confirmations": "1084683" }, { "blockNumber": "11495466", "timeStamp": "1608537064", "hash": "0xadaa3bc025f5ed69f3aa235569c8a2383b4fbef298271b994d322eae4d1cc65b", "nonce": "1", "blockHash": "0x81a9cede05198c35965eac630849b467300190048a1372b7b4fe160fede2a58e", "exchange_transactionIndex": "70", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "17858000000000000", "gas": "21000", "gasPrice": "33000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "3036021", "gasUsed": "21000", "confirmations": "1052689" }] };
                var result = getETH_trx.result;

                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        var hash = result[i].hash;
                        var from = result[i].from;
                        var to = result[i].to;
                        var value = parseFloat(result[i].value) / 10 ** 18;
                        var blockId = result[i].blockNumber
                        var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');

                        // console.log('getETH_trx.resut', result, date)
                        if (result[i].confirmations != '' && to.toUpperCase() == my_address.toUpperCase()) {

                            var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                            // console.log("sql = ",sql)
                            const [ethTrx, fields] = await promisePool.query(sql);
                            // console.log('ethTrxvethTrx',ethTrx.length)
                            if (ethTrx.length == 0 || ethTrx.length == '0') {
                                // console.log('Interexchange_transactionemplty')
                                var exchange_transaction = {
                                    user_id: user_id,
                                    coin_id: coin_id,
                                    trx_number: trx_number,
                                    trx_type: 3,
                                    amount: value - fee,
                                    trx_fee:fee,
                                    usd_amount: 0,
                                    block: blockId,
                                    status: 1,
                                    from_address: from,
                                    to_address: my_address,
                                    hash: hash,
                                    datetime: new Date(),
                                    date: date
                                }

                                //  console.log('dataTrx', exchange_transaction)

                                // console.clear();
                                //  console.log('coin_result', coin_result)
                                //emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been  deposited!`, result[0].username)
                                //  console.log('exchange_transactionexchange_transaction', exchange_transaction)
                                const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                let balValue = parseFloat(value-fee)
                                // const [insert, erro1] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                // console.log('insert,erro1', insert)
                                await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                
                            }

                        }
                    }
                }
            } else if (symbol == 'BNB') {
                const Block = await checklatestBlock(my_address, coin_id)
                //Mainnet
                var response = await fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${bscAPIkey}`);
                //TESTNET
                // var response = await fetch(`https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${bscAPIkey}`);
                // console.log('BNBapiUrl', `https://api.bscscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${bscAPIkey}`)
                var getBNB_trx = await response.json();

                // var getBNB_trx = { "status": "1", "message": "OK", "result": [{ "blockNumber": "11462310", "timeStamp": "1608097628", "hash": "0xa2aab8f385068d56a279c6d871795bc3651e8b66db5a84c5899e9f140bcf7f10", "nonce": "88", "blockHash": "0x477aeed077738a438d41d42a7a79977826ee610a6f982b44b3574ed015877a46", "exchange_transactionIndex": "88", "from": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "to": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "value": "100000000000000000", "gas": "21000", "gasPrice": "79000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "5275434", "gasUsed": "21000", "confirmations": "1085845" }, { "blockNumber": "11463472", "timeStamp": "1608113114", "hash": "0xe26a963647194f8fae24053b745dd49213d962d8f3d36f286c5008b3a6efa4ac", "nonce": "0", "blockHash": "0x6fc6e37e67a2462872848f18edbb2ee31747f52a6bac5eeda44d3277ba8107ed", "exchange_transactionIndex": "40", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "80000000000000000", "gas": "21000", "gasPrice": "69000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "1454173", "gasUsed": "21000", "confirmations": "1084683" }, { "blockNumber": "11495466", "timeStamp": "1608537064", "hash": "0xadaa3bc025f5ed69f3aa235569c8a2383b4fbef298271b994d322eae4d1cc65b", "nonce": "1", "blockHash": "0x81a9cede05198c35965eac630849b467300190048a1372b7b4fe160fede2a58e", "exchange_transactionIndex": "70", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "17858000000000000", "gas": "21000", "gasPrice": "33000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "3036021", "gasUsed": "21000", "confirmations": "1052689" }] };
                var result = getBNB_trx.result;
                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        var hash = result[i].hash;
                        var from = result[i].from;
                        var to = result[i].to;
                        var value = parseFloat(result[i].value) / 10 ** 18;
                        var blockId = result[i].blockNumber
                        var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');
                        // console.log('getBNB_trx.resut', result, date)
                        if (result[i].confirmations != '' && to.toUpperCase() == my_address.toUpperCase()) {

                            var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                            const [ethTrx, fields] = await promisePool.query(sql);
                            if (ethTrx.length == 0) {

                                var exchange_transaction = {
                                    user_id: user_id,
                                    coin_id: coin_id,
                                    trx_number: trx_number,
                                    trx_type: 3,
                                    block: blockId,
                                    amount: value - fee,
                                    trx_fee:fee,
                                    usd_amount: 0,
                                    status: 1,
                                    from_address: from,
                                    to_address: my_address,
                                    hash: hash,
                                    date: date,
                                    datetime: new Date()
                                }
                                // console.log('inser exchange_transaction', exchange_transaction)

                                // emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been deposited!`, result[0].username)

                                const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                let balValue = parseFloat(value-fee)
                                // const [insert, errtoke] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                // console.log('insert,erro1', insert)
                                await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                
                            }

                        }
                    }
                }
            }
            else if (symbol == 'MATIC') {
                const MaticApiKey = 'KIU2V1EQN129JSGZUTHPR9D5XZNHZUPURE'
                const Block = await checklatestBlock(my_address, coin_id)
              
            //TESTNET
                // var response = await fetch(`https://api-mumbai.polygonscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${MaticApiKey}`);
              
                // Mainnet
                var response = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${MaticApiKey}`);
                // var response = await fetch(`https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${bscAPIkey}`);
                // console.log('MATICapiUrl', `https://api.polygonscan.com/api?module=account&action=txlist&address=${my_address}&startblock=${Block}&endblock=99999999&sort=desc&apikey=${MaticApiKey}`)
                var getBNB_trx = await response.json();

                // var getBNB_trx = { "status": "1", "message": "OK", "result": [{ "blockNumber": "11462310", "timeStamp": "1608097628", "hash": "0xa2aab8f385068d56a279c6d871795bc3651e8b66db5a84c5899e9f140bcf7f10", "nonce": "88", "blockHash": "0x477aeed077738a438d41d42a7a79977826ee610a6f982b44b3574ed015877a46", "exchange_transactionIndex": "88", "from": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "to": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "value": "100000000000000000", "gas": "21000", "gasPrice": "79000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "5275434", "gasUsed": "21000", "confirmations": "1085845" }, { "blockNumber": "11463472", "timeStamp": "1608113114", "hash": "0xe26a963647194f8fae24053b745dd49213d962d8f3d36f286c5008b3a6efa4ac", "nonce": "0", "blockHash": "0x6fc6e37e67a2462872848f18edbb2ee31747f52a6bac5eeda44d3277ba8107ed", "exchange_transactionIndex": "40", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "80000000000000000", "gas": "21000", "gasPrice": "69000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "1454173", "gasUsed": "21000", "confirmations": "1084683" }, { "blockNumber": "11495466", "timeStamp": "1608537064", "hash": "0xadaa3bc025f5ed69f3aa235569c8a2383b4fbef298271b994d322eae4d1cc65b", "nonce": "1", "blockHash": "0x81a9cede05198c35965eac630849b467300190048a1372b7b4fe160fede2a58e", "exchange_transactionIndex": "70", "from": "0xb45f05cbc7614f50f31409bec10e06cdfa0bc168", "to": "0xff7c4bb65434189dc0ba558327b0a19d3f94a883", "value": "17858000000000000", "gas": "21000", "gasPrice": "33000000000", "isError": "0", "txreceipt_status": "1", "input": "0x", "contractAddress": "", "cumulativeGasUsed": "3036021", "gasUsed": "21000", "confirmations": "1052689" }] };
                var result = getBNB_trx.result;
                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        var hash = result[i].hash;
                        var from = result[i].from;
                        var to = result[i].to;
                        var value = parseFloat(result[i].value) / 10 ** 18;
                        var blockId = result[i].blockNumber
                        var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');
                        // console.log('getMATIC_trx.resut', result, date)
                        if (result[i].confirmations != '' && to.toUpperCase() == my_address.toUpperCase()) {

                            var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                            const [ethTrx, fields] = await promisePool.query(sql);
                            if (ethTrx.length == 0) {

                                var exchange_transaction = {
                                    user_id: user_id,
                                    coin_id: coin_id,
                                    trx_number: trx_number,
                                    trx_type: 3,
                                    block: blockId,
                                    amount: value - fee,
                                    trx_fee:fee,
                                    usd_amount:0,
                                    status: 1,
                                    from_address: from,
                                    to_address: my_address,
                                    hash: hash,
                                    date: date,
                                    datetime: new Date()
                                }
                                // console.log('inser exchange_transaction', exchange_transaction)
                               // emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been deposited!`, result[0].username)
                               const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                               let balValue = parseFloat(value-fee)
                                // const [insert, errtoke] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                // console.log('insert,erro1', insert)
                                await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                
                            }

                        }
                    }
                }
            }

            else if (['BTC'].includes(symbol)) {
                //n =0 mainBTC N=1 BEP-20

                for (let n = 0; n < 2; n++) {
                    if (n == 0) {
                        const Block = await checklatestBlock(my_address, coin_id)
                        // https://api.bscscan.com/api?module=account&action=tokentx&address=0x7bb89460599dbf32ee3aa50798bbceae2a5f7f6a&startblock=0&endblock=2500000&sort=asc&apikey=JUF4CFG6EG8IHMHVAYHXGZRYJBQFJVS39P
                        //Mainnet
                        var response = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${my_address}/full`);
                                //TESTNET
                        // var response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${my_address}/full`);

                        
                        var getBTC_trx = await response.json();
                        // console.log('getBTC_trxBTC', getBTC_trx)
                        // var getBTC_trx = {"status":"1","message":"OK","result":[{"blockNumber":"10755616","timeStamp":"1598703875","hash":"0x7ec04f520313f3f22bc92cf79001994f861966c5a27d0b0bedfa4ab0547d37cb","nonce":"5","blockHash":"0xc712b2ef16f15aba324710e390ecd494a2c7ca13a358bebc5317ce3894a50d38","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"126","gas":"100000","gasPrice":"64354373855","gasUsed":"52208","cumulativeGasUsed":"6675744","input":"deprecated","confirmations":"1792545"},{"blockNumber":"10938119","timeStamp":"1601121669","hash":"0x3faa2c0dbacad7f3246b84888845abd142d48de5a39bdf9510f8b3bd259708bd","nonce":"6","blockHash":"0x81afb64d0882bf2cb560e9fa49f75f569ad827a460ddad64493985841ebfa90e","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"98","gas":"100000","gasPrice":"55000000000","gasUsed":"37208","cumulativeGasUsed":"4835641","input":"deprecated","confirmations":"1610042"},{"blockNumber":"10938173","timeStamp":"1601122358","hash":"0x442f1a503baeea896f8f692bcf1ec9e0ccdeb875c91ee2e615fe65485b4c7160","nonce":"7","blockHash":"0x06aae5d825490c42341bfd0b873b8c19649372ad1534e40852e39694d6dea01f","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"49","gas":"100000","gasPrice":"57000000000","gasUsed":"37208","cumulativeGasUsed":"6059547","input":"deprecated","confirmations":"1609988"},{"blockNumber":"10995219","timeStamp":"1601893875","hash":"0x065e39090eb67e9f330ae6779b81c321293fbf82d9c515f7754094d20d6badc0","nonce":"14","blockHash":"0xe7d220d4b2dea8c80651c7f53876c87eb0b47b447dd75aa795ba0b2c8d519f0d","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x2ac22ebc138ff127566f68db600addad7df38d38","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"10000000000000000000","tokenName":"Selenium","tokenSymbol":"SLC","tokenDecimal":"18","exchange_transactionIndex":"170","gas":"100000","gasPrice":"64000000000","gasUsed":"51020","cumulativeGasUsed":"12271382","input":"deprecated","confirmations":"1552942"},{"blockNumber":"11372518","timeStamp":"1606905184","hash":"0xc89badaa7cc218bc9463a2d64f046eeae2e73e8bea6cf4f8a3814ca00bec9100","nonce":"80","blockHash":"0xc01e4101be1083e8ca36c32916bd0f3a47b7935093f175b8ae1956b864de03ac","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"15000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","exchange_transactionIndex":"135","gas":"52232","gasPrice":"20000000000","gasUsed":"52232","cumulativeGasUsed":"12262135","input":"deprecated","confirmations":"1175643"},{"blockNumber":"11378410","timeStamp":"1606981970","hash":"0xfba70fa7b9a5a4babc758bc6c72be14ff6f021d1f67f7a3726c60cd98bf87a9d","nonce":"81","blockHash":"0xbddce7428a44a2191e08ed343ab34b0fd19034d7c2372351d90708618d2ba02b","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"50000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","exchange_transactionIndex":"87","gas":"37244","gasPrice":"21000000000","gasUsed":"37244","cumulativeGasUsed":"4566090","input":"deprecated","confirmations":"1169751"}]}
                        result = [];
                        result = getBTC_trx.txs;
                        if (!getBTC_trx.error) {
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    var hash = result[i].hash;
                                    // console.log('result[i].outputs[0]', result[i].outputs[0], result[i].inputs[0])
                                    var to = result[i].outputs[0].addresses[0];
                                    var from = result[i].inputs[0].addresses[0];

                                    var value = parseFloat(result[i].outputs[0].value) / 100000000;
                                    //   var blockId = result[i].block_height
                                    var date = moment(result[i].received).format('YYYY-MM-DD');
                                    // console.log(hash, to, from, value, date, to.toUpperCase(), my_address.toUpperCase())
                                    if (result[i].confirmations > 1 && to.toUpperCase() == my_address.toUpperCase()) {
                                        // console.log(`SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`)
                                        var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                                        const [ethTrx, fields] = await promisePool.query(sql);
                                        // console.log('ethTrx.length', ethTrx.length)
                                        if (ethTrx.length == 0) {

                                            var exchange_transaction = {
                                                user_id: user_id,
                                                coin_id: coin_id,
                                                trx_number: trx_number,
                                                trx_type: 3,
                                                amount: value - fee,
                                                trx_fee:fee,
                                                usd_amount: 0,
                                                status: 1,
                                                block: 0,
                                                from_address: from,
                                                to_address: my_address,
                                                hash: hash,
                                                date: date,
                                                datetime: new Date()
                                            }
                                            // console.log('inser exchange_transaction', exchange_transaction)
                                      
                                            //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been deposited!`, result[0].username)

                                            const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                            let balValue = parseFloat(value-fee)
                                            // await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                            await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
       
                                            
                                        }

                                    }
                                }
                            }
                        }
                    } else if (n == 1 && (bnb_contract !== null || bnb_contract !== '')) {
                        await checkBEP20deposit(bnb_publickey, coin_id, user_id, symbol, bnb_contract, bscAPIkey)
                    }
                }
            }
              else if (['LTC'].includes(symbol)) {
                //n =0 mainBTC N=1 BEP-20

                for (let n = 0; n < 2; n++) {
                    if (n == 0) {
                        const Block = await checklatestBlock(my_address, coin_id)
                        // https://api.bscscan.com/api?module=account&action=tokentx&address=0x7bb89460599dbf32ee3aa50798bbceae2a5f7f6a&startblock=0&endblock=2500000&sort=asc&apikey=JUF4CFG6EG8IHMHVAYHXGZRYJBQFJVS39P
                        //Mainnet
                        var response = await fetch(`https://api.blockcypher.com/v1/ltc/main/addrs/${my_address}/full`);
                                //TESTNET
                        // var response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${my_address}/full`);

                        var getBTC_trx = await response.json();
                        // console.log('getBTC_trxBTC', getBTC_trx)
                        // var getBTC_trx = {"status":"1","message":"OK","result":[{"blockNumber":"10755616","timeStamp":"1598703875","hash":"0x7ec04f520313f3f22bc92cf79001994f861966c5a27d0b0bedfa4ab0547d37cb","nonce":"5","blockHash":"0xc712b2ef16f15aba324710e390ecd494a2c7ca13a358bebc5317ce3894a50d38","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"126","gas":"100000","gasPrice":"64354373855","gasUsed":"52208","cumulativeGasUsed":"6675744","input":"deprecated","confirmations":"1792545"},{"blockNumber":"10938119","timeStamp":"1601121669","hash":"0x3faa2c0dbacad7f3246b84888845abd142d48de5a39bdf9510f8b3bd259708bd","nonce":"6","blockHash":"0x81afb64d0882bf2cb560e9fa49f75f569ad827a460ddad64493985841ebfa90e","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"98","gas":"100000","gasPrice":"55000000000","gasUsed":"37208","cumulativeGasUsed":"4835641","input":"deprecated","confirmations":"1610042"},{"blockNumber":"10938173","timeStamp":"1601122358","hash":"0x442f1a503baeea896f8f692bcf1ec9e0ccdeb875c91ee2e615fe65485b4c7160","nonce":"7","blockHash":"0x06aae5d825490c42341bfd0b873b8c19649372ad1534e40852e39694d6dea01f","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","exchange_transactionIndex":"49","gas":"100000","gasPrice":"57000000000","gasUsed":"37208","cumulativeGasUsed":"6059547","input":"deprecated","confirmations":"1609988"},{"blockNumber":"10995219","timeStamp":"1601893875","hash":"0x065e39090eb67e9f330ae6779b81c321293fbf82d9c515f7754094d20d6badc0","nonce":"14","blockHash":"0xe7d220d4b2dea8c80651c7f53876c87eb0b47b447dd75aa795ba0b2c8d519f0d","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x2ac22ebc138ff127566f68db600addad7df38d38","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"10000000000000000000","tokenName":"Selenium","tokenSymbol":"SLC","tokenDecimal":"18","exchange_transactionIndex":"170","gas":"100000","gasPrice":"64000000000","gasUsed":"51020","cumulativeGasUsed":"12271382","input":"deprecated","confirmations":"1552942"},{"blockNumber":"11372518","timeStamp":"1606905184","hash":"0xc89badaa7cc218bc9463a2d64f046eeae2e73e8bea6cf4f8a3814ca00bec9100","nonce":"80","blockHash":"0xc01e4101be1083e8ca36c32916bd0f3a47b7935093f175b8ae1956b864de03ac","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"15000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","exchange_transactionIndex":"135","gas":"52232","gasPrice":"20000000000","gasUsed":"52232","cumulativeGasUsed":"12262135","input":"deprecated","confirmations":"1175643"},{"blockNumber":"11378410","timeStamp":"1606981970","hash":"0xfba70fa7b9a5a4babc758bc6c72be14ff6f021d1f67f7a3726c60cd98bf87a9d","nonce":"81","blockHash":"0xbddce7428a44a2191e08ed343ab34b0fd19034d7c2372351d90708618d2ba02b","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"50000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","exchange_transactionIndex":"87","gas":"37244","gasPrice":"21000000000","gasUsed":"37244","cumulativeGasUsed":"4566090","input":"deprecated","confirmations":"1169751"}]}
                        result = [];
                        result = getBTC_trx.txs;
                        if (!getBTC_trx.error) {
                            if (result.length > 0) {
                                for (var i = 0; i < result.length; i++) {
                                    var hash = result[i].hash;
                                    // console.log('result[i].outputs[0]', result[i].outputs[0], result[i].inputs[0])
                                    var to = result[i].outputs[0].addresses[0];
                                    var from = result[i].inputs[0].addresses[0];

                                    var value = parseFloat(result[i].outputs[0].value) / 100000000;
                                    //   var blockId = result[i].block_height
                                    var date = moment(result[i].received).format('YYYY-MM-DD');
                                    // console.log(hash, to, from, value, date, to.toUpperCase(), my_address.toUpperCase())
                                    if (result[i].confirmations > 1 && to.toUpperCase() == my_address.toUpperCase()) {
                                        // console.log(`SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`)
                                        var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                                        const [ethTrx, fields] = await promisePool.query(sql);
                                        // console.log('ethTrx.length', ethTrx.length)
                                        if (ethTrx.length == 0) {

                                            var exchange_transaction = {
                                                user_id: user_id,
                                                coin_id: coin_id,
                                                trx_number: trx_number,
                                                trx_type: 3,
                                                amount: value - fee,
                                                trx_fee:fee,
                                                usd_amount: 0,
                                                status: 1,
                                                block: 0,
                                                from_address: from,
                                                to_address: my_address,
                                                hash: hash,
                                                date: date,
                                                datetime: new Date()
                                            }
                                            // console.log('inser exchange_transaction', exchange_transaction)
                                      
                                            //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been deposited!`, result[0].username)

                                            const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                            let balValue = parseFloat(value-fee)
                                            // await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                            await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                            
                                        }

                                    }
                                }
                            }
                        }
                    } else if (n == 1 && (bnb_contract !== null || bnb_contract !== '')) {
                        await checkBEP20deposit(bnb_publickey, coin_id, user_id, symbol, bnb_contract, bscAPIkey)
                    }
                }
            }


            else if (['TRX'].includes(symbol)) {
                for (let n = 0; n < 2; n++) {
                    if (n == 0) {
                        const Block = await checklatestBlock(my_address, coin_id)
                        var response = []
                        // console.log('TRCRUN', `https://apilist.tronscan.org/api/exchange_transaction?sort=-timestamp&count=true&limit=20&startblock=${Block}&address=${my_address}`)
                        //TESTNET 
                          // var response = await fetch(`https://api.shasta.trongrid.io/v1/accounts/${my_address}/transactions/`);
                     
                    

                        //Mainnet
                        var response = await fetch(`https://apilist.tronscan.org/api/transaction?sort=-timestamp&count=true&limit=20&startblock=${Block}&address=${my_address}`)

                        var getTRX_trx = await response.json();

                        //  console.log('getTRX_trxtrx', getTRX_trx)

                        var result = [];
                        result = getTRX_trx.data;

                        if (result.length > 0) {
                            
                   

                            for (var i = 0; i < result.length; i++) {
                              
                                var hash = result[i].txID;
                                var from = result[i].from;
                                var to = result[i].to;
                                // var value = parseFloat(result[i].value) / 10 ** 6;
                                
                                var value = result[i].raw_data.contract[0].parameter.value.amount/10 ** 6;
                                // console.log('TRx',result[0].raw_data.contract[0].parameter,value)
                                var to_address = result[i].raw_data.contract[0].parameter.value.to_address;
                                const to_address_base58 = tronWeb.address.fromHex(to_address);
                               
                                // var contractAddress = result[i].trigger_info?.contract_address;
                                //    console.log('getTRX_trx1', result)
                                // var value = parseFloat(result[i].contractData.amount) / 10 ** 6;
                                var blockId = result[i].blockNumber


                                var date = moment(result[i].block_timestamp).format('YYYY-MM-DD');

                             
                                //    console.log('getETH_trx2', contractAddress, x == 0 ? contract.toUpperCase() : bnb_contract.toUpperCase(), to.toUpperCase(), my_address.toUpperCase())
                                if (to_address_base58 == my_address) { 
                                    var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                                    const [ethTrx, fields] = await promisePool.query(sql);
                                        // console.log('ethTrxethTrx', ethTrx)
                                    if (ethTrx.length == 0) {

                                        var exchange_transaction = {
                                            user_id: user_id,
                                            coin_id: coin_id,
                                            trx_number: trx_number,
                                            block: blockId,
                                            trx_type: 3,
                                            amount: value - fee,
                                            trx_fee:fee,
                                            usd_amount: 0,
                                            status: 1,
                                            from_address: from,
                                            to_address: my_address,
                                            hash: hash,
                                            date: date,
                                            datetime: new Date()
                                        }
                                        // console.log('exchange_transaction', exchange_transaction)
                                      

                                        //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been  deposited!`, result[0].username)
                                        const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                        let balValue = value-fee
                                        // const [insert, errtoke] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                        // console.log('insert,erro1', insert)
                                        await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                        
                                    }

                                }
                            }

                        }
                    } else if (n == 1 && (bnb_contract !== null || bnb_contract !== '')) {
                        await checkBEP20deposit(bnb_publickey, coin_id, user_id, symbol, bnb_contract, bscAPIkey)
                    }
                }

            }
          
             else if (['BUSD'].includes(symbol)) {
            
            // https://api.bscscan.com/api?module=account&action=tokentx&address=0x7bb89460599dbf32ee3aa50798bbceae2a5f7f6a&startblock=0&endblock=2500000&sort=asc&apikey=JUF4CFG6EG8IHMHVAYHXGZRYJBQFJVS39P
           var response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${my_address}&startblock=0&endblock=2500000&sort=asc&apikey=${bscAPIkey}`);
          // var response = await fetch(`https://api-testnet.bscscan.com/api?module=account&action=tokentx&contractaddress=${test_contract}&address=${my_address}&sort=desc&apikey=${bscAPIkey}`);
        
          var getBNB_trx = await response.json();
            
            // var getBNB_trx = {"status":"1","message":"OK","result":[{"blockNumber":"10755616","timeStamp":"1598703875","hash":"0x7ec04f520313f3f22bc92cf79001994f861966c5a27d0b0bedfa4ab0547d37cb","nonce":"5","blockHash":"0xc712b2ef16f15aba324710e390ecd494a2c7ca13a358bebc5317ce3894a50d38","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","transactionIndex":"126","gas":"100000","gasPrice":"64354373855","gasUsed":"52208","cumulativeGasUsed":"6675744","input":"deprecated","confirmations":"1792545"},{"blockNumber":"10938119","timeStamp":"1601121669","hash":"0x3faa2c0dbacad7f3246b84888845abd142d48de5a39bdf9510f8b3bd259708bd","nonce":"6","blockHash":"0x81afb64d0882bf2cb560e9fa49f75f569ad827a460ddad64493985841ebfa90e","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","transactionIndex":"98","gas":"100000","gasPrice":"55000000000","gasUsed":"37208","cumulativeGasUsed":"4835641","input":"deprecated","confirmations":"1610042"},{"blockNumber":"10938173","timeStamp":"1601122358","hash":"0x442f1a503baeea896f8f692bcf1ec9e0ccdeb875c91ee2e615fe65485b4c7160","nonce":"7","blockHash":"0x06aae5d825490c42341bfd0b873b8c19649372ad1534e40852e39694d6dea01f","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x6573ccdd28b74255db53c0f1c64d98401772ef7b","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"100000000000","tokenName":"Dash TOKEN","tokenSymbol":"YAS","tokenDecimal":"10","transactionIndex":"49","gas":"100000","gasPrice":"57000000000","gasUsed":"37208","cumulativeGasUsed":"6059547","input":"deprecated","confirmations":"1609988"},{"blockNumber":"10995219","timeStamp":"1601893875","hash":"0x065e39090eb67e9f330ae6779b81c321293fbf82d9c515f7754094d20d6badc0","nonce":"14","blockHash":"0xe7d220d4b2dea8c80651c7f53876c87eb0b47b447dd75aa795ba0b2c8d519f0d","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0x2ac22ebc138ff127566f68db600addad7df38d38","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"10000000000000000000","tokenName":"Selenium","tokenSymbol":"SLC","tokenDecimal":"18","transactionIndex":"170","gas":"100000","gasPrice":"64000000000","gasUsed":"51020","cumulativeGasUsed":"12271382","input":"deprecated","confirmations":"1552942"},{"blockNumber":"11372518","timeStamp":"1606905184","hash":"0xc89badaa7cc218bc9463a2d64f046eeae2e73e8bea6cf4f8a3814ca00bec9100","nonce":"80","blockHash":"0xc01e4101be1083e8ca36c32916bd0f3a47b7935093f175b8ae1956b864de03ac","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"15000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","transactionIndex":"135","gas":"52232","gasPrice":"20000000000","gasUsed":"52232","cumulativeGasUsed":"12262135","input":"deprecated","confirmations":"1175643"},{"blockNumber":"11378410","timeStamp":"1606981970","hash":"0xfba70fa7b9a5a4babc758bc6c72be14ff6f021d1f67f7a3726c60cd98bf87a9d","nonce":"81","blockHash":"0xbddce7428a44a2191e08ed343ab34b0fd19034d7c2372351d90708618d2ba02b","from":"0xff7c4bb65434189dc0ba558327b0a19d3f94a883","contractAddress":"0xad8e790b9977acd8b0346afecde3348dffad5be3","to":"0xb45f05cbc7614f50f31409bec10e06cdfa0bc168","value":"50000000000000000000","tokenName":"ShipItPro","tokenSymbol":"SHPP","tokenDecimal":"18","transactionIndex":"87","gas":"37244","gasPrice":"21000000000","gasUsed":"37244","cumulativeGasUsed":"4566090","input":"deprecated","confirmations":"1169751"}]}
            var result = getBNB_trx.result;
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                  
                    var hash = result[i].hash;
                    var from = result[i].from;
                    var to = result[i].to;
                    var blockId = result[i].blockNumber
                    var contractAddress = result[i].contractAddress;
                    var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');

                    var tokenDecimal = parseInt(result[i].tokenDecimal);
                    var value = parseFloat(result[i].value) / 10 ** tokenDecimal;
                    if (result[i].confirmations != '' && to.toLowerCase() == my_address.toLowerCase() && contractAddress == test_contract) {
                        var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                        // console.log('exchange_transaction',sql)
                        const [ethTrx, fields] = await promisePool.query(sql);
                       
                        if (ethTrx.length == 0) {

                            var exchange_transaction = {
                                user_id: user_id,
                                coin_id: coin_id,
                                trx_number: trx_number,
                                block: blockId,
                                trx_type: 3,
                                amount: value - fee,
                                trx_fee:fee,
                                usd_amount: 0,
                                status: 1,
                                from_address: from,
                                to_address: my_address,
                                hash: hash,
                                date: date,
                                datetime: new Date()
                            }
                        //   console.log('exchange_transaction',exchange_transaction)
                            const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                            let balValue = parseFloat(value-fee)
                            await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                            
                        }

                    }
                }
            }
        }

            else if (!['BCH', 'DOT', 'XLM', 'SOL'].includes(symbol)) {
             
                let loopcount=0
                for (let x = 0; x < 3; x++) {
                    // console.log('abc',x == 0,symbol, test_contract, test_contract !== null)


                  
                    // https://api.etherscan.io/api?module=account&action=tokentx&address=0xB45F05cBC7614f50f31409Bec10e06cdFa0Bc168&startblock=0&endblock=999999999&sort=asc&apikey=RVCXGDXZ2PYSGX9Q25RBU9YUSMUSGRPM78
                    var result=''
                    // console.log('Block',x,test_contract)
                    if (x == 0 && test_contract !== null) {
                        // console.log('Block',x == 0 && test_contract !== null)
                        const Block = await checklatestBlock(my_address, coin_id)
                        // TESTNET 
                        // console.log(`api-goerli.etherscan.io/api?module=account&action=tokentx&contractaddress=${test_contract}&address=${my_address}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanAPIkey}`,Block)
                        // console.log('Block',response)
                        // var response = await fetch(`https://api-goerli.etherscan.io/api?module=account&action=tokentx&contractaddress=${test_contract}&address=${my_address}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanAPIkey}`); //testnet
                        // Mainnet
                        // console.log('ltc',symbol,response)
                        var response = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${contract}&address=${my_address}&sort=desc&apikey=${etherscanAPIkey}`);
                        // console.log('ETHRUN', `https://api.etherscan.io/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${contract}&address=${my_address}&sort=desc&apikey=${etherscanAPIkey}`)
                        var getETH_trx = await response.json();
// console.log('getETH_trx123654',getETH_trx)
                        var result = getETH_trx.result;
                    } else if (x == 1 && bnb_contract !== null) {
                        const Block = await checklatestBlock(bnb_publickey, coin_id)
                      
                        // TESTNET
                        // var response = await fetch(`https://api-testnet.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)
                                              // Mainnet
                        var response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)
                        // console.log('BNBRUN', `https://api.bscscan.com/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${bnb_contract}&address=${bnb_publickey}&sort=desc&apikey=${bscAPIkey}`)
                        var getETH_trx = await response.json();

                        var result = getETH_trx.result;
                    } else if (x == 2 && trc_contract !== null) {
                        const Block = await checklatestBlock(trc_publickey, coin_id)
                        
                        var response = await fetch(`https://apilist.tronscan.org/api/transaction?sort=-timestamp&startblock=${Block}&contract_address=${trc_contract}&address=${trc_publickey}`)
                        // var  response=[]
                        // console.log('TRCRUN', `https://apilist.tronscan.org/api/transaction?sort=-timestamp&startblock=${Block}&contract_address=${trc_contract}&address=${trc_publickey}`)
                        var getTRX_trx = await response.json();
                        var result = getTRX_trx.data

                    }

                    // var response = await fetch(`https://api-ropsten.etherscan.io/api?module=account&action=tokentx&startblock=${Block}&contractaddress=${contract}&address=${my_address}&sort=desc&apikey=${etherscanAPIkey}`); //test

             
                    if (result.length > 0 && (x == 0 || x == 1) && getETH_trx?.message !='NOTOK') {
                        for (var i = 0; i < result.length; i++) {
                            // console.log('getETH_trx123654',result)
                            var hash = result[i].hash;
                            var from = result[i].from;
                            var to = result[i].to;

                            var contractAddress = result[i].contractAddress;
                            //      console.log('getETH_trx1', result)
                            var tokenDecimal = parseInt(result[i].tokenDecimal);
                            var value = parseFloat(result[i].value) / 10 ** tokenDecimal;
                            var blockId = result[i].blockNumber
                            var date = moment.unix(result[i].timeStamp).format('YYYY-MM-DD');
                            //    console.log('getETH_trx2', contractAddress, x == 0 ? contract.toUpperCase() : bnb_contract.toUpperCase(), to.toUpperCase(), my_address.toUpperCase())
                            //    console.log('sdsdsdssds',contract.toUpperCase(),bnb_contract.toUpperCase(), contractAddress.toUpperCase() == (x == 0 ? contract.toUpperCase() : bnb_contract.toUpperCase())) 
                            //    if (result[i].confirmations != '' && to.toUpperCase() == my_address.toUpperCase() && contractAddress.toUpperCase() == (x == 0 ? contract.toUpperCase() : bnb_contract.toUpperCase())) {
                                if (result[i].confirmations != '' && to.toUpperCase() == my_address.toUpperCase() && contractAddress.toUpperCase() == (x == 0 ? test_contract.toUpperCase() : test_contract.toUpperCase())) {
                                    
                            var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                                const [ethTrx, fields] = await promisePool.query(sql);
                                //     console.log('ethTrxethTrx', ethTrx)
                                if (ethTrx.length == 0) {

                                    var exchange_transaction = {
                                        user_id: user_id,
                                        coin_id: coin_id,
                                        trx_number: trx_number,
                                        block: blockId,
                                        trx_type: 3,
                                        amount: value - fee,
                                        trx_fee:fee,
                                        usd_amount: 0,
                                        status: 1,
                                        from_address: from,
                                        to_address: my_address,
                                        hash: hash,
                                        date: date,
                                        datetime: new Date()
                                    }
                                    // console.log('exchange_transaction', exchange_transaction)
                              

                                    //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been  deposited!`, result[0].username)
                                   
                                    const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                        let balValue = parseFloat(value-fee)
                                    // const [insert, errtoke] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                    // console.log('insert,erro1', insert)
                                    await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                    
                                }

                            }
                        }
                    }

                    else if (result.length > 0 && x==2 && getTRX_trx?.total!==0) {

                        for (var i = 0; i < result.length; i++) {
                            var hash = result[i].hash;
                            var from = result[i].ownerAddress;
                            var to = result[i].trigger_info.parameter.recipient;

                            var contractAddress = result[i].trigger_info.contract_address;
                            // console.log('getTRXTOKEN_trx1', result)
                            var tokenDecimal = parseInt(result[i].tokenInfo.tokenDecimal);
                            var value = parseFloat(result[i].trigger_info.parameter.amount) / 10 ** tokenDecimal;
                            var blockId = result[i].block
                            var date = moment.unix(result[i].timestamp).format('YYYY-MM-DD');
                            //    console.log('getETH_trx2', contractAddress, x == 0 ? contract.toUpperCase() : bnb_contract.toUpperCase(), to.toUpperCase(), my_address.toUpperCase())
                            if (result[i].confirmed == true && to.toUpperCase() == trc_publickey.toUpperCase() && contractAddress.toUpperCase() == trc_contract.toUpperCase()) {
                                var sql = `SELECT *  FROM exchange_transaction WHERE user_id = ${user_id} AND coin_id=${coin_id} AND trx_type=3 AND hash = '${hash}'`;
                                const [ethTrx, fields] = await promisePool.query(sql);
                                //     console.log('ethTrxethTrx', ethTrx)
                                if (ethTrx.length == 0) {

                                    var exchange_transaction = {
                                        user_id: user_id,
                                        coin_id: coin_id,
                                        trx_number: trx_number,
                                        block: blockId,
                                        trx_type: 3,
                                        amount: value - fee,
                                        trx_fee:fee,
                                        usd_amount: 0,
                                        status: 1,
                                        from_address: from,
                                        to_address: trc_publickey,
                                        hash: hash,
                                        date: date,
                                        datetime: new Date()
                                    }
                                    // console.log('exchange_transaction', exchange_transaction)
                              

                                    //  emailActivity.Activity(result[0].email, 'Deposit Status', `Congratulations  your  amount ${value} for  ${coin_result[0].symbol} has been  deposited!`, result[0].username)
                                    const [insert, errtoke] = await promisePool.query(`insert into exchange_transaction SET ? `, exchange_transaction);
                                    let balValue = parseFloat(value-fee)
                                    // const [insert, errtoke] = await promisePool.query(walletQueries.insertexchange_transaction, exchange_transaction);
                                    // console.log('insert,erro1', insert)
                                    await promisePool.query(`UPDATE user_wallet SET Balance = (Balance+${parseFloat(balValue)}) WHERE coin_id=${coin_id} AND user_id=${user_id}`);
                                    
                                }

                            }
                        }

                    }else if(getETH_trx.message=='NOTOK' || getTRX_trx?.total==0){
                        // console.log('getTOKEN_trx', result)
                        // loopcount=+x
                    }

                }
            }
           
        }
        return true;
    } catch (e) {
        return e;
    }

}



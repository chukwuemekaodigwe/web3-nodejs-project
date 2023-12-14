const config = require('../../config');
const mysql = require('mysql2');
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();
const moment = require('moment')
require('../../utils/servelink')();
exports.getCustomCoins = async (right_coin_id) => {
    // try {
    console.log('right_coin_idright_coin_id', `select id,symbol from coins where id='${right_coin_id}'`)
    let customCoindata = await promisePool.query(`select id,symbol from coins`)
    let currency = await promisePool.query(`select id,symbol from coins where id='${right_coin_id}'`)
    currency = currency[0]
    //   console.log('currency', currency[0])
    customCoindata = customCoindata[0]
    var array = []
    if (customCoindata.length > 0) {
        for (let n in customCoindata) {
            //     console.log(customCoindata[n])
            let [coinPairs,ere] = await promisePool.query(`select * from coin_pairs where left_coin_id=${customCoindata[n].id} and right_coin_id=${right_coin_id}`)
           
            let [lastOrders,err1] = await promisePool.query(`SELECT o.price,o.amount FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${customCoindata[n].id} and p.right_coin_id=${right_coin_id} and o.status=1 ORDER BY o.id DESC limit 1`)
            // lastOrders = lastOrders[0]
            let [before24hOrder,ere2] = await promisePool.query(`SELECT o.price,o.id as id,o.amount,o.datetime FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${customCoindata[n].id} and p.right_coin_id=${right_coin_id} and o.status=1  and o.datetime <= DATE_SUB(CURDATE(), INTERVAL 1 DAY) order by id desc limit 1`)
            // before24hOrder = before24hOrder[0]
            let obj = {}
            //   console.log('coinPairs',before24hOrder,'lastOrders',lastOrders)
            if (lastOrders.length > 0 && before24hOrder.length > 0) {
                obj.price = String(lastOrders[0].price)
                obj.changePerentage = String(parseFloat(((parseFloat(lastOrders[0].price) - parseFloat(before24hOrder[0].price) ) / parseFloat(before24hOrder[0].price) * 100)))
                obj.symbol = `${customCoindata[n].symbol}${currency[0].symbol}`
            } else {
                obj.price = coinPairs[0]?.starting_price
                obj.changePerentage = "0"
                obj.symbol = `${customCoindata[n].symbol}${currency[0].symbol}`
            }
            array.push(obj)
        }
    }

    return array

    // } catch (error) {
    //     return 'error occured'
    // }


}

exports.getCoinlivePrice = async (db, req, res) => {
    // try {
   
    const left_coin_id = req.query.left_coin_id

    let [coinPairs, ere] = await promisePool.query(`select * from coin_pairs where left_coin_id=${left_coin_id} and right_coin_id=30`)

    let [lastOrders, err1] = await promisePool.query(`SELECT o.price,o.amount FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${left_coin_id} and p.right_coin_id=30 and o.status=1 ORDER BY o.id DESC limit 1`)
    // lastOrders = lastOrders[0]
    let [before24hOrder, ere2] = await promisePool.query(`SELECT o.price,o.id as id,o.amount,o.datetime FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${left_coin_id} and p.right_coin_id=30 and o.status=1  and o.datetime <= DATE_SUB(CURDATE(), INTERVAL 1 DAY) order by id desc limit 1`)
    // before24hOrder = before24hOrder[0]
    let obj = {}
       console.log('coinPairs',before24hOrder,'lastOrders',lastOrders,'coinPairs',coinPairs)

    if (lastOrders.length > 0 && before24hOrder.length > 0) {
        obj.price = parseFloat(lastOrders[0].price)
        obj.changePerentage = String(parseFloat(((parseFloat(lastOrders[0].price) - parseFloat(before24hOrder[0].price)) / parseFloat(before24hOrder[0].price) * 100)))
    } else {
        obj.price = coinPairs[0]?.starting_price
        obj.changePerentage = "0"
    }

    return res.status(200).send({
        success: true,
        msg: "Order dose not Exits",
        response: obj
    });


    // } catch (error) {
    //     return 'error occured'
    // }


}
exports.getOpenOrder = async (symbol, currency) => {
    // try {

    console.log('symbolsymbol', symbol, currency)
    console.log(`select id,symbol from coins where symbol='${symbol}'`)

    let customCoindata = await promisePool.query(`select id,symbol from coins where symbol='${symbol}' `)
    let currencyId = await promisePool.query(`select id,symbol from coins where symbol='${currency}'`)
    currencyId = currencyId[0]
    customCoindata = customCoindata[0]
    var buyorderarray = []
    var sellorderarray = []
    if (customCoindata.length > 0) {
        for (let n in customCoindata) {
            console.log(customCoindata[n])
            console.log(`SELECT o.price,o.amount,o.remaining_amount,o.fee_amount,o.tds_vda_fee,o.gst_quantity_fee,o.order_type FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${customCoindata[n].id} and p.right_coin_id=${currencyId[0].id} and o.status=0 ORDER BY o.id DESC limit 100`)
            let openOrders = await promisePool.query(`SELECT o.price,o.amount,o.remaining_amount,o.fee_amount,o.tds_vda_fee,o.gst_quantity_fee,o.order_type FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${customCoindata[n].id} and p.right_coin_id=${currencyId[0].id} and o.status=0 ORDER BY o.id DESC limit 100`)
            openOrders = openOrders[0]


            if (openOrders.length > 0) {
                for (let g in openOrders) {
                    let array1 = []
                    if (openOrders[g].order_type == 'BUY') {
                        array1[0] = String(parseFloat(openOrders[g].price).toFixed(4))
                        // array1[1] = String(parseFloat(openOrders[g].amount+openOrders[g].tds_vda_fee+openOrders[g].fee_amount+openOrders[g].gst_quantity_fee).toFixed(5))
                        array1[1] = String(parseFloat(openOrders[g].remaining_amount).toFixed(5))
                        array1[2] = `${customCoindata[n].symbol}${currency}`

                        buyorderarray.push(array1)
                    } else {
                        // console.log('openOrders[g]',openOrders[g])
                        array1[0] = String(parseFloat(openOrders[g].price).toFixed(4))
                        array1[1] = String(parseFloat(openOrders[g].remaining_amount).toFixed(5))

                        // array1[1] = String(parseFloat(openOrders[g].amount+openOrders[g].tds_vda_fee+openOrders[g].fee_amount+openOrders[g].gst_quantity_fee).toFixed(5))
                        array1[2] = `${customCoindata[n].symbol}${currency}`

                        sellorderarray.push(array1)
                    }


                }
            } else {
                let array1 = []
                let ararr2 = []
                array1[0] = "0"
                array1[1] = "0"
                array1[2] = `${customCoindata[n].symbol}USDT`
                ararr2[0] = "0"
                ararr2[1] = "0"
                ararr2[2] = `${customCoindata[n].symbol}USDT`
                buyorderarray.push(array1)
                sellorderarray.push(ararr2)
            }

        }
    }

    return { a: sellorderarray, b: buyorderarray }

    // } catch (error) {
    //     return 'error occured'
    // }

}

exports.getTrades = async (symbol, currency) => {
    // try {

    console.log('symbolsymbol', symbol, currency)
    console.log(`select id,symbol from coins where symbol='${symbol}' `)

    let customCoindata = await promisePool.query(`select id,symbol from coins where symbol='${symbol}' `)
    customCoindata = customCoindata[0]

    if (customCoindata.length > 0) {


        /* Only 5 minute pehle ka data trading hua vo and single single binance me aisa hi chal rha he */
        let tradeOrders = await promisePool.query(`SELECT o.price,o.id,o.datetime,o.amount,o.order_type FROM orders as o left join coin_pairs as p on p.id=o.pair_id WHERE p.left_coin_id=${customCoindata[0].id} and o.status=1 and o.datetime >= NOW() - INTERVAL 5 MINUTE ORDER BY o.id DESC limit 1`)
        tradeOrders = tradeOrders[0]

        if (tradeOrders && tradeOrders.length > 0) {

            //console.log('tradeOrderstradeOrders',tradeOrders)
            return {
                "e": "trade",     // Event type
                "E": (moment().unix()) * 1000,   // Event time
                "s": `${symbol}${currency}`,    // Symbol
                "t": tradeOrders[0].id,       // Trade ID
                "p": tradeOrders[0].price,     // Price
                "q": tradeOrders[0].amount,       // Quantity
                // "b": 88,          // Buyer order ID
                // "a": 50,          // Seller order ID
                "T": (moment(tradeOrders[0].datetime).unix()) * 1000,   // Trade time
                "m": true,        // Is the buyer the market maker?
                "M": true         // Ignore
            }
        }
        

    }
    else{
        return {}
    }

    // } catch (error) {
    //     return 'error occured'
    // }


}



exports.getGraphData = async (req, res) => {
   
    var pair_id = req.body.pair_id
    var type = req.body.type
    var symbol = req.body.symbol
    var actualcurrency = req.body.currency
    var currency = ''
    if (actualcurrency == 'SLC') {
        currency = 'USDT'
    } else {
        currency = actualcurrency
    }
    var interval = ''
    var resolution = ''
    var from = ''
    var to = ''
    let d = new Date(moment().format('YYYY-MM-DD'));
    var toTs = new Date(d)
    // console.log('ddddd', d, toTs)
    let [orders, err_order] = []
    if (type == 1) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime), MINUTE(datetime) DIV 1`);

        var period = 1
        // var toTs = d.setDate(d.getMinutes() - 1) * 1
        // var toTs = toTs.setDate(d.getMinutes() - 1)
        var toTs = d.getTime() - 1000 * 60
        var startTime
        interval = '1m'

        // if (orders.length == 0) {
        //     for (let n = 0; n < 10000; n++) {
        //         var amount = parseFloat(Math.random()).toFixed(4)
        //         var qry=`SELECT FLOOR((RAND() * (10-5+1))+5) as value`;
        //         [randomVal, err] = await promisePool.query(qry);

        //         var qry=`insert into orders(isMarket,order_type,amount,remaining_amount,fee_type_id,fee_amount,usdt_fee,tds_vda_fee,tds_usdt_fee,tda_fee,usdt_amount,status,price,pair_id,user_id,datetime) SELECT 0,'BUY',10,0,1,0,0,0,0,0,0,1,${randomVal[0].value},${randomVal[0].value},${pair_id},71,date_add('2022-01-01 06:00:00',interval ${n} minute) as datetime`;
        //        console.log(qry);
        //         await promisePool.query(qry);
        //     }
        // }
    }
    if (type == 2) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime), MINUTE(datetime) DIV 30`);
        var period = '30'
        var toTs = toTs.setDate(d.getDate() - 7)
        // var toTs = d.getTime()- 1000 * 60 * 30
        interval = '30m'
    }
    if (type == 3) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime) DIV 1`);
        var period = '60'
        var toTs = toTs.setDate(d.getDate() - 13)
        interval = '1h'
    }
    if (type == 4) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY  WEEK(datetime) DIV 1`);
        var period = '1440'
        var toTs = toTs.setDate(d.getDate() - 365 * 5)
        interval = '1w'
    }
    if (type == 5) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime) DIV 30`);
        var period = '1440'
        var toTs = toTs.setDate(d.getDate() - 365) * 1
        interval = '1M'
    }



    // console.log(`https://api.binance.com/api/v3/klines??symbol=${symbol}${currency}&interval=1m&limit=480`)

    // try {



    const conversion = await fetch(`https://public.coindcx.com/market_data/orderbook?pair=I-USDT_INR`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });

    const usdPricejson = await conversion.json();
    const price = Object.keys(usdPricejson.asks)

    var usdtinr = price[0]
    // console.log(usdtinr.USDT.INR)

    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}${currency}&interval=${interval}&limit=1000`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });
    let data1 = []
    data1 = await response.json();

    //console.log('data1.length', data1.length)
    var array = []

    if (actualcurrency == 'INR' && symbol == 'USDT') {
        console.log(`${d},${toTs},https://x.wazirx.com/api/v2/k?market=usdtinr&period=${period}&limit=2000&timestamp=${String(toTs).slice(0, -3)}`)
        const UsdtINRgraph = await fetch(`https://x.wazirx.com/api/v2/k?market=usdtinr&period=${period}&limit=2000&timestamp=${String(toTs).slice(0, -3)}`, {
            method: 'get', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

        });
        const INRjson = await UsdtINRgraph.json();
        for (let x in INRjson) {
            let obj = {}
            obj.time = parseInt(INRjson[x][0])
            obj.open = parseFloat(INRjson[x][1])
            obj.high = parseFloat(INRjson[x][2])
            obj.low = parseFloat(INRjson[x][3])
            obj.close = parseFloat(INRjson[x][4])
            obj.volume = parseFloat(INRjson[x][5])
            obj.type = 'custom_graph'
            array.push(obj)
        }
        console.log('INRjson',INRjson)
        // array = INRjson
    } else if (data1.length > 0) {
        for (let x in data1) {
            let obj = {}
            if (actualcurrency == 'SLC') {
                obj.time = parseInt(data1[x][0]) / 1000
                obj.open = parseFloat(data1[x][1] * usdtinr)
                obj.high = parseFloat(data1[x][2] * usdtinr)
                obj.low = parseFloat(data1[x][3] * usdtinr)
                obj.close = parseFloat(data1[x][4] * usdtinr)
                obj.volume = parseFloat(data1[x][5] * usdtinr)
                obj.type = 'custom_graph'

            } else {
                obj.time = parseInt(data1[x][0]) / 1000
                obj.open = parseFloat(data1[x][1])
                obj.high = parseFloat(data1[x][2])
                obj.low = parseFloat(data1[x][3])
                obj.close = parseFloat(data1[x][4])
                obj.volume = parseFloat(data1[x][5])
                obj.type = 'binance_graph'
            }


            array.push(obj)
        }

    }
    else if (orders.length == 0) {
        // console.log(`select * from coins where symbol='${symbol}'`)
        const [coinpairDetail, ere] = await promisePool.query(`select * from coin_pairs where id='${pair_id}'`)
        let obj = {}
        obj.time = (new Date(moment().format('YYYY-MM-DD h:mm:ss')).getTime()) / 1000
        obj.open = parseFloat(coinpairDetail[0].starting_price)
        obj.high = parseFloat(coinpairDetail[0].starting_price)
        obj.low = parseFloat(coinpairDetail[0].starting_price)
        obj.close = parseFloat(coinpairDetail[0].starting_price)
        obj.volume = 1
        obj.type = 'custom_graph'

        array.push(obj)
    }

    else {
        //     console.log('customgraph custom token', orders)
        let groupArray = []
        for (let x in orders) {


            let obj = {}



            if (groupArray.length > 5) {
                groupArray.shift()
                groupArray.push(orders[x])
            } else {
                groupArray.push(orders[x])
            }

            let highCount = 0
            let lowCount = 0

            // console.log('groupArray', groupArray)
            highCount = Math.max(...groupArray.map(o => o.price))
            lowCount = Math.min(...groupArray.map(o => o.price))

            obj.time = (new Date(moment(orders[x].date_time)).getTime()) / 1000
            obj.date = orders[x].date_time
            obj.close = orders[x].price

            if (x == 0) {
                obj.open = orders[x].price
            } else {
                obj.open = orders[x - 1].price
            }

            obj.high = highCount
            obj.low = lowCount
            if (x == (orders.length - 1)) {
                obj.volume = await getVolume(moment().format('YYYY-MM-DD HH:mm:ss'), moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'), orders[x].pair_id)
            } else {
                obj.volume = 0
            }
            obj.type = 'custom_graph'



            array.push(obj)

        }
    }


    async function getVolume(currentDate, previouseDate, pair_id) {
        //  console.log(`sql`,`select sum(amount * price) as volume from orders where datetime < '${currentDate}' and datetime >'${previouseDate}' and pair_id=${pair_id}`)
        const [orders, err_order] = await promisePool.query(`select sum(amount * price) as volume from orders where datetime < '${currentDate}' and datetime >'${previouseDate}' and pair_id=${pair_id}`)
        //    console.log('ordersorders',orders)
        if (orders[0].volume) {
            return orders[0].volume
        } else {
            return 0
        }

    }

    //  console.log('datadata', array)
    return res.status(200).send({
        success: true,
        msg: "Data fetch successfully!! ",
        response: array
    });

    // } catch (error) {
    //     return res.status(400).send({
    //         success: true,
    //         msg: "error occured!",
    //         response: array
    //     });
    // }





}


exports.getTickerinPairs = async (db, req, res) => {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });
    const jsonData = await response.json();
    const array = []
    let pairs = []
    let withoutInrPairs = await promisePool.query(`SELECT DISTINCT  cp.id as pair_id, concat(c1.symbol,'',c2.symbol) as pair,c1.symbol as left_symbol,c1.id as left_coin_id,c2.symbol as right_symbol,c2.id as right_coin_id from coin_pairs as cp left join coins as c1 on cp.left_coin_id=c1.id left join coins as c2 on c2.id=cp.right_coin_id  where c2.symbol <> 'INR'`)
    withoutInrPairs = withoutInrPairs[0]

    for (let y in withoutInrPairs) {
        pairs.push(withoutInrPairs[y].pair)
    }

    for (let x in jsonData) {
        obj = {}
        if (pairs.includes(jsonData[x].symbol)) {
            obj.s = jsonData[x].symbol
            obj.c = jsonData[x].askPrice
            obj.p = jsonData[x].priceChangePercent
        }

    }
}

exports.currencyExchange = async (db, req, res) => {

    const symbol = req.query.symbol
    const response = await fetch(`https://public.coindcx.com/market_data/current_prices`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });
    const jsonData = await response.json();

    if (jsonData && jsonData[symbol]) {
        return res.status(200).send({
            success: true,
            msg: "Data fetch successfully!! ",
            price: jsonData[symbol]
        });
    } else {
        return res.status(400).send({
            success: false,
            msg: "Invalid !! ",
        });
    }

}

exports.ExchangeINRBTC = async (left_symbol, right_symbol) => {

    const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${left_symbol}&tsyms=${right_symbol}&Apikey=7573b3a4107a89271d7276893d1cfd63850910a324ec5136b287a0226cc906b7`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });
    const jsonData = await response.json();
    // console.log('jsonData[left_symbol][right_symbol]',jsonData[left_symbol][right_symbol]) 
    if (jsonData && jsonData[left_symbol]) {
        return jsonData[left_symbol][right_symbol]

    }

}

exports.liveInrUsdt = async (db, req, res) => {
    const cryptocompare = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=USDT&tsyms=INR&Apikey=7573b3a4107a89271d7276893d1cfd63850910a324ec5136b287a0226cc906b7`, {
        method: 'get', headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

    });

    var usdtinr = await cryptocompare.json()
    // console.log(usdtinr.USDT.INR)

    return res.status(200).send({
        success: true,
        msg: "Data fetch successfully!! ",
        price: usdtinr.USDT.INR
    });

}


exports.getSLCGraph = async (req, res) => {
   
    var pair_id = req.body.pair_id;
    var type = req.body.type
    var symbol = req.body.symbol;
    var actualcurrency = 'USDT'
    var currency = ''
    if (actualcurrency == 'SLC') {
        currency = 'USDT'
    } else {
        currency = actualcurrency
    }
    var interval = ''
    var resolution = ''
    var from = ''
    var to = ''
    let d = new Date(moment().format('YYYY-MM-DD'));
    var toTs = new Date(d)
    // console.log('ddddd', d, toTs)
    let [orders, err_order] = []
    if (type == 1) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime), MINUTE(datetime) DIV 1`);

        var period = 1
        // var toTs = d.setDate(d.getMinutes() - 1) * 1
        // var toTs = toTs.setDate(d.getMinutes() - 1)
        var toTs = d.getTime() - 1000 * 60
        var startTime
        interval = '1m'

        // if (orders.length == 0) {
        //     for (let n = 0; n < 10000; n++) {
        //         var amount = parseFloat(Math.random()).toFixed(4)
        //         var qry=`SELECT FLOOR((RAND() * (10-5+1))+5) as value`;
        //         [randomVal, err] = await promisePool.query(qry);

        //         var qry=`insert into orders(isMarket,order_type,amount,remaining_amount,fee_type_id,fee_amount,usdt_fee,tds_vda_fee,tds_usdt_fee,tda_fee,usdt_amount,status,price,pair_id,user_id,datetime) SELECT 0,'BUY',10,0,1,0,0,0,0,0,0,1,${randomVal[0].value},${randomVal[0].value},${pair_id},71,date_add('2022-01-01 06:00:00',interval ${n} minute) as datetime`;
        //        console.log(qry);
        //         await promisePool.query(qry);
        //     }
        // }
    }
    if (type == 2) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime), MINUTE(datetime) DIV 30`);
        var period = '30'
        var toTs = toTs.setDate(d.getDate() - 7)
        // var toTs = d.getTime()- 1000 * 60 * 30
        interval = '30m'
    }
    if (type == 3) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime), HOUR(datetime) DIV 1`);
        var period = '60'
        var toTs = toTs.setDate(d.getDate() - 13)
        interval = '1h'
    }
    if (type == 4) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY  WEEK(datetime) DIV 1`);
        var period = '1440'
        var toTs = toTs.setDate(d.getDate() - 365 * 5)
        interval = '1w'
    }
    if (type == 5) {
        [orders, err_order] = await promisePool.query(`SELECT MAX(datetime) date_time,price,pair_id
        FROM   orders where pair_id=${pair_id} and status=1
        GROUP  BY DATE(datetime) DIV 30`);
        var period = '1440'
        var toTs = toTs.setDate(d.getDate() - 365) * 1
        interval = '1M'
    }



    var array = []

   
        //     console.log('customgraph custom token', orders)
        let groupArray = []
        for (let x in orders) {


            let obj = {}



            if (groupArray.length > 5) {
                groupArray.shift()
                groupArray.push(orders[x])
            } else {
                groupArray.push(orders[x])
            }

            let highCount = 0
            let lowCount = 0

            // console.log('groupArray', groupArray)
            highCount = Math.max(...groupArray.map(o => o.price))
            lowCount = Math.min(...groupArray.map(o => o.price))

            obj.time = (new Date(moment(orders[x].date_time)).getTime()) / 1000
            obj.date = orders[x].date_time
            obj.close = orders[x].price

            if (x == 0) {
                obj.open = orders[x].price
            } else {
                obj.open = orders[x - 1].price
            }

            obj.high = highCount
            obj.low = lowCount
            if (x == (orders.length - 1)) {
                obj.volume = await getVolume(moment().format('YYYY-MM-DD HH:mm:ss'), moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'), orders[x].pair_id)
            } else {
                obj.volume = 0
            }
            obj.type = symbol=='SLC'?'custom_graph':'binance_graph'



            array.push(obj)

        }
    


    async function getVolume(currentDate, previouseDate, pair_id) {
        //  console.log(`sql`,`select sum(amount * price) as volume from orders where datetime < '${currentDate}' and datetime >'${previouseDate}' and pair_id=${pair_id}`)
        const [orders, err_order] = await promisePool.query(`select sum(amount * price) as volume from orders where datetime < '${currentDate}' and datetime >'${previouseDate}' and pair_id=${pair_id}`)
        //    console.log('ordersorders',orders)
        if (orders[0].volume) {
            return orders[0].volume
        } else {
            return 0
        }

    }

    let sql = `SELECT price as currentPrice  FROM orders WHERE pair_id=10    ORDER BY id DESC LIMIT 1`;
    const [result, fields] = await promisePool.query(sql);

    // console.log('result', result);
    
    let sql2 = `SELECT COALESCE(min(price),0) as  low,coalesce(max(price),0) as high,COALESCE(sum(price),0) as volume   FROM orders WHERE pair_id=10 AND date(datetime) = CURDATE()   ORDER BY id DESC LIMIT 1`;
    const [result2, fields2] = await promisePool.query(sql2);


    let sql1 = `SELECT price as oldPrice  FROM orders  WHERE pair_id=10 AND date(datetime) <= CURRENT_DATE ORDER BY id DESC LIMIT 1`;
    const [result1, fields1] = await promisePool.query(sql1);
    
    let changePrice  = parseFloat(result[0].currentPrice) - parseFloat(result1[0]?.oldPrice); 

    let changePercentage = parseFloat(changePrice *100/result1[0].oldPrice);

    let newResult = {
        currentPrice: parseFloat(result[0].currentPrice),
        changePercentage : changePercentage,
        low : result2[0].low,
        high : result2[0].high,
        volume : result2[0].volume
    }
    return res.status(200).send({
        success: true,
        msg: "Data fetch successfully!! ",
        response: array,
        response1 : newResult
    });

    // } catch (error) {
    //     return res.status(400).send({
    //         success: true,
    //         msg: "error occured!",
    //         response: array
    //     });
    // }



    }


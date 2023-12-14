
var fetch = require('node-fetch');
const EthereumTx = require('ethereumjs-tx').Transaction
const { API_URL, PRIVATE_KEY } = process.env;
const Web3API = require('web3');
const config = require('../../config');
const axios = require('axios')
var Common = require('ethereumjs-common').default;
const CryptoJS = require("crypto-js");
const mysql = require('mysql2');
var bitcoin = require("bitcoinjs-lib");
var secp = require('tiny-secp256k1');
var ecfacory = require('ecpair');
const xrpl = require("xrpl")
const CryptoAccount = require("send-crypto");
var keySize = 256;
var iterations = 100;

// create the pool
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: config.password, database: config.database, port: config.mysqlPort });
// now get a Promise wrapped instance of that pool
const promisePool = pool.promise();
// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// create the pool
const TronWeb = require("tronweb");
const trcHttpProvider = TronWeb.providers.HttpProvider; // This provider is optional, you can just use a url for the nodes instead

const fullNode = new trcHttpProvider("https://api.trongrid.io/"); // Full node http endpoint
const solidityNode = new trcHttpProvider("https://api.trongrid.io/"); // Solidity node http endpoint
const eventServer = "https://api.trongrid.io/"; // Contract events http endpoint

// const fullNodeTest = new trcHttpProvider("https://api.shasta.trongrid.io/"); // Full node http endpoint
// const solidityNodeTest = new trcHttpProvider("https://api.shasta.trongrid.io/"); // Solidity node http endpoint
// const eventServerTest = "https://api.shasta.trongrid.io/"; // Contract events http endpoint
const { validate, getAddressInfo } = require('bitcoin-address-validation');
const { resolve } = require('bluebird');
let tronWeb = new TronWeb(fullNode, solidityNode, eventServer);



function openWallet(code) {
    // console.log("code ", code);
    var salt = CryptoJS.enc.Hex.parse(code.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(code.substr(32, 32))
    var encrypted = code.substring(64);
    var pass = process.env.EKEY//'abc' // process.env.EKEY;

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    //  console.log('keykey',key)

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    })
    //  console.log('decrypteddecrypted',decrypted)
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);

    // console.log('decrypteddecrypted',decrypted)
    return decrypted;
}


async function TransferGasPriceintoUserwallet(symbol, gasPrices, fee, myAddress) {
    console.log('TransferGasPriceintoUserwallet', gasPrices, fee, myAddress)
    const metamaskPrivateKey = process.env.METAMASKPRIVATEKEY
    const metaMaskPublicKey = process.env.METAMASKPUBLICKEY
    const amt = fee * 10 ** 18
    const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://bsc-dataseed.binance.org/' : 'https://polygon-rpc.com/'}`))
    // const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://goerli.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://data-seed-prebsc-2-s1.binance.org:8545' : 'https://rpc-mumbai.maticvigil.com'}`))
  
    const nonce = await web3.eth.getTransactionCount(metaMaskPublicKey, 'latest')
    var ETHBalace = await web3.eth.getBalance(metaMaskPublicKey)

    if (parseFloat(ETHBalace) < parseFloat(amt)) {
        console.log(`Insufficient funds in admin wallet`)
        //  return
    } else {
        let transaction = {
            nonce: web3.utils.toHex(nonce),
            from: metaMaskPublicKey,
            value: web3.utils.toHex(amt.toString()),//web3.utils.toHex("50000000000000"),
            gasPrice: web3.utils.toHex(gasPrices),
            gasLimit: web3.utils.toHex(21000),
            to: myAddress,
            chainId: symbol == 'ETH' ? 1 : 56
        };
        console.log('Etnter Condition', transaction)
        const signedTx = await web3.eth.accounts.signTransaction(transaction, metamaskPrivateKey);

        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {

            console.log('eETHBNBeRROR', error)


            console.log('idididididid', hash)
            //    return

        });
    }
    // exports.transfer(symbol, coin_id, balance, to_address, metaMaskPublicKey, metamaskPrivateKey, data[0].contract)


}

async function TranferGasPriceintoUserWalletTRC20(fee, to_address) {
    try {
        const privateKey = process.env.TronWalletPRIVATEKEY   //42c617f3743b6472bf0768608a09cff63f630fe73d2937dc968550378baf3d8diHrmkLls321jMw3DGBF6VUBWN4RsEjtahbqEVmJ9jSufcrch1piU20O7//eFtP+tF0e8tkhWgc1xZcIgrUQlRoa6IH/S1ybiwMJ9nTHJCAw=
        var fromAddress =  process.env.TronWalletAddress //address _from  //  //TCE3i9bJm1MT4JYAGtkJL5zDXCM3uKReQv
        var toAddress = to_address;  //address _to
        amount = fee * 10 ** 6
        //  let balance = await tronWeb.trx.getBalance(from_address);
        //Creates an unsigned TRX transfer transaction
        var tradeobj = await tronWeb.transactionBuilder.sendTrx(
            toAddress,
            amount,
            fromAddress
        );
        const signedtxn = await tronWeb.trx.sign(
            tradeobj,
            privateKey
        );
        const receipt = await tronWeb.trx.sendRawTransaction(
            signedtxn
        ).then((output) => {
            if (output.result == true) {
                console.log("- Output:", output, "\n");
            }
        });

    } catch (e) {
        console.log('error', e)
    }
}



async function TransferBEP20ERC20(withdrawtype, amount, from_address, to_address, from_private_key, Contractaddress) {
    console.log('checkfdfdfdf',myAddress,withdrawtype)
        
    if (withdrawtype == 1 || withdrawtype == 2) {
        if (withdrawtype == 1) {
            var web3 = new Web3API(new Web3API.providers.HttpProvider(`https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd`)) // mainnet  https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd
        } else {
            var web3 = new Web3API(new Web3API.providers.HttpProvider(`https://bsc-dataseed.binance.org/`))   //mainnet https://bsc-dataseed.binance.org/
        }
        return new Promise(async (resolve, reject) => {
            const myAddress = from_address //TODO: replace this address with your own public address

            const nonce = await web3.eth.getTransactionCount(myAddress, 'latest'); // nonce starts counting from 0
            console.log('checkfdfdfdf',myAddress,withdrawtype)
        
            let gasPrices = await web3.eth.getGasPrice();



            let abiArray = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]

            var contract = new web3.eth.Contract(abiArray, Contractaddress, { from: myAddress })

            var checkbalance = await contract.methods.balanceOf(myAddress).call()
            var decimals = await contract.methods.decimals().call();
          
            amount = amount * 10 ** decimals
           
            decimals = parseInt(decimals);

            // console.log('checkbalancecheckbalance', parseFloat(checkbalance / 10 ** decimals), amount / 10 ** 9)
            if (parseFloat(checkbalance / 10 ** decimals) < amount / 10 ** 9) {
                console.log('insufficient funds');
                resolve({
                    success: false,

                    msg: 'insufficient funds'
                })
            }

            console.log('amount1111', amount,decimals)

            var encoded_tx = await contract.methods.transfer(to_address, amount).encodeABI()

            let gasLimit = await web3.eth.estimateGas({
                nonce: web3.utils.toHex(nonce),
                from: myAddress,
                gasPrice: web3.utils.toHex(gasPrices),
                to: Contractaddress,
                data: encoded_tx,
            });
            console.log("gasLimit=======", gasLimit)
            let transaction = {
                nonce: web3.utils.toHex(nonce),
                from: myAddress,
                //  value: web3.utils.toHex(amount.toString()),//web3.utils.toHex("50000000000000"),
                gasPrice: web3.utils.toHex(gasPrices),
                gasLimit: web3.utils.toHex(gasLimit),
                to: Contractaddress,
                data: encoded_tx,
            };

            const signedTx = await web3.eth.accounts.signTransaction(transaction, from_private_key);

            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                if (error) {
                    console.log('eee444444444444444222222', error)
                    resolve({
                        success: false,
                        error: error
                    })
                } else {
                    console.log('idididididid', hash)
                    resolve({
                        success: true,
                        hash: hash
                    })
                }
            });


        })
    }
}


exports.transfer = async function (symbol, coin_id, amount, to_address, from_address, private_key, contractAddress, Bnb_contract, Trc_contract, withdrawtype) {
      let  from_private_key = await openWallet(private_key)
     
        // console.log('transfer variables', symbol, coin_id, amount, to_address, from_address, from_private_key, contractAddress, Bnb_contract, Trc_contract, withdrawtype)
    // async function getCurrentGasPrices() {
    //     let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
    //     let prices = {
    //         low: response.data.safeLow / 10,
    //         medium: response.data.average / 10,
    //         high: response.data.fast / 10
    //     };
    //     return prices;
    // }

    if (symbol == 'BUSD') {
        const response1 = await fetch(`http://blockchainexpert.co.in:7003/api/bep20/mainnet/transfer`, {
            method: 'POST', headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "from_address": from_address, // from_address,
                "from_private_key": from_private_key,  //from_private_key,
                "to_address": to_address,
                "amount": amount,
                "contract_address" :contractAddress //contractAddress
            })
        });
        const trx_hash = await response1.json();
        console.log('sssssssss', trx_hash)
                         
       
        if (!trx_hash.hash) {
            console.log('eee44444444444444411111',trx_hash.hash)
                         
            return {
                success: false,
                error: trx_hash

            }
        } else {
            console.log('vvvvvvvvvvvvvv',trx_hash.hash)
         
            return {
                success: true,
                hash: trx_hash.hash

            }

        }
    }
    async function getBalance(address) {
        return new Promise((resolve, reject) => {
            web3.eth.getBalance(address, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(web3.utils.fromWei(result, "ether"));
            });
        });
    }


    try {
        if (symbol == 'ETH' || symbol == 'BNB' || symbol == 'MATIC') {
            if (withdrawtype == 0) {
                const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://bsc-dataseed.binance.org' : 'https://polygon-rpc.com'}`))
                        //mainnet ETH= https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd, BNB= https://bsc-dataseed.binance.org/, matic =https://polygon-rpc.com/
                return new Promise(async (resolve, reject) => { 
                    const myAddress = from_address //TODO: replace this address with your own public address

                    const nonce = await web3.eth.getTransactionCount(myAddress, 'latest'); // nonce starts counting from 0



                    let balance = await web3.eth.getBalance(myAddress) / (10 ** 18)
                    console.log(balance + " ETH");
                    if (balance < amount) {
                        console.log('insufficient funds');
                        resolve({
                            success: false,
                            msg: 'insufficient funds contact to admin'
                        })
                    }

                    let gasPrices = await web3.eth.getGasPrice();


                    // const transaction ={
                    //     "to": to_address,
                    //     "value": web3.utils.toHex(amount.toString())),
                    //     "from":myAddress,
                    //     "gas": 21000,
                    //     "gasPrice": gasPrices.low * 1000000000,
                    //     "nonce": web3.utils.toHex(nonce),
                    //     "chainId": web3.utils.toHex(97),
                    // }

                    const value = parseInt(amount * 10 ** 18)
                    console.log('amount', value,amount, gasPrices)
                    let transaction = {
                        nonce: web3.utils.toHex(nonce),
                        from: myAddress,
                        value: value.toString(),//web3.utils.toHex("50000000000000"),
                        gasPrice: web3.utils.toHex(gasPrices),
                        gasLimit: web3.utils.toHex(21000),
                        to: to_address,
                        // chainId: symbol == 'ETH' ? 5 : symbol == 'BNB' ? 97 : 80001     //mainnet ,
                       chainId: symbol == 'ETH' ? 1 : symbol == 'BNB' ? 56 : 137,
                    };


                    const signedTx = await web3.eth.accounts.signTransaction(transaction, from_private_key);

                    web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                        if (error) {
                            console.log('eee44444444444444411111', error)
                            resolve({
                                success: false,
                                msg: 'transaction failed'
                            })
                        } else {
                            console.log('idididididid', hash)
                            resolve({
                                success: true,
                                hash: hash
                            })
                        }
                    });


                })
            } else if (withdrawtype == 2) {
                const resp = await TransferBEP20ERC20(withdrawtype, amount, from_address, to_address, from_private_key, Bnb_contract)
                return resp
            }
        }
        else if (symbol == 'BTC') {
            try {
                if (withdrawtype == 0) {
                    // return new Promise(async (resolve, reject) => {
                    //     var ECPair = ecfacory.ECPairFactory(secp);
                    //     var clientprivatekey = '8bcfdad5bb80516e57a6bbd324217831c2c12dcee81f838bdd3362002770e02d'
                    //     const clientpublickey = '144tZAA8GgEnhFvvFbiHePoqTVFkrPN6vr'
                    //     const keyBuffer = Buffer.from(clientprivatekey, 'hex')
                    //     var keys = ECPair.fromPrivateKey(keyBuffer)

                    //     const clientbalancecheck = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${clientpublickey}/balance`)
                    //     console.log('clientbalancecheck', clientbalancecheck.data)

                    //     var newtx = {
                    //         inputs: [{ addresses: [clientpublickey] }],
                    //         outputs: [{ addresses: [to_address], value: amount * 100000000 }] //4000=0.00004000 BTC
                    //     };
                    //     // calling the new endpoint, same as above
                    //     await axios.post('https://api.blockcypher.com/v1/btc/main/txs/new?token=0e42a92b197845b38e9bd7fdf080ee89', JSON.stringify(newtx))
                    //         .then(async function (tmptx) {
                    //             //  tmptx=JSON.parse(tmptx);
                    //             console.log('tmptx', tmptx.data)
                    //             // signing each of the hex-encoded string required to finalize the transaction
                    //             tmptx.pubkeys = [];
                    //             tmptx.signatures = tmptx.data.tosign.map(function (tosign, n) {
                    //                 tmptx.pubkeys.push(keys.publicKey.toString('hex'));
                    //                 return bitcoin.script.signature.encode(
                    //                     keys.sign(Buffer.from(tosign, "hex")),
                    //                     0x01,
                    //                 ).toString("hex").slice(0, -2);
                    //             });
                    //             // sending back the transaction with all the signatures to broadcast
                    //             //  console.log('tmptx',CircularJSON.stringify(tmptx))
                    //             await axios.post('https://api.blockcypher.com/v1/btc/main/txs/send?token=0e42a92b197845b38e9bd7fdf080ee89',
                    //                 JSON.stringify({
                    //                     "tx": tmptx.data.tx,
                    //                     "tosign": tmptx.data.tosign,
                    //                     "signatures": tmptx.signatures,
                    //                     "pubkeys": tmptx.pubkeys
                    //                 }))
                    //                 .then(function (finaltx) {
                    //                     console.log('finaltx', finaltx);
                    //                     if (finaltx.status == 201) {
                    //                         resolve({
                    //                             success: true,
                    //                             from: publickey,
                    //                             hash: finaltx.hash
                    //                         })
                    //                     }
                    //                 })
                    //                 .catch(function (xhr) {
                    //                     console.log('xhr.responseText', xhr);
                    //                 });
                    //         }).catch(function (error) { console.log('error', error.response.data) });

                    // })
                    return new Promise(async (resolve, reject) => {

                        const privateKey =await openWallet(process.env.BTCWalletPrivateKey)  // 
                        const account = new CryptoAccount(privateKey);
                        const publickey = await account.address('BTC');
                        const balanceInSats = await account.getBalanceInSats("BTC");
                   
                        console.log('Address', 'balanceInSats', await getAddressInfo(publickey), balanceInSats)
                        await account.sendSats(
                            to_address,
                            parseFloat(amount) * 100000000,// 700 satoshi = 0.0000007
                            "BTC",
                            {
                                fee: 1000,
                                subtractFee: true,
                            },
                        ).then(hash => {
                            console.log('BTC Transfer to user', hash)
                            if (hash) {
                                resolve({
                                    success: true,
                                    from: publickey,
                                    hash: hash
                                })
                            }

                        }).catch(err => {

                            if (err) {
                                console.log('btctransfer error', err)
                                resolve({
                                    success: false,
                                    msg: 'transaction failed'
                                })
                            }
                        })

                        // console.log('sendtransaction',sendtransaction)

                    }
                    )
                } else if (withdrawtype == 2) {
                    const resp = await TransferBEP20ERC20(withdrawtype, amount, from_address, to_address, from_private_key, Bnb_contract)
                    return resp
                }

            } catch (error) {
                console.log('ErrorTransfer', error)
            }

        }
        else if (symbol == 'LTC') {
            try {
                return new Promise(async (resolve, reject) => {
                    var ECPair = ecfacory.ECPairFactory(secp);

                    const privatekey = await openWallet(process.env.LTCWalletPRIVATEKEY)  //process.env.LTCWalletPRIVATEKEY
                    const publickey = process.env.LTCWalletAddress  //process.env.LTCWalletAddress

                    const keyBuffer = Buffer.from(privatekey, 'hex')
                    var keys = ECPair.fromPrivateKey(keyBuffer)

                    var newtx = {
                        inputs: [{ addresses: [publickey] }],
                        outputs: [{ addresses: [to_address], value: amount * 100000000 }]
                    };
                    // calling the new endpoint, same as above
                    await axios.post('https://api.blockcypher.com/v1/ltc/main/txs/new?token=0e42a92b197845b38e9bd7fdf080ee89', JSON.stringify(newtx))
                        .then(async function (tmptx) {
                            //  tmptx=JSON.parse(tmptx);
                            console.log('tmptx', tmptx.data)
                            // signing each of the hex-encoded string required to finalize the transaction
                            tmptx.pubkeys = [];
                            tmptx.signatures = tmptx.data.tosign.map(function (tosign, n) {
                                tmptx.pubkeys.push(keys.publicKey.toString('hex'));
                                return bitcoin.script.signature.encode(
                                    keys.sign(Buffer.from(tosign, "hex")),
                                    0x01,
                                ).toString("hex").slice(0, -2);
                            });
                            // sending back the transaction with all the signatures to broadcast
                            //  console.log('tmptx',CircularJSON.stringify(tmptx))
                            await axios.post('https://api.blockcypher.com/v1/ltc/main/txs/send?token=0e42a92b197845b38e9bd7fdf080ee89',
                                JSON.stringify({
                                    "tx": tmptx.data.tx,
                                    "tosign": tmptx.data.tosign,
                                    "signatures": tmptx.signatures,
                                    "pubkeys": tmptx.pubkeys
                                }))
                                .then(function (finaltx) {
                                    console.log('finaltx', finaltx.status);
                                    if (finaltx.status == 201) {
                                        resolve({
                                            success: true,
                                            from: publickey,
                                            hash: finaltx.hash
                                        })
                                    }
                                })
                                .catch(function (xhr) {
                                    console.log('xhr.responseText', xhr);
                                });
                        }).catch(function (error) {
                            console.log('testerror',error)
                            resolve({
                                success: false,
                                msg: 'transaction failed'
                            })
                        });

                })

            } catch (error) {
                console.log('ErrorTransfer', error)
            }
        }
       
        else if (symbol == 'TRX') {
            if (withdrawtype == 0) {
                return new Promise(async (resolve, reject) => {
                    try {
                        const privateKey = await openWallet(process.env.TronWalletPRIVATEKEY) //TESTNET process.env.TronWalletPRIVATEKEY  //42c617f3743b6472bf0768608a09cff63f630fe73d2937dc968550378baf3d8diHrmkLls321jMw3DGBF6VUBWN4RsEjtahbqEVmJ9jSufcrch1piU20O7//eFtP+tF0e8tkhWgc1xZcIgrUQlRoa6IH/S1ybiwMJ9nTHJCAw=
                        var fromAddress = process.env.TronWalletAddress; //address _from  //TCE3i9bJm1MT4JYAGtkJL5zDXCM3uKReQv  // Tron TESTNET Key process.env.TronWalletAddress
                        var toAddress = to_address;  //address _to
                        amount = amount * 10 ** 6
                        //  let balance = await tronWeb.trx.getBalance(from_address);
                        //Creates an unsigned TRX transfer transaction
                        var tradeobj = await tronWeb.transactionBuilder.sendTrx(
                            toAddress,
                            amount,
                            fromAddress
                        );
                        const signedtxn = await tronWeb.trx.sign(
                            tradeobj,
                            privateKey
                        );
                        const receipt = await tronWeb.trx.sendRawTransaction(
                            signedtxn
                        ).then((output) => {
                            if (output.result == true) {
                                resolve({
                                    success: true,
                                    hash: output.txid
                                })
                            }
                            //       console.log("- Output:", output, "\n");
                        });

                    } catch (e) {
                        console.log('error', e)
                        resolve({
                            success: false,
                            msg: 'transaction failed'
                        })
                    }
                })
            } else if (withdrawtype == 2) {
                const resp = await TransferBEP20ERC20(withdrawtype, amount, from_address, to_address, from_private_key, Bnb_contract)
                return resp
            }

        }
      
        else if (!['SOL', 'ALGO', 'DOGE', 'DOT'].includes(symbol)) {
             if (withdrawtype == 1 || withdrawtype == 2) {
                if (withdrawtype == 1) {
                    var web3 = new Web3API(new Web3API.providers.HttpProvider(`https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd`)) //mainnet https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd
                } else {
                    var web3 = new Web3API(new Web3API.providers.HttpProvider(`https://bsc-dataseed.binance.org`))
                }
              
                  
                return new Promise(async (resolve, reject) => {
                    const myAddress = from_address //TODO: replace this address with your own public address

                    const nonce = await web3.eth.getTransactionCount(myAddress, 'latest'); // nonce starts counting from 0
                  
                    amount = parseInt(amount * 10 ** 18)
                    let gasPrices = await web3.eth.getGasPrice();

                    let Contractaddress = withdrawtype == 1 ? contractAddress : Bnb_contract

                    
                    let abiArray = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]

                    var contract = new web3.eth.Contract(abiArray, Contractaddress, { from: myAddress })

                    var checkbalance = await contract.methods.balanceOf(myAddress).call()
                    var decimals = await contract.methods.decimals().call();

                    decimals = parseInt(decimals);

                    console.log('checkbalancecheckbalance', parseFloat(checkbalance / 10 ** decimals), amount / 10 ** 18)
                    if (parseFloat(checkbalance / 10 ** decimals) < amount / 10 ** 18) {
                        console.log('insufficient funds');
                        resolve({
                            success: false,

                            msg: 'insufficient funds'
                        })
                    } else {
                        console.log('amount', amount)
                        var encoded_tx = await contract.methods.transfer(to_address, amount.toString()).encodeABI()

                        let gasLimit = await web3.eth.estimateGas({
                            nonce: web3.utils.toHex(nonce),
                            from: myAddress,
                            gasPrice: web3.utils.toHex(gasPrices),
                            to: Contractaddress,
                            data: encoded_tx,
                        });
                        console.log("gasLimit=======", gasLimit)
                        let transaction = {
                            nonce: web3.utils.toHex(nonce),
                            from: myAddress,
                            //  value: web3.utils.toHex(amount.toString()),//web3.utils.toHex("50000000000000"),
                            gasPrice: web3.utils.toHex(gasPrices),
                            gasLimit: web3.utils.toHex(gasLimit),
                            to: Contractaddress,
                            data: encoded_tx,
                        };

                        let  from_private_key = await openWallet(private_key)
                        console.log('from_private_key',from_private_key)
     
                        const signedTx = await web3.eth.accounts.signTransaction(transaction, from_private_key);

                        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                            if (error) {
                                console.log('eee444444444444444', error)
                                resolve({
                                    success: false,
                                    msg: 'transaction failed'
                                })
                            } else {
                                console.log('idididididid', hash)
                                resolve({
                                    success: true,
                                    hash: hash
                                })
                            }
                        });
                    }





                })
            } else if (withdrawtype == 3) {

                try {
                    const privateKey = from_private_key;
                    const toAddress = process.env.TronWalletAddress; //process.env.TronWalletAddress  //TCE3i9bJm1MT4JYAGtkJL5zDXCM3uKReQv
                    const fromAddress = from_address;
                    const trc20ContractAddress = Trc_contract;

                    amount = amount * 10 ** 18;

                    let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);


                    let contract = await tronWeb.contract().at(trc20ContractAddress);

                    //Use send to execute a non-pure or modify smart contract method on a given smart contract that modify or change values on the blockchain. These methods consume resources(bandwidth and energy) to perform as the changes need to be broadcasted out to the network.

                    await contract.transfer(
                        //address _from
                        toAddress, //address _to
                        amount.toString() //amount
                    ).send({
                        feeLimit: 10000000
                    }).then((output) => {
                        console.log("-TRC Token Output:", output, "\n");
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        msg: 'transaction failed'
                    })
                    console.log('TRCerror', e)
                }
            }
        }
        else {
            return {
                success: false,
                error: "Invalid Symbol"
            }
        }

    } catch (e) {
        console.log('test1',e)
        return {
            success: false,
            error: e,
            message: e
        }
    }

}


async function transferUserToAdminBEPTRC20(symbol, from_private_key, from_address, to_address, Contractaddress) {
    console.log('symbol', symbol, 'from_private_key', from_private_key, 'from_address', from_address, 'to_address', to_address, 'Contractaddress', Contractaddress)
    const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://bsc-dataseed.binance.org/' : 'https://polygon-rpc.com/'}`))
    // const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://goerli.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://data-seed-prebsc-2-s1.binance.org:8545' : 'https://rpc-mumbai.maticvigil.com'}`))
              
    if (web3 !== '') {

        const myAddress = from_address  //TODO: replace this address with your own public address
        const privateKey = from_private_key
        console.log('44444444444444444444',myAddress,privateKey)
        const nonce = await web3.eth.getTransactionCount(myAddress, 'latest'); // nonce starts counting from 0
        console.log('55555555555', nonce)
        //  amount = amount * 10 ** 9
        let gasPrices = await web3.eth.getGasPrice();
        var block = await web3.eth.getBlock("latest");

        // let gasLimit = block.gasLimit
        // gasLimit = gasLimit.toString().slice(0, -3)
        var ETHBalace = await web3.eth.getBalance(myAddress) / (10 ** 18)
        console.log(`${symbol}Balace`, parseFloat(ETHBalace).toFixed(8))
        console.log('cOINSGasprice', gasPrices)
        // let Contractaddress = "0x4C9d6Aa6Ad1c227dD151490918F384BFBdF5667C"

        console.log('Contractaddress', Contractaddress)

        // let abiArray = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]
   
        let abiArray = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]

        var contract = new web3.eth.Contract(abiArray, Contractaddress, { from: myAddress })
        //   console.log('contract11111', contract)
        var decimals = await contract.methods.decimals().call();
        //    console.log('decimals', decimals)
        var balance = await contract.methods.balanceOf(myAddress).call()
        console.log('tokenbalance',balance)
        let fixgaslimit = 80000
        console.log('main balance anf tokentransferfee ', parseFloat(ETHBalace).toFixed(8), (parseFloat(gasPrices) * parseFloat(fixgaslimit)) / 10 ** 18,)
        if (parseFloat(balance / 10 ** decimals) > 0 && parseFloat(ETHBalace) < (parseFloat(gasPrices) * parseFloat(fixgaslimit)) / 10 ** 18) {
            await TransferGasPriceintoUserwallet(symbol, gasPrices, (parseFloat(gasPrices) * parseFloat(fixgaslimit)) / 10 ** 18, myAddress)
        }

        var ETHBalace = await web3.eth.getBalance(myAddress) / (10 ** 18)
        console.log('aftersendmainfee', parseFloat(ETHBalace).toFixed(8))
        //  var balance = 500000000000000
        var sendToken = balance

        sendToken = sendToken.toLocaleString('fullwide', { useGrouping: false })
        console.log('sendToken', sendToken, gasPrices)



        //  let fee = (parseFloat(gasPrices) * parseFloat(gasLimit)) / 10 ** 18

        //   console.log('feeeeeeeee', fee)
        //   console.log('Token', parseFloat(balance / 10 ** decimals), 'Fees', parseFloat(fee), 'ETHBALACNE', ETHBalace)

        if (parseFloat(balance / 10 ** decimals) > 0) {
            console.log('Enter in Condition')
            const tx_builder = await contract.methods.transfer(to_address, sendToken.toString())
            var encoded_tx = tx_builder.encodeABI()


            let gasLimit = await web3.eth.estimateGas({
                nonce: web3.utils.toHex(nonce),
                from: myAddress,
                gasPrice: web3.utils.toHex(gasPrices),
                to: Contractaddress,
                data: encoded_tx,
            });
            console.log('gasLimit', gasLimit)

            let transaction = {
                nonce: web3.utils.toHex(nonce),
                from: myAddress,
                gasPrice: web3.utils.toHex(gasPrices),
                gasLimit: web3.utils.toHex(gasLimit),
                to: Contractaddress,
                data: encoded_tx,
            };

            const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);

            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
                if (error) {
                    console.log('eee444444444444444', error)

                } else {
                    console.log('idididididid', hash)
                    // return
                }
            });
        } else {
            console.log('No Transaction done')
            return
        }

    }
}

async function transferUserToAdminTRC20(symbol, trc_from_private_key, trc_from_public_key, trcContractAddress) {
    try {
        const privateKey = trc_from_private_key;
        const toAddress = process.env.TronWalletAddress //"TCE3i9bJm1MT4JYAGtkJL5zDXCM3uKReQv"//'TSbsQZuRhX2i56mr3riHVCxGvj7FkXQoyX'; process.env.TronWalletAddress
        const fromAddress = trc_from_public_key;
        const trc20ContractAddress = trcContractAddress;
        let amount = 0;
        let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
        let TRCbalance = await tronWeb.trx.getBalance(fromAddress)
        let contract = await tronWeb.contract().at(trc20ContractAddress);
        let balance = await contract.balanceOf(fromAddress).call()
        console.log('TRCbalance', TRCbalance)
        console.log('Tokenbalance', balance)
        // const block=await tronWeb.trx.getCurrentBlock()
        // block.transactions
        //  for (let y=0;y<1;y++){
        //      const obj=block.transactions[y].raw_data

        //  console.log('tronWeb.trx.getCurrentBlock()',block.transactions[y],obj['fee_limit']  / 10 ** 6);
        // }
        if (parseFloat(balance / 10 ** 6) > 0 && parseFloat(TRCbalance / 10 ** 6) < parseFloat(0.002 * balance / 10 ** 6)) {
            await TranferGasPriceintoUserWalletTRC20(0.002 * balance / 10 ** 6, fromAddress)
        }
        //   console.log('limit',await block.transactions[0].fee_limit* 65000 / 10 ** 18)


        // let balance = contract.balanceOf(fromAddress).call()
        amount = balance;

        //Use send to execute a non-pure or modify smart contract method on a given smart contract that modify or change values on the blockchain. These methods consume resources(bandwidth and energy) to perform as the changes need to be broadcasted out to the network.

        if (parseFloat(TRCbalance / 10 ** 6) > 0) {
            await contract.transfer(
                //address _from
                toAddress, //address _to
                amount.toString() //amount
            ).send({
                feeLimit: 10000000
            }).then((output) => {
                console.log("-TRC Token Output:", output, "\n");
            });
        }



    } catch (e) {
        console.log('error', e)
    }
}

exports.usertoAdminTransfer = async function (alluserwallets) {
    try {
        var metaMaskPublicKey =   process.env.METAMASKPUBLICKEY //'0xA59C7912A71E573235cad72f19322c0994B162fc'

        for (let n in alluserwallets) {
            const symbol = alluserwallets[n].symbol
            const coin_id = alluserwallets[n].coin_id
            const amount = 0
            const to_address = metaMaskPublicKey
            const from_address = alluserwallets[n].public_key
            const from_private_key = await openWallet(alluserwallets[n].private_key)

            const contractAddress = alluserwallets[n].contract
            const bnbContractAddress = alluserwallets[n].Bnb_contract
            const trcContractAddress = alluserwallets[n].Trc_contract
            console.log('alluserwalletsalluserwallets', alluserwallets[n].symbol,symbol,from_private_key)
            console.log('alluserwalletsalluserwalletsuserid', alluserwallets[n].user_id)
            // if (alluserwallets[n].trc_privatekey !== null) {
        
            //     var trc_from_private_key = await openWallet(alluserwallets[n].trc_privatekey)       
            //     var trc_from_public_key = alluserwallets[n].trc_publickey
            // }
            if (alluserwallets[n].bnb_privatekey !== null) {
                var bnb_from_private_key = await openWallet(alluserwallets[n].bnb_privatekey)
              
                var bnb_from_public_key = alluserwallets[n].bnb_publickey
            }
            console.log('from_private_keyfrom_private_key',from_private_key)
            if (symbol == 'ETH' || symbol == 'BNB' || symbol == 'MATIC') {
                console.log('symbol',symbol)
                console.log('from_private_keyfrom_private_key',from_private_key)
                console.log('from_private_keyfrom_public_key',from_private_key)


                for (let n = 0; n < 2; n++) {
                    if (n == 0) {
                        const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://mainnet.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://bsc-dataseed.binance.org/' : 'https://polygon-rpc.com/'}`))
                        // const web3 = new Web3API(new Web3API.providers.HttpProvider(`${symbol == 'ETH' ? 'https://goerli.infura.io/v3/a1361e1c0fda468bab200985724259bd' : symbol == 'BNB' ? 'https://data-seed-prebsc-2-s1.binance.org:8545' : 'https://rpc-mumbai.maticvigil.com'}`))
              

                        const myAddress = from_address //TODO: replace this address with your own public address

                        const nonce = await web3.eth.getTransactionCount(myAddress, 'latest'); // nonce starts counting from 0


                        var getBalace = await web3.eth.getBalance(myAddress) / (10 ** 18);
                        var currentBal = parseFloat(getBalace)
                        //    console.log('cHECKbALANCErESULT', currentBal)
                        //  let balance = web3.utils.fromWei(result, "ether");
                        console.log(currentBal + "Balance");
                        // if (balance < amount) {
                        //     console.log('insufficient funds');
                        //     resolve({
                        //         success: false,
                        //         error: err,
                        //         msg: 'insufficient funds'
                        //     })
                        // }

                        let gasPrices = await web3.eth.getGasPrice();
                        console.log('ETHBNBGASPRICE', gasPrices)
                        // const transaction ={
                        //     "to": to_address,
                        //     "value": web3.utils.toHex(amount.toString())),
                        //     "from":myAddress,
                        //     "gas": 21000,
                        //     "gasPrice": gasPrices.low * 1000000000,
                        //     "nonce": web3.utils.toHex(nonce),
                        //     "chainId": web3.utils.toHex(97),
                        // }

                        var value = parseFloat(currentBal)
                        var fee = parseFloat(gasPrices * 21000 / 10 ** 18)
                        value = value - fee
                        console.log('amount', currentBal, 'Feeeessssssss', fee)

                        if (currentBal > fee) {
                            value = parseInt(parseFloat(value) * 10 ** 18).toString();
                            //  console.log('valuevalue', value)
                            let transaction = {
                                nonce: web3.utils.toHex(nonce),
                                from: myAddress,
                                value: web3.utils.toHex(value),//web3.utils.toHex("50000000000000"),
                                gasPrice: web3.utils.toHex(gasPrices),
                                gasLimit: web3.utils.toHex(21000),
                                to: to_address,
                                // chainId: symbol == 'ETH' ? 5 : symbol == 'BNB' ? 97 : 80001     //mainnet ,
                                chainId: symbol == 'ETH' ? 1 : symbol == 'BNB' ? 56 : 137,
                            };
                            console.log('Etnter Condition', transaction)
                            const signedTx = await web3.eth.accounts.signTransaction(transaction, from_private_key);

                            web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {

                                console.log('eETHBNBeRROR', error)


                                console.log('idididididid', hash)


                            });
                        } else {
                            console.log('Insufficient ETH,BNB,MATIC Balance for Transfer')
                        }
                    } else if (n == 1 && symbol == 'ETH' && bnbContractAddress !== null && bnb_from_public_key) {
                        await transferUserToAdminBEPTRC20('BNB', bnb_from_private_key, bnb_from_public_key, to_address, bnbContractAddress)
                    }
                }


            }
          else if (symbol == 'BUSD') {
                const response1 = await fetch(`http://blockchainexpert.co.in:7003/api/bep20/mainnet/transfer`, {
                    method: 'POST', headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "from_address": from_address, // from_address,
                        "from_private_key": from_private_key,  //from_private_key,
                        "to_address": to_address,
                        "amount": amount,
                        "contract_address" :contractAddress //contractAddress
                    })
                });
                const trx_hash = await response1.json();
                console.log('sssssssss', trx_hash)
                                 
               
                if (!trx_hash.hash) {
                    console.log('eee44444444444444411111',trx_hash.hash)
                                 
                    return {
                        success: false,
                        error: trx_hash
        
                    }
                } else {
                    console.log('vvvvvvvvvvvvvv',trx_hash.hash)
                 
                    return {
                        success: true,
                        hash: trx_hash.hash
        
                    }
        
                }
            }

            // else if (symbol == 'BTC') {
            //     for (let n = 0; n < 2; n++) {
            //         if (n == 0) {
            //             console.log('symbol222',symbol)
            //             //try {
            //             //     console.log('BTCfrom_private_key', from_private_key)
            //             //     var ECPair = ecfacory.ECPairFactory(secp);
            //             //     var privatekey=from_private_key
            //             //   //  var privatekey = '7229fe12654983dfa1ad317ab1874b933a54b44a296906415363360fc0c67fdc'
            //             //     const publickey = from_address
            //             //     const keyBuffer = Buffer.from(privatekey, 'hex')
            //             //     var keys = ECPair.fromPrivateKey(keyBuffer)
            //             //     const clientAddress='144tZAA8GgEnhFvvFbiHePoqTVFkrPN6vr'
            //             //   //  console.log(`https://api.blockcypher.com/v1/btc/main/addrs/${publickey}/balance`)
            //             //     const balancecheck = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${publickey}/balance`)
            //             //      console.log('balancecheck',balancecheck.data)

            //             //      const latesttransaction = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/?limit=1&includeHex=true`)   
            //             //      console.log('latesttransaction',latesttransaction.data)
            //             //      let fee= parseFloat(latesttransaction.data[0].fees)

            //             //      let withoutfeeamount = parseFloat(balancecheck.data.balance) - 800 

            //             //      var newtx = {
            //             //         inputs: [{ addresses: [publickey] }],
            //             //         outputs: [{ addresses: [clientAddress], value: 1000 }] //4000=0.00004000 BTC
            //             //         //   outputs: [{ addresses: ['1HFGe7zFQDhaELxWazRp6sgJ2TzuuC9kqL'], value: balancecheck.balance }] //4000=0.00004000 BTC
            //             //     };
            //             //     // calling the new endpoint, same as above
            //             //     console.log('newtx', JSON.stringify(newtx))
            //             //      axios.post('https://api.blockcypher.com/v1/btc/main/txs/new?token=0e42a92b197845b38e9bd7fdf080ee89', JSON.stringify(newtx))
            //             //         .then(async function (tmptx) {
            //             //             tmptx = JSON.parse(tmptx);
            //             //             console.log('tmptx', tmptx.data)
            //             //             // signing each of the hex-encoded string required to finalize the transaction
            //             //             tmptx.pubkeys = [];
            //             //             tmptx.signatures = tmptx.data.tosign.map(function (tosign, n) {
            //             //                 tmptx.pubkeys.push(keys.publicKey.toString('hex'));
            //             //                 return bitcoin.script.signature.encode(
            //             //                     keys.sign(Buffer.from(tosign, "hex")),
            //             //                     0x01,
            //             //                 ).toString("hex").slice(0, -2);
            //             //             });
            //             //             // sending back the transaction with all the signatures to broadcast
            //             //             //  console.log('tmptx',CircularJSON.stringify(tmptx))
            //             //              axios.post('https://api.blockcypher.com/v1/btc/main/txs/send?token=0e42a92b197845b38e9bd7fdf080ee89',
            //             //                 JSON.stringify({
            //             //                     "tx": tmptx.data.tx,
            //             //                     "tosign": tmptx.data.tosign,
            //             //                     "signatures": tmptx.signatures,
            //             //                     "pubkeys": tmptx.pubkeys
            //             //                 }))
            //             //                 .then(function (finaltx) {
            //             //                     console.log('finaltx', finaltx);
            //             //                     if (finaltx.status == 201) {
            //             //                         console.log('suCCESS tranfer BTC')
            //             //                     }
            //             //                 })
            //             //                 .catch(function (xhr) {
            //             //                     console.log('failed btc', xhr);
            //             //                 });
            //             //         }).catch(function (error) { console.log('error transfer', error.response.data.tx.outputs,error.response.data) });



            //             // } catch (error) {
            //             //     console.log('ErrorTransfer', error)
            //             // }

            //             const publickeyuser = from_address
            //             const clientAddress = '144tZAA8GgEnhFvvFbiHePoqTVFkrPN6vr'
            //             const balancecheck = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${publickeyuser}/balance`)
            //             console.log('balancecheck', balancecheck.data)
            //             // const latesttransaction = await axios.get(`https://api.blockcypher.com/v1/btc/main/txs/?limit=1&includeHex=true`)   
            //             //   console.log('latesttransaction',latesttransaction.data)
            //             //  let fee= parseFloat(latesttransaction.data[0].fees)

            //             //   let withoutfeeamount = parseFloat(balancecheck.data.balance) - fee
            //             const privateKey = from_private_key
            //             //   console.log('privateKey',privateKey)
            //             const account = new CryptoAccount(privateKey);
            //             const publickey = await account.address('BTC');
            //             const balanceInSats = await account.getBalanceInSats("BTC");
            //             console.log('Address', 'balanceInSats', publickey, balanceInSats)
            //             account.sendSats(
            //                 clientAddress,
            //                 balanceInSats,// 700 satoshi = 0.0000007
            //                 "BTC",
            //                 {
            //                     fee: 1000,
            //                     subtractFee: true,
            //                 },
            //             ).then(hash => {
            //                 console.log('BTC Transfer to admin', hash)
            //             }).catch(err => {
            //                 console.log('btcerr', err)
            //             })

            //             // console.log('sendtransaction', sendtransaction)



            //         } else if (n == 1 && bnbContractAddress !== null && bnb_from_public_key) {
            //             await transferUserToAdminBEPTRC20('BNB', bnb_from_private_key, bnb_from_public_key, to_address, bnbContractAddress)
            //         }

            //     }
            // }

            // else if (symbol == 'LTC') {
            //     for (n = 0; n < 2; n++) {
            //         if (n == 0) {

            //             try {

            //                 var ECPair = ecfacory.ECPairFactory(secp);

            //                 const privatekey = from_private_key
            //                 const publickey = from_address

            //                 const keyBuffer = Buffer.from(privatekey, 'hex')
            //                 var keys = ECPair.fromPrivateKey(keyBuffer)
            //                 const balancecheck = await axios.get(`https://api.blockcypher.com/v1/ltc/main/addrs/${publickey}/balance`)
            //                 var newtx = {
            //                     inputs: [{ addresses: [publickey] }],
            //                     outputs: [{ addresses: ['ltc1qk9mlh6wp9uc00te0eaawx58r7sqlnn3vel52al'], value: balancecheck.balance }]
            //                 };
            //                 // calling the new endpoint, same as above
            //                 await axios.post('https://api.blockcypher.com/v1/ltc/main/txs/new?token=0e42a92b197845b38e9bd7fdf080ee89', JSON.stringify(newtx))
            //                     .then(async function (tmptx) {
            //                         //  tmptx=JSON.parse(tmptx);
            //                         console.log('tmptx', tmptx.data)
            //                         // signing each of the hex-encoded string required to finalize the transaction
            //                         tmptx.pubkeys = [];
            //                         tmptx.signatures = tmptx.data.tosign.map(function (tosign, n) {
            //                             tmptx.pubkeys.push(keys.publicKey.toString('hex'));
            //                             return bitcoin.script.signature.encode(
            //                                 keys.sign(Buffer.from(tosign, "hex")),
            //                                 0x01,
            //                             ).toString("hex").slice(0, -2);
            //                         });
            //                         // sending back the transaction with all the signatures to broadcast
            //                         //  console.log('tmptx',CircularJSON.stringify(tmptx))
            //                         await axios.post('https://api.blockcypher.com/v1/ltc/main/txs/send?token=0e42a92b197845b38e9bd7fdf080ee89',
            //                             JSON.stringify({
            //                                 "tx": tmptx.data.tx,
            //                                 "tosign": tmptx.data.tosign,
            //                                 "signatures": tmptx.signatures,
            //                                 "pubkeys": tmptx.pubkeys
            //                             }))
            //                             .then(function (finaltx) {

            //                                 if (finaltx.status == 201) {
            //                                     console.log('transfer LTC')
            //                                 }
            //                             })
            //                             .catch(function (xhr) {
            //                                 console.log('FAILED transfer LTC', xhr);
            //                             });
            //                     }).catch(function (error) { console.log('error', error) });

            //             } catch (error) {
            //                 console.log('ErrorTransfer', error)
            //             }
            //         } else if (n == 1 && bnbContractAddress !== null) {
            //             await transferUserToAdminBEPTRC20('BNB', bnb_from_private_key, bnb_from_public_key, to_address, bnbContractAddress)
            //         }
            //     }
            // }
        
            else if (symbol == 'TRX') {
                for (let n = 0; n < 2; n++) {
                    if (n == 0) {
                        try {
                            const privateKey = from_private_key
                            var fromAddress = from_address; //address _from
                            var toAddress =  process.env.TronWalletAddress //'TCE3i9bJm1MT4JYAGtkJL5zDXCM3uKReQv' //'TSbsQZuRhX2i56mr3riHVCxGvj7FkXQoyX'; //address _to  process.env.TronWalletAddress
                            let balance = await tronWeb.trx.getBalance(from_address);
                            //Creates an unsigned TRX transfer transaction
                            var tradeobj = await tronWeb.transactionBuilder.sendTrx(
                                toAddress,
                                balance,
                                fromAddress
                            );
                            const signedtxn = await tronWeb.trx.sign(
                                tradeobj,
                                privateKey
                            );
                            const receipt = await tronWeb.trx.sendRawTransaction(
                                signedtxn
                            ).then((output) => {

                                console.log("- Output:", output, "\n");

                            });
                        } catch (e) {
                            console.log('error', e)
                        }
                    } else if (n == 1 && bnbContractAddress !== null) {
                        await transferUserToAdminBEPTRC20('BNB', bnb_from_private_key, bnb_from_public_key, to_address, bnbContractAddress)
                    }
                }
            } 
           
            else if (!['SOL', 'ALGO', 'DOGE', 'DOT'].includes(symbol)) {

                for (let x = 0; x < 3; x++) {
                    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxx', x)

                    if (x == 0 && contractAddress && from_address) {
                        console.log('ETHRun', contractAddress)
                        await transferUserToAdminBEPTRC20('ETH', from_private_key, from_address, to_address, contractAddress)

                    } else if (x == 1 && bnbContractAddress && bnb_from_public_key) {
                        console.log('BnbRun', bnbContractAddress)
                        await transferUserToAdminBEPTRC20('BNB', bnb_from_private_key, bnb_from_public_key, to_address, bnbContractAddress)

                    } else if (x == 2 && trcContractAddress && trc_from_public_key) {
                        console.log('TRCRun', trcContractAddress)
                        await transferUserToAdminTRC20('TRC', trc_from_private_key, trc_from_public_key, trcContractAddress)
                    } else {
                        console.log('no contract address')
                    }

                }
            }
            else {
                console.log("Invalid Symbol")

            }
        }
    } catch (e) {
        return {
            success: false,
            error: e,
            message: e
        }
    }
}



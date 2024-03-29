const axios = require('axios')
const config = require('./config.json')
const sendMail = require('./src/mail')
const schedule = require('node-schedule');

const getHeight = async function () {
    const info = await axios.post(config.my_rpc, {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "chain_getHeader",
        "params": []
    })
    // console.log(info.data)
    return (parseInt(info.data.result.number, 16))
}

const getOfficalHeight = async function () {
    const info = await axios.get(`${config.offical_rpc}/chain/height`)
    // console.log(info.data)
    return (info.data.height)
}

const getbestNumber = async function () {
    const info = await axios.post(config.my_rpc, {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "system_peers",
        "params": []
    })
    // console.log(info.data)
    let bestNumber = 0
    for (let item of info.data.result) {
        bestNumber = item.bestNumber > bestNumber ? item.bestNumber : bestNumber
    }
    return bestNumber
}

let lastHeight = 0
// check every minute
console.log(`start moniting chainx node : ${config.my_rpc}`)
schedule.scheduleJob('0 * * * * *', function () {
    console.log(`now: ${new Date()}`)
    Promise.all([getHeight(), getbestNumber(), getOfficalHeight()]).then(([height, bestNumber, offical]) => {
        console.log({ height, bestNumber, offical })
        const target = bestNumber > offical ? bestNumber : offical
        if (height < target - config.alert_gap || height == lastHeight) {
            //alert
            console.log("send mail")
            sendMail("chainx node problem!", JSON.stringify({ height, bestNumber, offical }))
        }
        lastHeight = height
    }).catch(err => {
        console.error(err)
    })
});
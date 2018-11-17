const fs = require('fs');
const request = require('superagent');
const chalk = require('chalk');
const moment = require('moment');
const _ = require('lodash');

const HL_HEADER = `window.Calendar = window.Calendar||{};
window.Calendar.HuangLi = window.Calendar.HuangLi || {};
window.Calendar.HuangLi.y`;
const WT_HEADER = `window.Calendar = window.Calendar||{};
window.Calendar.Holiday = window.Calendar.Holiday || {};
window.Calendar.Holiday.y`;

function showError (url, info) {
    console.error(chalk.red(url + ':' + info));
    process.exit(0);
}
function getURL(year, month) {
    const code = encodeURIComponent(`${year}年${month}月`);
    return `https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php?query=${code}&co=&resource_id=6018&t=1532161817196&ie=utf8&oe=utf8&format=json&tn=baidu`;
}
function getData (year, month) {
    return new Promise((resolve) => {
        const url = getURL(year, month);
        request.get(url).end((err, res) => {
            if (err) {
                showError(year, month, err.status);
            }
            resolve(JSON.parse(res.text).data[0]);
        });
    });
}
async function getYearData(year, holiday) {
    console.log(`[start]: ${year}`);
    const almanac = {};
    const nextHoliday = {};
    for (let m=1; m<=12; m++) {
        console.log(`===[get]: ${year}-${m}`);
        const data = await getData(year, m);
        if (data.almanac) {
            data.almanac.forEach(o=>{
                const key = moment(new Date(o.date)).format('MMDD');
                almanac[`d${key}`] = {y: o.suit, j: o.avoid};
            });
        }
        if (data.holiday) {
            !_.isArray(data.holiday) && (data.holiday = [data.holiday]);
            [].concat(...data.holiday.map(o=>o.list)).forEach(o=>{
                const _m = moment(new Date(o.date));
                const key = _m.format('MMDD');
                const _year = _m.format('YYYY');
                if (_year*1 !== year*1) {
                    nextHoliday[`d${key}`] = o.status*1;
                } else {
                    holiday[`d${key}`] = o.status*1;
                }
            });
        }
    }
    fs.writeFileSync(`../data/hl${year}.js`, `${HL_HEADER}${year} = ${JSON.stringify(almanac, null, 2)};`);
    if (Object.keys(holiday).length > 0) {
        fs.writeFileSync(`../data/wt${year}.js`, `${WT_HEADER}${year} = ${JSON.stringify(holiday, null, 2)};`);
    }
    console.log(`[end]: ${year}`);
    return nextHoliday;
}

async function main() {
    let nextHoliday = {};
    for (let y=2008; y<=2020; y++) {
        nextHoliday = await getYearData(y, nextHoliday);
    }
}

main();

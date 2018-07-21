const fs = require('fs');
const request = require('superagent');
const chalk = require('chalk');

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
            console.log(err);
            if (err) {
                showError(year, month, err.status);
            }
            resolve(JSON.parse(res.text).data[0]);
        });
    });
}
async function main() {
    const data = await getData(2016, 4);
    console.log(data);
}

main();

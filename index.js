// Write your answer here
const fs = require('fs');
const axios = require('axios');

const exceptTokens = ['token', 'undefined'];

Array.prototype.amountSum = function (transaction_type, amount) {
    var total = 0
    for (var i = 0, l = this.length; i < l; i ++) {
        if (this[i][transaction_type] == 'DEPOSIT')
            total += this[i][amount]
        else if (this[i][transaction_type] == 'WITHDRAWAL')
            total -= this[i][amount]
    }
    return total;
}

function groupArrayOfObjects(list, key) {
    return list.reduce(function(v, x) {
        (v[x[key]] = v[x[key]] || []).push(x);
        return v;
    }, {});
};

fs.readFile('./data/transactions.csv', 'utf8', function (err, data) {
    var dataArray = data.split(/\r?\n/);
    var newArray = dataArray.map(line => {
        const spt = line.split(',')
        const ret = {
            timestamp: parseInt(spt[0]),
            transaction_type: spt[1],
            token: spt[2],
            amount: parseFloat(spt[3])
        };
        return ret;
    });
    
    var groupedToken = groupArrayOfObjects(newArray, "token");
    var tokenArray = Object.entries(groupedToken).map(([key, value]) => ({key,value}));
    
    tokenArray.forEach(item => {
        if (!exceptTokens.includes(item.key)) {
            const tokenData = item.value;
            (async () => {
                try {
                    const apiUrl = "https://min-api.cryptocompare.com/data/price?fsym=" + item.key + "&tsyms=USD";
                    await axios.get(apiUrl).then(resp => {
                        const portfolio = resp.data.USD * tokenData.amountSum("transaction_type", "amount");
                        console.log(item.key, "=",  portfolio, "USD");
                    });
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    });
});




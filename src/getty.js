'use strict';
var call = function (url, args) {
    var promise = new Promise (function (resolve, reject){
        var client = new XMLHttpRequest();
        args = args || {};
        client.withCredentials = false;
        client.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
                try {
                    var json = JSON.parse(this.responseText);
                    if (this.status >= 200 && this.status < 300) {
                        resolve(json);
                    } else {
                        reject(json);
                    }
                } catch (e) {
                    console.warn("string returned isn't json.");
                    reject();
                }

            }
        });
        client.open('GET', url);
        if (args) {
            client.setRequestHeader('Content-Type', 'application/json');
            client.setRequestHeader('Api-Key', 'jzbj86qfcpc8my4eebw7g6gw');
        }
        client.send(args);
    }).catch((err) => {
        console.error(err);
    });
    return promise;
};

exports.search = (phrase) => {
    var url = `https://api.gettyimages.com/v3/search/images?phrase=${phrase}`;
    return call(url);
};

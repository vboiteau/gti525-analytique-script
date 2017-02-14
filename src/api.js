'use strict';
var base = 'https://glacial-savannah-43843.herokuapp.com';
var call = function (method, route, headers, body) {
    var promise = new Promise (function (resolve, reject){
        var client = new XMLHttpRequest();
        headers = headers || {};
        client.withCredentials = false;
        client.addEventListener('readystatechange', function () {
            if (this.readyState === 4) {
                try {
                    if (this.status >= 200 && this.status < 300) {
                        if (this.status === 204) {
                           return resolve({}); 
                        }
                        var json = JSON.parse(this.responseText);
                        resolve(json);
                    } else {
                        var json = JSON.parse(this.responseText);
                        reject(json);
                    }
                } catch (e) {
                    console.log(this);
                    console.warn("string returned isn't json.");
                    reject();
                }

            }
        });
        client.open(method, `${base}${route}`);
        client.setRequestHeader('Content-Type', 'application/json');
        client.send(JSON.stringify({data:JSON.stringify(body)}));
    }).catch((err) => {
        console.error(err);
    });
    return promise;
};

exports.pushInfo = (json) => {
    var route = '/infos';
    return call('POST', route, {}, json);
};

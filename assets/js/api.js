'use strict';
var base = 'https://glacial-savannah-43843.herokuapp.com';
var call = function (method, route, headers, body) {
    var promise = new Promise (function (resolve, reject){
        var query = '?';
        var scriptTag = document.querySelector('script[src*="analytique"]');
        var data = {};
        if (scriptTag) {
            data.campaign_id = scriptTag.getAttribute("campain");
            if (!data.campaign_id) {
                data.campaign_id = scriptTag.getAttribute("data-campain");
            }
            data.app_id = scriptTag.getAttribute('APPID');
            if (!data.app_id) {
                data.app_id = scriptTag.getAttribute('data-APPID');
            }
            query += `${encodeURIComponent('app_id')}=${encodeURIComponent(data.app_id)}&${encodeURIComponent('campaign_id')}=${encodeURIComponent(data.campaign_id)}`; 
        }
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
                    reject({});
                }
            }
        });
        client.open(method, `${base}${route}${query}`);
        client.setRequestHeader('Content-Type', 'application/json');
        client.send(JSON.stringify(body));
    }).catch((err) => {
        console.error(err);
    });
    return promise;
};

exports.get = function (collection) {
    return call('GET', `/${collection}`, {});
};

exports.post = function (url, data) {
    return call('POST',`/${url}`,{},data);
};

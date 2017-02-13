'use strict';
var call = function (url, args, cb, errCb) {
    var client = new XMLHttpRequest();
    args = args || {};
    client.withCredentials = false;
    client.addEventListener('readystatechange', function () {
        if (this.readyState === 4) {
            try {
                var json = JSON.parse(this.responseText);
                if (this.status >= 200 && this.status < 300) {
                    cb(json);
                } else {
                    errCb(json);
                }
            } catch (e) {
                console.warn("string returned isn't json.");
                errCb();
            }

        }
    });
    client.open('GET', url);
    if (args) {
        client.setRequestHeader('Content-Type', 'application/json');
        client.setRequestHeader('Api-Key', require('./../credentials').getty_key);
    }
    client.send(args);
};

exports.search = function(phrase, cb, errCb){
    var url = `https://api.gettyimages.com/v3/search/images/editorial?phrase=${phrase}&minimum_size=medium&exclude_nudity=true&fields=comp%2Cmax_dimensions&page_size=100`;
    call(url, {}, cb, function(){
        console.log("error");
    });
};

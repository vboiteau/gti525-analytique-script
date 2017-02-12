'use strict';
window.Handlebars = require ('hbsfy/runtime');
var getty = require ('./getty');
//var api = require ('./api');
var Ad = require ('./Ad');
var persisted = {};
var Ads = [];
var ANALYTIQUE = () => {
    var adManagedCounter = 1;
    function detect_ads () {
        if (imagesHaystack[0]===undefined) {
            return setTimeout(() => {
                detect_ads();
            }, 100);
        }
        var adsNotDetectedYet = document.querySelectorAll('.gti525Ad:not([ad_id])');
        for (var i = 0, len = adsNotDetectedYet.length; i < len; i++) {
            var ad = adsNotDetectedYet[i];
            ad.setAttribute("ad_id",adManagedCounter);
            defaultLoad(ad, (imgEl) => {
                Ads.push(new Ad(imgEl.parentElement));
            });
            adManagedCounter++;
        }
        ANALYTIQUE.viewPortAds();
    }
    /* Will be used for api calls */
    var scriptTag = document.querySelector('script[src*="analytique"][campain]');
    if (scriptTag) {
        persisted.campainId = scriptTag.getAttribute("campain");
    }
    var domChange = 0;
    var timeout = null;

    window.onload = () => {
        ANALYTIQUE.pageOpen = Date.now();
        detect_ads();
        document.body.addEventListener('DOMSubtreeModified', () => {
            domChange++;
            if (!timeout) {
               timeout = setTimeout(()=>{
                   timeout = null;
                   detect_ads();
               },100); 
            }
        });
    };
};

var imagesHaystack = [];

getty.search('computer').then((json) => {
    imagesHaystack = json.images;
});

function defaultLoad (adEl, cb) {
    var json = imagesHaystack[Math.floor(Math.random()*imagesHaystack.length)];
    loadImg(adEl, json, cb);
}

function loadImg (adEl, json, cb) {
    var imgEl = document.createElement('img');
    imgEl.src = json.display_sizes[0].uri;
    imgEl.onload = (e) => {
        adEl.appendChild(e.currentTarget);
        if (cb !== undefined) {
            cb(e.currentTarget);
        }
    };
}

window.onbeforeunload = () => {
    ANALYTIQUE.pageClose = Date.now();
    var duration = ANALYTIQUE.pageClose - ANALYTIQUE.pageOpen;
    persisted.duration = duration;
    persisted.ads = Ads.map((ad) => {
        ad.stopTimer();
        return ad.print();
    });
};

ANALYTIQUE.viewPortAds = () => {
    Ads.forEach((Ad) => {
        Ad.isVisible();
    });
};

window.onscroll = ANALYTIQUE.viewPortAds;

ANALYTIQUE.searchImages = (event) => {
    var input = event.currentTarget;
    input.disabled = true;
    getty.search(event.currentTarget.value).then((json) => {
        var imgContainer = document.querySelector('#gettys .container');
        imgContainer.innerHTML = '';
        var count = 0;
        json.images.forEach((img)=>{
            var el = document.createElement('img');
            el.src = img.display_sizes[0].uri;
            el.onload = (e) => {
                var imgEl = e.currentTarget;
                imgContainer.appendChild(imgEl);
                count ++;
                if (count === json.images.length) {
                    input.disabled = false;
                }
            };
        });
    });
}; 

if (window !== undefined) {
    ANALYTIQUE();    
    window.ANALYTIQUE = ANALYTIQUE;
} else {
    module.exports = ANALYTIQUE;
}

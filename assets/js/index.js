'use strict';
var api = require('./api');
var Ad = require ('./Ad');
var persisted = {};
var Ads = [];
var ANALYTIQUE = () => {
    function detect_ads () {
        var adsNotDetectedYet = document.querySelectorAll('.gti525Ad:not([ad_id])');
        var promises = [];
        for (var i = 0, len = adsNotDetectedYet.length; i < len; i++) {
            promises.push(api.get('visitor_ad'));
        }
        Promise.all(promises).then((adsDoc) => {
            for (var i = 0, len = adsDoc.length; i < len; i++) {
                var ad = adsNotDetectedYet[i];
                ad.setAttribute("ad_id", adsDoc[i].ad.id);
                ad.setAttribute("ad_url", adsDoc[i].ad.url);
                ad.setAttribute("ad_is_targeted", adsDoc[i].targeted);
                let src = adsDoc[i].ad.image;
                console.debug(src, adsDoc[i]);
                var prst = getPreset(ad);
                if(prst) {
                    src = src.replace('square', prst);
                }
                Ads.push(new Ad(ad, src));
            }
        });
        ANALYTIQUE.viewPortAds();
    }

    defineViewPortSize();

    var domChange = 0;
    var timeout = null;
    window.onload = () => {
        ANALYTIQUE.pageOpen = Date.now();
        detect_ads();
        api.post("infos",{data:"{}"});
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

function getPreset (adEl) {
    var classes = adEl.classList;
    for (var i = 0, len = classes.length; i < len; i++) {
       if (classes[i].startsWith('ad-preset-')) {
           return classes[i].substr(10);
       } 
    }
    return null;
}

function defineViewPortSize () {
    persisted.viewport = {
        width : window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
    persisted.userAgent = window.navigator.userAgent;
}

ANALYTIQUE.viewPortAds = () => {
    Ads.forEach((Ad) => {
        Ad.isVisible();
    });
};

window.onscroll = ANALYTIQUE.viewPortAds;

if (window !== undefined) {
    ANALYTIQUE();    
    window.ANALYTIQUE = ANALYTIQUE;
} else {
    module.exports = ANALYTIQUE;
}

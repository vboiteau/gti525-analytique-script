'use strict';
var getty = require ('./getty');
var api = require ('./api');
var Ad = require ('./Ad');
var persisted = {};
var Ads = [];
var ANALYTIQUE = () => {
    var interval = null;
    function detect_ads () {
        if (imagesHaystack[0]===undefined) {
            return setTimeout(() => {
                detect_ads();
            }, 100);
        }
        if (!interval) {
            setInterval(function(){
                updateInfo();
            },2000);
        }
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
                var prst = getPreset(ad);
                if(prst) {
                    prstLoad(ad, prst, (imgEl) => {
                        if (imgEl.parentElement.hasAttribute("width")) {
                            imgEl.width = imgEl.parentElement.getAttribute('width');
                        }
                        if (imgEl.parentElement.hasAttribute("height")) {
                            imgEl.height = imgEl.parentElement.getAttribute("height");
                        }
                        Ads.push(new Ad(imgEl.parentElement));
                    });
                } else if (ad.hasAttribute("width") && ad.hasAttribute("height")) {
                    cstmLoad(ad, parseInt(ad.getAttribute("width")), parseInt(ad.getAttribute("height")), (imgEl) => {
                        Ads.push(new Ad(imgEl.parentElement));
                    });
                } else {
                    defaultLoad(ad, (imgEl) => {
                        Ads.push(new Ad(imgEl.parentElement));
                    });
                }
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
    console.log(adEl);
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

var imagesHaystack = [];

getty.search('pizza', (json) => {
    imagesHaystack = json.images;
});

function defaultLoad (adEl, cb) {
    var json = imagesHaystack[Math.floor(Math.random()*imagesHaystack.length)];
    loadImg(adEl, json, cb);
}

var prstAspectRatio = {
    'square': 1/1,
    'landscape': 4/3,
    'portrait': 3/4,
    'banner': 3/1,
    'column': 1/3
};

function prstLoad (adEl, prst, cb) {
    var json = getBestForAspect(prstAspectRatio[prst]);
    loadImg(adEl, json, cb);
}

function cstmLoad(adEl, width, height, cb) {
    var json = getBestForAspect(width/height);
    loadImg(adEl, json, (imgEl)=>{
        imgEl.width = width;
        imgEl.height = height;
        cb(imgEl);
    });
}

function getBestForAspect (aspect) {
    var best = 9999;
    var json = {};
    for (var i = 0, len = imagesHaystack.length; i < len; i++) {
        var cursor = imagesHaystack[i];
        var diff = Math.abs(aspect-cursor.max_dimensions.width/cursor.max_dimensions.height);
        if (best>diff) {
            best = diff;
            for (var prop in cursor){
                if (cursor.hasOwnProperty(prop)) {
                   json[prop] = cursor[prop]; 
                }
            }
        }
    }
    return json;
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

function updateInfo () {
    ANALYTIQUE.pageClose = Date.now();
    var duration = ANALYTIQUE.pageClose - ANALYTIQUE.pageOpen;
    persisted.duration = duration;
    persisted.ads = Ads.map((ad) => {
        ad.stopTimer();
        return ad.print();
    });
    //api.pushInfo(persisted).then(function(json){
        //persisted.id = json.persisted;
    //});
}

ANALYTIQUE.viewPortAds = () => {
    console.dir(Ads);
    Ads.forEach((Ad) => {
        Ad.isVisible();
    });
};

window.onscroll = ANALYTIQUE.viewPortAds;

ANALYTIQUE.searchImages = (event) => {
    var input = event.currentTarget;
    input.disabled = true;
    getty.search(event.currentTarget.value, (json) => {
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

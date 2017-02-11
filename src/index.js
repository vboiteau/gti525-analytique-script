'use strict';
window.Handlebars = require ('hbsfy/runtime');
var getty = require ('./getty');
var ANALYTIQUE = () => {
    var adManagedCounter = 1;
    function detect_ads () {
        var adsNotDetectedYet = document.querySelectorAll('.gti525Ad:not([ad_id])');
        for (var i = 0, len = adsNotDetectedYet.length; i < len; i++) {
            var ad = adsNotDetectedYet[i];
            ad.setAttribute("ad_id",adManagedCounter);
            ad.innerHTML = `<p>${adManagedCounter} ad loaded</p>`;
            adManagedCounter++;
        }
        console.debug(`${adsNotDetectedYet.length} ads are detected but not managed yet.`);

    }
    /* Will be used for api calls */
    // var scriptTag = document.querySelector('script[src*="analytique"][campain]');
    // var campainId = scriptTag.getAttribute("campain");
    var domChange = 0;
    var timeout = null;

    getty.search('maserati').then((json) => {
        console.dir(json);
    });

    window.onload = () => {
        detect_ads();
        document.body.addEventListener('DOMSubtreeModified', () => {
            domChange++;
            if (!timeout) {
               timeout = setTimeout(()=>{
                   timeout = null;
                   detect_ads();
               },100); 
            }
            console.info(`Dom has changed ${domChange} times since page load.`);
        });
    };
};
if (window !== undefined) {
    ANALYTIQUE();    
    window.ANALYTIQUE = ANALYTIQUE;
} else {
    module.exports = ANALYTIQUE;
}

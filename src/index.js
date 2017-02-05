'use strict';
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

    };
    var scriptTag = document.querySelector('script[src*="analytique"][campain]');
    var campainId = scriptTag.getAttribute("campain");
    var domChange = 0;
    var timeout = null;
    window.onload = () => {
        detect_ads();
        document.body.addEventListener('DOMSubtreeModified', (e) => {
            domChange++;
            if (!timeout) {
               var timeout = setTimeout(()=>{
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

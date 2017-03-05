'use strict';
var api = require ('./api');
var Ad = function (dom) {
    this.id = parseInt(dom.getAttribute('ad_id'));
    this.targeted = dom.getAttribute('ad_is_targeted');
    this.url = dom.getAttribute('ad_url');
    this.viewed = false;
    this.clicks = 0;
    this.dom = dom;
    dom.onclick = this.clicked.bind(this);
};

Ad.prototype.clicked = function () {
    api.post(`ads/clicked`,{id:this.id, targeted:this.targeted}).then(()=>location.href=this.url); 
};

Ad.prototype.isVisible = function () {
    var rect = this.dom.getBoundingClientRect();

    var inH = 
        rect.left >= rect.width*-1 &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth);

    var inV = 
        rect.top >= rect.height*-1 &&
        rect.top <= (window.innerHeight||document.documentElement.clientHeight);
    
    var inVP = inH && inV;

    if (inVP && !this.viewed) {
        api.post('ads/viewed',{id:this.id, targeted: this.targeted});
        this.viewed = true;
    }
};
module.exports = Ad;

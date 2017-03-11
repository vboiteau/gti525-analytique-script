'use strict';
var api = require ('./api');
var Ad = function (dom, src) {
    this.id = parseInt(dom.getAttribute('ad_id'));
    this.targeted = dom.getAttribute('ad_is_targeted');
    this.url = dom.getAttribute('ad_url');
    let {width={}, height={}} = dom.attributes;
    this.width = width.value||null;
    this.height = height.value||null;
    this.viewed = false;
    this.clicks = 0;
    this.dom = dom;
    dom.onclick = this.clicked.bind(this);
    this.loadImg(src);
};

Ad.prototype.loadImg = function (src) {
    var img = document.createElement('img');
    img.src = src;
    img.onload = function (e) {
        this.dom.appendChild(e.currentTarget);
        if (this.width) {
            e.currentTarget.setAttribute('width', `${this.width}`);
        }
        if (this.height) {
            e.currentTarget.setAttribute('height', `${this.height}`);
        }
        console.dir(e.currentTarget);
    }.bind(this);
    img.onerror = function (err) {
        console.error(err);
    };
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

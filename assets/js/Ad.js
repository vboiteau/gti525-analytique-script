'use strict';
var api = require ('./api');
var Ad = function (dom, src, prst) {
    this.id = parseInt(dom.getAttribute('ad_id'));
    this.targeted = dom.getAttribute('ad_is_targeted');
    this.url = dom.getAttribute('ad_url');
    let {width={}, height={}} = dom.attributes;
    this.width = Number(width.value)||null;
    this.height = Number(height.value)||null;
    if (this.width && this.height && !prst) {
        src = this.changeSrcForPrst(src);
    }
    this.viewed = false;
    this.clicks = 0;
    dom.onclick = this.clicked.bind(this);
    this.loadImg(src);
    this.dom = dom;
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

Ad.prototype.changeSrcForPrst = function (src) {
    let hs = {}; 
    hs.square = this.width;
    hs.landscape = this.width*3/4;
    hs.portrait = this.width*4/3;
    hs.banner = this.width/3;
    hs.column = this.width * 3;
    let closest = 'square';
    let closestDiff = 10000000;
    for (var prop in hs){
        if (hs.hasOwnProperty(prop)) {
            console.dir(hs, Math.abs(this.height-hs[prop]), prop);
            if (Math.abs(this.height-hs[prop])<closestDiff) {
                closestDiff = Math.abs(this.height-hs[prop]);
                closest = prop;
            } 
        }
    }
    return src.replace('square', closest);
};

module.exports = Ad;

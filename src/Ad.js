'use strict';
var Ad = function (dom) {
    this.id = parseInt(dom.getAttribute('ad_id'));
    this.src = dom.querySelector('img').src;
    this.clicks = 0;
    this.isIn = null;
    this.isFull = null;
    this.timer = {
        inVP: 0,
        full: 0
    };
    this.dom = dom;
    dom.onclick = this.clicked.bind(this);
};

Ad.prototype.clicked = function () {
    this.clicks++;
};

Ad.prototype.isVisible = function () {
    var rect = this.dom.getBoundingClientRect();

    var full = 
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */;

    var inH = 
        rect.left >= rect.width*-1 &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth);

    var inV = 
        rect.top >= rect.height*-1 &&
        rect.top <= (window.innerHeight||document.documentElement.clientHeight);
    
    var inVP = inH && inV;
    
    if (!full && this.isFull) {
       this.stopFull(); 
    }

    if (!inVP && this.isIn) {
        this.stopIn();
    }

    if (inVP && !this.isIn) {
        this.startIn();
    }

    if (full && !this.isFull) {
        this.startFull();
    }
};

Ad.prototype.startIn = function () {
    this.isIn = Date.now();
};

Ad.prototype.startFull = function () {
    this.isFull = Date.now();
};

Ad.prototype.stopTimer = function () {
    if (this.isIn) {
        this.stopIn();
        if (this.isFull) {
            this.stopFull();
        }
    }
};

Ad.prototype.stopIn = function () {
    var end = Date.now();
    this.timer.inVP += end - this.isIn;
    this.isIn = null;
};

Ad.prototype.stopFull = function () {
    var end = Date.now();
    this.timer.full += end - this.isFull;
    this.isFull = null;
};


Ad.prototype.print = function () {
    return {
        id: this.id,
        src: this.src,
        clicks: this.clicks,
        timer: this.timer
    };
};

module.exports = Ad;

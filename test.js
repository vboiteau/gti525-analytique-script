'use strict';
var jshint = require ('jshint/src/cli');

function runJSHint(cb) {
    var err = new Error('');
    err.message = '';
    err.stack = '';
    var options = {
        args: ['.'],
        verbose: true
    };
    options.reporter = require ('jshint-stylish').reporter;
    jshint.run(options);
    if (err.message) {
        return cb(err);
    }
    return cb();
}

describe('jshint', function () {
    it('should pass for working directory', function(done){
        this.timeout(5000);
        runJSHint(done);
    });
});

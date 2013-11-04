var KompressorJS = require(__dirname + '/KompressorJS.js');

function KompressorJSClosure(){
    KompressorJS.apply(this, arguments) 
    this.execString = 'closure-compiler %s';
}

KompressorJSClosure.prototype   = new KompressorJS();
KompressorJSClosure.constructor = KompressorJSClosure;

module.exports = KompressorJSClosure;

var KompressorBase = require(__dirname + '/KompressorBase.js');

function KompressorJS(){

    KompressorBase.apply(this, arguments) 

    this.assetType                           = "script";
    this.assetSrcAttribute                   = "src";

    this.execString = 'uglifyjs %s';
}

KompressorJS.prototype   = new KompressorBase();
KompressorJS.constructor = KompressorJS;

module.exports = KompressorJS;

var MinifierBase = require(__dirname + '/MinifierBase.js');

function MinifierJS(){

    MinifierBase.apply(this, arguments) 

    this.assetType                           = "script";
    this.assetSrcAttribute                   = "src";

    this.execString = 'uglifyjs %s';
}

MinifierJS.prototype   = new MinifierBase();
MinifierJS.constructor = MinifierJS;

module.exports = MinifierJS;

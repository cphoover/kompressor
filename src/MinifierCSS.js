var MinifierBase = require(__dirname + '/MinifierBase.js');

function MinifierCSS(){

    MinifierBase.apply(this, arguments) 

    this.assetType                           = "link";
    this.assetSrcAttribute                   = "href";

    // we need to run this through sed to remove any (@CHARSET nonsense);
    this.execString = 'yuicompressor --type css %s | sed "s/@CHARSET [\\"|\']UTF-8[\\"|\'];//g"\r\n exit ${PIPESTATUS[0]}';
}

MinifierCSS.prototype   = new MinifierBase();
MinifierCSS.constructor = MinifierCSS;

module.exports = MinifierCSS;

var KompressorBase = require(__dirname + '/KompressorBase.js');

function KompressorCSS(){

    KompressorBase.apply(this, arguments) 

    this.assetType                           = "link";
    this.assetSrcAttribute                   = "href";

    // we need to run this through sed to remove any (@CHARSET nonsense);
    this.execString = 'yuicompressor --type css %s | sed "s/@CHARSET [\\"|\']UTF-8[\\"|\'];//g"\r\n exit ${PIPESTATUS[0]}';
}

KompressorCSS.prototype   = new KompressorBase();
KompressorCSS.constructor = KompressorCSS;

module.exports = KompressorCSS;

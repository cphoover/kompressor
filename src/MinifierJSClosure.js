var MinifierJS = require(__dirname + '/MinifierJS.js');

function MinifierJSClosure(){
    MinifierJS.apply(this, arguments) 
    this.execString = 'closure-compiler %s';
}

MinifierJSClosure.prototype   = new MinifierJS();
MinifierJSClosure.constructor = MinifierJSClosure;

module.exports = MinifierJSClosure;

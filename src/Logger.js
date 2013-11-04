    var Logger = {};
    
    Logger.off            = false;

    Logger.debug          = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'debug');  console.debug.apply(console, args); };
    Logger.error          = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'error');  console.error.apply(console, args); };
    Logger.info           = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'info' );  console.info.apply(console,  args); };
    Logger.trace          = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'trace');  console.trace.apply(console, args); };
    Logger.warn           = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'warn' );  console.warn.apply(console,  args); };
    Logger.log            = function(){ if(Logger.off) return false; var args = Logger.prependInfo(arguments, 'log'  );  console.log.apply(console,   args); };

    Logger.prependInfo    = function(_args, _type){
        _args[_args.length - 1] = new Date() +  " - " + _type + " - " + _args[_args.length - 1];
        return _args;
    };

    module.exports = Logger;

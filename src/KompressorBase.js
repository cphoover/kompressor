var _            = require('underscore'),
    fs           = require('fs'),
    Q            = require('q'),
    colors       = require('colors'),
    childProcess = require('child_process'),
    jsdom        = require('jsdom'),
    util         = require('util'),
    jsonlint     = require('jsonlint'),
    exec         = childProcess.exec,
    Logger       = require(__dirname + '/Logger.js');


Q.longStackSupport = true;


function KompressorBase(){

    this.options = {};

    this.options.PROJECT_INDEX_FILE          = null;
    this.options.WEBROOT_REPLACEMENTS        = [];
    this.options.EXCLUDED_PATTERNS           = [];
    this.options.OUTPUT                      = null;
    this.options.DRY_RUN                     = false;
    this.options.DISABLE_LOGGING             = false;
    this.options.FAIL_EXTERNAL_URLS          = true;
    this.options.CERT                        = null;
    this.options.KEY                         = null;
    this.options.CONFIG                      = null;
    this.assetType                           = null;
    this.assetSrcAttribute                   = null;
    this.assetFiles                          = [];
    this.domWindow                           = null;

    this.fileWriteStream                     = null;
}


KompressorBase.prototype.init = function(){
    try{
        var self = this;

        this.program = require('commander');

        this.program
            .version('0.1.4')
            .option('-i, --PROJECT-INDEX-FILE [file]'              , 'Specifies the html file to process')
            .option('-r, --WEBROOT-REPLACEMENTS [patterns]'        , 'Set replacements for path [kwsvc|/home/choover/kwsvc,sugar|home/choover/sugar]' , function(){ return self.multiList.apply(self, arguments ); })
            .option('-v, --EXCLUDED-PATTERNS [patterns]'           , 'Specifies files to skip based on matching regex patterns', function(){ return self.list.apply(self, arguments); })
            .option('-d, --DRY-RUN'                                , 'Specifies dry run mode (only show output do not save file)')
            .option('-l, --DISABLE-LOGGING'                        , 'Turn off logging, show only process output')
            .option('-o, --OUTPUT [file]'                          , 'Specifies output file location')
            .option('-w, --FAIL-EXTERNAL-URLS'                     , 'Returns an error if external URLS are present')
            .option('-c, --CERT [file]'                            , 'Use the specified client certificate file when getting a file with HTTPS')
            .option('-k, --KEY [file]'                             , 'Private key file name. Allows you to provide your private key in this separate file.')
            .option('-x, --CONFIG [file]'                          , 'Run with specified config file')
            .parse(process.argv);

        this.options.PROJECT_INDEX_FILE          = this.program.PROJECTINDEXFILE          || this.options.PROJECT_INDEX_FILE          ;
        this.options.WEBROOT_REPLACEMENTS        = this.program.WEBROOTREPLACEMENTS       || this.options.WEBROOT_REPLACEMENTS        ;
        this.options.EXCLUDED_PATTERNS           = this.program.EXCLUDEDPATTERNS          || this.options.EXCLUDED_PATTERNS           ;
        this.options.OUTPUT                      = this.program.OUTPUT                    || this.options.OUTPUT                      ;
        this.options.DRY_RUN                     = this.program.DRYRUN                    || this.options.DRY_RUN                     ;
        this.options.DISABLE_LOGGING             = this.program.DISABLELOGGING            || this.options.DISABLE_LOGGING             ;
        this.options.FAIL_EXTERNAL_URLS          = this.program.FAILLEXTERNALURLS         || this.options.FAIL_EXTERNAL_URLS          ;
        this.options.CERT                        = this.program.CERT                      || this.options.CERT                        ;
        this.options.KEY                         = this.program.KEY                       || this.options.KEY                         ;
        this.options.CONFIG                      = this.program.CONFIG                    || this.options.CONFIG                      ;


        if(this.options.DISABLE_LOGGING) Logger.off = true;

        self.preKompress().
        then ( function ( ){ return self.kompress.apply     ( self, arguments); }).
        then ( function ( ){ return self.postKompress.apply ( self, arguments); }).
        done ( function ( ){ console.log("done!".green); }                       );

    } catch(_e){
        _e.message = "An error occurred:\n\n" + _e.message;
        this.exitWithError(_e);
    }
};

KompressorBase.prototype.exitWithHelp = function(_msg){
        Logger.log(_msg.yellow);
        this.program.help();
};

KompressorBase.prototype.exitWithError = function(_err, _code){
    Logger.error(("ERROR: " + _err.stack.toString()).red);
    
    _code = _code || 1;

    Logger.error(("Exiting with Error Code: " + _code).red);
    process.exit(_code);
 };

KompressorBase.prototype.list = function(_list){
    return _list.split(',');
};


KompressorBase.prototype.multiList = function(_list){
    var list = this.list(_list);
    return _.map(list, function(_index){
        return _index.split('|');
    });
};

KompressorBase.prototype.readFromCurl = function(_future){
    try{

        var self = this;

        var execString = "curl -L -k " +
        ( this.options.CERT ? " --CERT " + this.options.CERT : "" ) +
        ( this.options.KEY  ? " --KEY " + this.options.KEY : "" )   +
        " " + this.options.PROJECT_INDEX_FILE;

        Logger.log('execString', execString);

        exec(execString, {"encoding" : 'utf8', "maxBuffer" : 5000*1024 }, function(_err, _stdout, _stderr){
            if(_err) self.exitWithError(_err);
            if(_stderr) process.stderr.write(_stderr);
            self.html = _stdout;
            _future.resolve();
        });

    } catch(_e) {
        _e.message = "An error occured while reading index file from disk\n\n" + _e.message;
    }
};

KompressorBase.prototype.readFromDisk = function(_future){
    try{
        Logger.log("Starting to read index file".green);
        var self = this;
        fs.readFile(this.options.PROJECT_INDEX_FILE, { "encoding": 'utf8' }, function(_err, _data){
            if(_err) throw _err;
            self.html = _data;
            _future.resolve();
        });  
    } catch(_e) {
        _e.message = "An error occured while reading index file from disk\n\n" + _e.message;
    }
};

KompressorBase.prototype.readIndexFile = function(){
    try{ 
        var future = Q.defer();
        var linkRegex =  /^(?:ftp|http|https):\/\/(?:[\w\.\-\+]+:{0,1}[\w\.\-\+]*@)?(?:[a-z0-9\-\.]+)(?::[0-9]+)?(?:\/|\/(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+)|\?(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+))?$/
        console.log('regex test', linkRegex.test(this.options.PROJECT_INDEX_FILE));
        if(linkRegex.test(this.options.PROJECT_INDEX_FILE)) this.readFromCurl(future);
        else this.readFromDisk(future);

        return future.promise;
    } catch(_e) {
        _e.message = "An error occurred while reading the index file \n\n" + _e.message;
    }
};

KompressorBase.prototype.setupDom = function(){
    try{ 
        Logger.log("Starting to setup DOM for scraping".green);
        var future = Q.defer();
        var self = this;
        jsdom.env(this.html, [], function(_err, window){
                if(_err) throw _err;
                self.domWindow = window;
                future.resolve();
        });

        return future.promise;

    } catch (_e) {
        _e.message = "An error occured while setting up the Dom \n\n" + _e.message;
        this.exitWithError(_e);
    }
};

KompressorBase.prototype.scrapeAssets = function(){
    try{

        Logger.log("Starting to Scrape Assets".green);
        var self = this;
        var future = Q.defer();
        var document = self.domWindow.document; 
        var assets = document.getElementsByTagName(self.assetType);
        Array.prototype.forEach.call(assets, function(_asset){
            var assetSrc = _asset.getAttribute(self.assetSrcAttribute);
            //if an excluded pattern is found return false;
            for(var i=0; i<self.options.EXCLUDED_PATTERNS.length; i++){
                 if(new RegExp(self.options.EXCLUDED_PATTERNS[i], 'g').test(assetSrc)) return false;
            }
            self.assetFiles.push(assetSrc);
        });
        future.resolve();
        return future.promise;
    } catch(_e){
        _e.message = "An error occurred while scraping assets\n\n" + _e.message;
        this.exitWithError(_e);
    }
};

KompressorBase.prototype.setupWriteStream = function(){
    try{
        var future = Q.defer();
        if(!this.options.DRY_RUN && this.options.OUTPUT){
            this.fileWriteStream = fs.createWriteStream(this.options.OUTPUT, {"encoding" : "UTF8"});
            this.fileWriteStream.once('open', function(){
                future.resolve();
            });
        } else{
            future.resolve();
        }
        return future.promise;
    } catch(_e){
        _e.message = "An error occurred while setting up the file write stream for output\n\n" + _e.message;
        this.exitWithError(_e);
    }
};

KompressorBase.prototype.preKompress = function(){ 

    var future = Q.defer();
    //read index file
    var self = this;

    self.setupConfig()
    .then( function( ){ return self.checkConfig.apply      ( self, arguments);  })
    .then( function( ){ return self.readIndexFile.apply    ( self, arguments);  })
    .then( function( ){ return self.setupDom.apply         ( self, arguments); })
    .then( function( ){ return self.scrapeAssets.apply     ( self, arguments); })
    .then( function( ){ return self.setupWriteStream.apply ( self, arguments); })
    .done( function( ){ future.resolve(); });
    
    return future.promise;
};

KompressorBase.prototype.kompress = function(_file, _future){
    try{
        var self = this;
        //initialize file to zero if it undefined 
        _file   = _file   || 0;  
        //initialize future to a deffered object if is undefined
        _future = _future || Q.defer();

        //if the file doesn't exists in the assetFiles array resolve the future
        if("string" !== typeof this.assetFiles[_file]){
             if(this.fileWriteStream) this.fileWriteStream.end();
             _future.resolve();
            return false;
        }

        var assetFile = this.assetFiles[_file];
    

        for(var i = 0; i < self.options.WEBROOT_REPLACEMENTS.length; i++) {
            var replacementPattern = new RegExp(self.options.WEBROOT_REPLACEMENTS[i][0]); 
            assetFile = assetFile.replace(replacementPattern, self.options.WEBROOT_REPLACEMENTS[i][1]);
        }
        Logger.log(("Starting to process file: " + assetFile).green);

        //execute the execString interpolating the filename 
        exec(util.format(self.execString, assetFile), {"encoding" : 'utf8', "maxBuffer" : 5000*1024 }, function(_err, _stdout, _stderr){
            //if any type of error happens exit with the error

            if(_err) self.exitWithError(_err);

            if(_stderr) process.stderr.write(_stderr);
    
            //if it's not a dry run write to the file write stream
            if(self.fileWriteStream && !self.options.DRY_RUN) self.fileWriteStream.write(_stdout);
            
            //write the output to stdout stream
            process.stdout.write(_stdout + (!self.options.DISABLE_LOGGING ? "\n\n" : ""));  

            //recurse with next index of array
            self.kompress((_file + 1), _future);
        });

        //if on the initial run of function return the promise
        if(_file === 0) return _future.promise;

    } catch(_e){
        _e.message = "Something went wrong during Kompression step\n\n" + _e.message;
        this.exitWithError(_e);
    }

};


KompressorBase.prototype.postKompress = function(){
    var future = Q.defer();
    future.resolve();
    return future.promise;
};


KompressorBase.prototype.checkConfig = function(){
    
    Logger.log("Starting to check Configuration".green);

    var future = Q.defer();

    if("string" !== typeof this.options.PROJECT_INDEX_FILE) {
        this.exitWithHelp('Please specify a Project index file');
        process.exit(1);
    }    

    if(!this.options.DRY_RUN && !this.options.OUTPUT){
        this.exitWithHelp('Please specify an output file.');
        process.exit(1);
    }
    
    var WEBROOT_REPLACEMENTS = JSON.stringify(this.options.WEBROOT_REPLACEMENTS);
    var EXCLUDED_PATTERNS    = JSON.stringify(this.options.EXCLUDED_PATTERNS);

    Logger.log(('PROJECT_INDEX_FILE: '          + this.options.PROJECT_INDEX_FILE          ) .yellow ) ;
    Logger.log(('WEBROOT_REPLACEMENTS: '        + WEBROOT_REPLACEMENTS                     ) .yellow ) ;
    Logger.log(('EXCLUDED_PATTERNS: '           + EXCLUDED_PATTERNS                        ) .yellow ) ;
    Logger.log(('OUTPUT: '                      + this.options.OUTPUT                      ) .yellow ) ;
    Logger.log(('DRY_RUN: '                     + this.options.DRY_RUN                     ) .yellow ) ;
    Logger.log(('FAIL_EXTERNAL_URLS: '          + this.options.FAIL_EXTERNAL_URLS          ) .yellow ) ;
    Logger.log(('CONFIG: '                      + this.options.CONFIG                      ) .yellow ) ;
    Logger.log(('CERT: '                        + this.options.CERT                        ) .yellow ) ;
    Logger.log(('KEY: '                         + this.options.KEY                         ) .yellow ) ;
       
    future.resolve();

    return future.promse;
};

KompressorBase.prototype.setupConfig = function(){
    try {
        var future = Q.defer();
        var self = this;
        if(this.options.CONFIG){
            fs.readFile(this.options.CONFIG,{encoding: "UTF8"},  function(_err, _data){
                if(_err) throw _err;
                try{
                    var config = jsonlint.parse(_data);
                    self.options = _.extend(self.options, config);    
                    future.resolve();
                } catch(_e){
                    _e.message  = "An error occurred when parsing the config JSON\n\n" + _e.message;
                    self.exitWithError(_e);
                }
            });
        } else{
            future.resolve();
        }
        return future.promise;
    } catch (_e) {
        _e.message = "An error occurred while setting up the config\n\n" + _e.message;
        this.exitWithError(_e);
    }
};

module.exports = KompressorBase;

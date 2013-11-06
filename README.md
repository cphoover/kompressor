# Kompressor

## What it is?
Kompressor is a command line utility for compressing and concatenating static JS & CSS. Kompressor uses the jsdom library to scrape a specified index page scripts and stylesheets. It then uses a specified program to minify (kompress) each file and pipe the output into a specified output file.  By default kompressor uses Yahoo's yuicompressor for css minification, and uglifyjs for javascript minification. Extending kompressor to use another program is super simple, and simply requires extending one of the Kompressor classes and changing the exec string ([see below](#extending-kompressor)).

## Installation

with npm:

    npm install kompressor

or with github:

     ./preinstall.sh
     git clone https://github.com/cphoover/minifier.git
     ./postinstall.sh
     
## Options

    -h, --help                             output usage information
    -V, --version                          output the version number
    -i, --PROJECT-INDEX-FILE [file]        Specifies the html file to process
    -r, --WEBROOT-REPLACEMENTS [patterns]  Set replacements for path [kwsvc|/home/choover/kwsvc,sugar|home/choover/sugar]
    -v, --EXCLUDED-PATTERNS [patterns]     Specifies files to skip based on matching regex patterns
    -d, --DRY-RUN                          Specifies dry run mode (only show output do not save file)
    -l, --DISABLE-LOGGING                  Turn off logging, show only process output
    -o, --OUTPUT [file]                    Specifies output file location
    -w, --FAIL-EXTERNAL-URLS               Returns an error if external URLS are present
    -c, --CERT [file]                      Use the specified client certificate file when getting a file with HTTPS
    -k, --KEY [file]                       Private key file name. Allows you to provide your private key in this separate file.
    -x, --CONFIG [file]                    Run with specified config file

## Caveats
Right now Kompressor only works by reading the specified index file from the filesystem. This works well for applications with a static JS frontend that communicates with an API service, it does not work as well with dynamically created pages.  There are plans in the immediate future to change this, and add support for http/https scraping of the index file.

if you are using imports in your css it will break the css minifier :grimacing:

Also and this is an **IMPORTANT NOTE** css assets such as fonts and background images must be absolute to the webroot and not relative to the stylesheet, otherwise minification will break your links.

## Extending Kompressor
In the following example you can see how easy it was to extend kompressor to use google's closure compiler instead of our default js compiler uglify.js. It was as simple as changing the execString property to the executable string that compiles each file. %s being the file which is interpolated within the string.
```js

    /* file: src/KompressorJSClosure.js */
    
    var KompressorJS = require(__dirname + '/KompressorJS.js');
       
    function KompressorJSClosure(){
        KompressorJS.apply(this, arguments)
        this.execString = 'closure-compiler %s';
    }

    KompressorJSClosure.prototype   = new KompressorJS();
    KompressorJSClosure.constructor = KompressorJSClosure;

    module.exports = KompressorJSClosure;
    
```

Now we have our class, all we have to do is create a new "executable" inside of the "bin" directory which utilizes this class.

```js
    #!/usr/local/bin/node
    
    /* file: bin/kompress-js-closure */
    var Kompressor = require(__dirname + "/../src/KompressorJSClosure.js");
    new Kompressor().init();    
```    

And that's it! Pretty simple. For more info on how to extend Kompressor reference the documentation(coming soon...)    

## Todo
* Allow scraping from webserver (not only fileread)
* Add support for SSL
* Add tests

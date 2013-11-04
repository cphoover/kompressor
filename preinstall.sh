green='\033[0;32m'
red='\033[0;31m'
endColor='\033[0m'

if type -P Uglifyjs&>/dev/null; then
    echo -e  "${green}UglifyJS is installed${endColor}"
else
    echo -e  "${red}WARNING: UglifyJS is NOT INSTALLED${endColor}"
fi

if type -P closure-compiler &>/dev/null; then
    echo -e  "${green}Closure-Compiler is installed${endColor}"
else
    echo -e  "${green}WARNING: Closure-Compiler is NOT INSTALLED${endColor}"
fi

if type -P which yuicompressor &>/dev/null; then
    echo -e  "${green}YuiCompressor is installed${endColor}"
else
    echo -e  "${red}WARNING: YuiCompressor is NOT INSTALLED${endColor}"
fi

function remove_first_line(){
    FILE=$1
    mv $FILE $FILE.tmp
    tail -n +2 $FILE.tmp > $1
    rm $FILE.tmp 
}

function add_shebang(){
    APP=$1
    FILE=$2
    echo '#!'"$(which $APP)\n$(cat ./$FILE)" > $FILE
}

remove_first_line ./bin/minify-js-closure
remove_first_line ./bin/minify-js
remove_first_line ./bin/minify-css

add_shebang node ./bin/minify-js-closure
add_shebang node ./bin/minify-js
add_shebang node ./bin/minify-css

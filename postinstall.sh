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

remove_first_line ./bin/kompress-js-closure
remove_first_line ./bin/kompress-js
remove_first_line ./bin/kompress-css

add_shebang node ./bin/kompress-js-closure
add_shebang node ./bin/kompress-js
add_shebang node ./bin/kompress-css

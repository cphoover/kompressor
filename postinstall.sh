echo -e  -e '#!'"$(which node)\n$(cat ./minify-js-closure)" > ./minify-js-closure
echo -e  -e '#!'"$(which node)\n$(cat ./minify-js)"         > ./minify-js
echo -e  -e '#!'"$(which node)\n$(cat ./minify-css)"        > ./minify-css

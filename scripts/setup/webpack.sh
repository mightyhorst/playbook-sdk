clear 
printf "\n\n🥝 🥝 🥝 🥝 🥝 🥝\n"
printf "🦄 --- You are currently in this folder: \n🦄 ---> $(pwd) \n\n"
printf "🍊 --- What is the path to the root folder that ./src/components? \n🍊 ---> e.g. ./frontend"
printf "\n🥝 🥝 🥝 🥝 🥝 🥝\n\n"
varRoot=./
read varRoot
echo Opening the directory: $varRoot  

#
# @description change to dir 
# @tutorial https://stackoverflow.com/questions/3349105/how-to-set-current-working-directory-to-the-directory-of-the-script 
#
cd $varRoot
ls 
pwd 


#
# @name Webpack common config 
# @description Create common config 
#
wget https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/705f6509b47b694650df90a0e5d80808d5544419/webpack.common.js --output-document=webpack.common.js




#
# @name Webpack dev config 
# @description Create common config 
#
wget https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/705f6509b47b694650df90a0e5d80808d5544419/webpack.dev.js --output-document=webpack.dev.js


#
# @name Webpack prod config 
# @description Create common config 
#
wget https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/705f6509b47b694650df90a0e5d80808d5544419/webpack.prod.js --output-document=webpack.prod.js


#
# @name Webpack 
# @description Add webpack  
#
# npm install webpack-dev-server -g
# npm install webpack-cli -g
yarn add -D babel-polyfill
yarn add -D webpack-dev-server 
yarn add -D webpack 
yarn add -D webpack-cli
yarn add -D webpack-merge


#
# @name Plugins 
# @description Add webpack plugins 
#
yarn add -D awesome-typescript-loader 
yarn add -D html-webpack-plugin 
yarn add -D copy-webpack-plugin
yarn add -D source-map-loader
yarn add -D style-loader css-loader


#
# @name Package.json 
# @description Add build to package.json scripts  
# @requires json - cli tool 
#

# npm install -g json
json -I -f package.json -e 'this.scripts["build:dev"]="webpack --config webpack.dev.js" '
json -I -f package.json -e 'this.scripts["build:prod"]="webpack --config webpack.prod.js" '
json -I -f package.json -e 'this.scripts["start:dev"]="webpack-dev-server --open --hot --config webpack.dev.js" '



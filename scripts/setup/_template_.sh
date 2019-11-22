#!/bin/bash 
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
# @name Example Webpack Loader 
# @description Install some example webpack loaders
# @param {string} exampleLoaderUrl - url to download from
# @param {string} exampleLoaderFilename - name of the file 
#
url=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/e0d7357dac0627750afe4b563bed67c801bca3fb/webpack.example.loader.js
downloadedFilename=webpack.example.loader.js
localRename=example-loader.js

wget $url --output-document=$downloadedFilename
mv $downloadedFilename .webpack/loaders/$localRename


#
# @name Json manipulation
# @description Update the package json 
#
npm i -g json 
json -I -f package.json -e 'this.husky={}'
json -I -f package.json -e 'this.husky.hooks={}'
json -I -f package.json -e 'this.husky.hooks["pre-commit"]="yarn test"' 
json -I -f package.json -e 'this.husky.hooks["pre-push"]="yarn test"' 
json -I -f package.json -e 'this.husky.hooks["prepare-commit-msg"]="exec < /dev/tty && git cz --hook || true"' 



#
# @name 
# @description 
#



#
# @name 
# @description 
#



#
# @name 
# @description 
#



#
# @name 
# @description 
#



#
# @name 
# @description 
#

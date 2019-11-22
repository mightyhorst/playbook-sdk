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
# @name Install 
# @description Install typescript
#
yarn add -D typescript 
yarn add -D ts-loader
yarn add -D source-map-loader 


#
# @name React 
# @description Install React
#
yarn add react react-dom 
yarn add -D @types/react @types/react-dom
yarn add prop-types
yarn add -D @types/prop-types

#
# @name Folders 
# @description create folder structure 
#
mkdir -p src/components
mkdir -p src/services
mkdir -p src/models/errors
mkdir -p src/config 
mkdir -p src/services
mkdir -p src/utils


#
# @name TS Config
# @description TS Config for React and Webpack 
#
wget https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/5ac250b96e1993e09fd4ecc980024ab4e2a340d4/tsconfig.json --output-document=tsconfig.json

#
# @name html
# @description index.html file 
#
htmlUrl=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/fb4f9dcc502e2e576098ec1161d12dd76e686918/react.index.html
htmlName=index.html 
wget $htmlUrl --output-document=$htmlName
mv index.html ./src/index.html


#
# @name root tsx 
# @description index.tsx file 
#
tsxUrl=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/fb4f9dcc502e2e576098ec1161d12dd76e686918/react.index.tsx
tsxName=index.tsx 
wget $tsxUrl --output-document=$tsxName
mv index.tsx ./src/index.tsx

#
# @name CSS
# @description index.css file
#
cssUrl=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/fb4f9dcc502e2e576098ec1161d12dd76e686918/react.index.css
cssName=index.css
wget $cssUrl --output-document=$cssName
mv index.css ./src/index.css

#
# @name  
# @description  
#


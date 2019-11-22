#!/bin/bash 

# ##########################
#
# @name Install deps
# Install cli tools needed 
# @param json - needed to add to CRUD the package.json from cli
# @parm surge - needed to push storybook docs online
#
npm install -g json surge

# ##########################
#
# @name varRoot 
# @description change to dir 
# @param {string} varRoot - root directory 
#
clear 
printf "\n\n🥝 🥝 🥝 🥝 🥝 🥝\n"
printf "🦄 --- You are currently in this folder: \n🦄 ---> $(pwd) \n\n"
printf "🍊 --- What is the path to the root folder that ./src/components? \n🍊 ---> e.g. ./frontend"
printf "\n🥝 🥝 🥝 🥝 🥝 🥝\n\n"
varRoot=./
read varRoot
echo Opening the directory: $varRoot 


# ##########################
#
# @description change to dir 
#
cd $varRoot
pwd 
mkdir .storybook
ls 


# ##########################
#
# @name Storybook 
# @description install storybook for react
#
yarn add -D babel-loader
yarn add -D @storybook/react



# ##########################
#
# @name Typescript
# @description install storybook for Typescript 
#
yarn add -D @types/storybook__react
yarn add -D awesome-typescript-loader
yarn add -D react-docgen-typescript-loader


# ##########################
#
# @name story config
# @description create config to find all stories 
#
wget https://gist.githubusercontent.com/mitni455/bed361dc969848bced2a37ef50b25acc/raw/f858f15ee1515c49a5d1144b92079f67856e36e3/.storybook.config.js --output-document=storybook.config.js
mv storybook.config.js .storybook/config.js 

wget https://gist.githubusercontent.com/mitni455/bed361dc969848bced2a37ef50b25acc/raw/296a0165e8a3233f8532fb8aa8af8b7d21619da9/.storybook.webpack.config.js --output-document=storybook.webpack.config.js
mv storybook.webpack.config.js .storybook/webpack.config.js


# ##########################
#
# @name story add ons
# @description addons for actions, knobs and notes 
#
yarn add -D @storybook/addon-actions
yarn add -D @storybook/addon-info
yarn add -D @storybook/addon-knobs
yarn add -D @storybook/addon-links
yarn add -D @storybook/addon-notes
yarn add -D @storybook/addons

wget https://gist.githubusercontent.com/mitni455/bed361dc969848bced2a37ef50b25acc/raw/3b9f0b2b24721a05aec100386a6c747bf68cc784/.storybook.addons.js --output-document=storybook.addons.js
mv storybook.addons.js .storybook/addons.js 

# ##########################
#
# @name package.json
# @description add run and build to scripts of npm package 
# @requires json 
# @returns 
#       scripts: {
#           "story": "start-storybook -p 6006",
#           "story:build": "build-storybook -c .storybook -o docs/storybook",
#           "story:publish": "yarn run story:build && cd docs/storybook && surge projectname-story.surge.sh"
#       }
#
mkdir -p docs/storybook
json -I -f package.json -e 'this.scripts.story="start-storybook -p 6006"' 
json -I -f package.json -e 'this.scripts["story:build"]="build-storybook -c .storybook -o docs/storybook"' 
json -I -f package.json -e 'this.scripts["story:publish"]="yarn run story:build && cd docs/storybook && surge projectname-story.surge.sh"' 



# ##########################
#
# @name Examples
# @description Install example storybooks
#
mkdir -p src/example-stories
cd src/example-stories 
wget https://gist.githubusercontent.com/mitni455/bed361dc969848bced2a37ef50b25acc/raw/3e39c60e54ba313ad5d78cb4a732cb33e590a551/example.actions.stories.tsx --output-document=example.actions.stories.tsx
wget https://gist.githubusercontent.com/mitni455/bed361dc969848bced2a37ef50b25acc/raw/3e39c60e54ba313ad5d78cb4a732cb33e590a551/example.knobs.stories.tsx --output-document=example.knobs.stories.tsx


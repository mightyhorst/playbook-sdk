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
# @name Install CLI
# @description intall commitzen 
#
npm install commitizen -g



#
# @name commitzen adapter 
# @description  initialize your project to use the cz-conventional-changelog adapter with yarn 
#
#   The above command does three things for you.
#   1. Installs the cz-conventional-changelog adapter npm module
#   2. Saves it to package.json's dependencies or devDependencies
#   3. Adds the config.commitizen key to the root of your package.json as shown here:
#          ```
#          "config": {
#              "commitizen": {
#              "path": "cz-conventional-changelog"
#              }
#          }
#          ````
commitizen init cz-conventional-changelog --yarn --dev --exact


#
# @name Badge 
# @description Add to Readme 
#
CZ_BADGE="[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)"
cat <(echo "$CZ_BADGE") readme.md > new.readme.md
mv new.readme.md readme.md 


#
# @name Husky
# @description Install Husky 
#
yarn add -D husky
json -I -f package.json -e 'this.husky={}'
json -I -f package.json -e 'this.husky.hooks={}'
json -I -f package.json -e 'this.husky.hooks["pre-commit"]="yarn test"' 
json -I -f package.json -e 'this.husky.hooks["pre-push"]="yarn test"' 
json -I -f package.json -e 'this.husky.hooks["prepare-commit-msg"]="exec < /dev/tty && git cz --hook || true"' 

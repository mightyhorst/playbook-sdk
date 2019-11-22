clear 
printf "\n\n🥝 🥝 🥝 🥝 🥝 🥝\n"
printf "🦄 --- You are currently in this folder: \n🦄 ---> $(pwd) \n\n"
printf "🍊 --- What is the path to the root folder that ./src/components? \n🍊 ---> e.g. ./frontend"
printf "\n🥝 🥝 🥝 🥝 🥝 🥝\n\n"
varRoot=./
read varRoot
echo Opening the directory: $varRoot 

# #
# # @description change to dir 
# # @tutorial https://stackoverflow.com/questions/3349105/how-to-set-current-working-directory-to-the-directory-of-the-script 
# #
cd $varRoot
ls 
pwd 

#
# @description Installing pre-requisites
#
npm install -g json

#
# @description Initialise package.json if it doesn't exist already. This will require the user
#              to fill in the wizard associated with yarn init
#
PACKAGE_JSON_FILE='./package.json'
if ! [ -f $PACKAGE_JSON_FILE ]
then
    yarn init
fi

#
# @description Install the test runner which is universal across microservice types
#
yarn add -D jest
yarn add -D ts-jest
yarn add -D @types/jest

# @description Check if the package.json we are updating is for:
#              - React App
#                   - react-testing-library
#                   - jest-cucumber
#                   - jest.config.js
#              - NestJS
#                   - @nestjs/testing library
#                   - package.json['jest'] config  (Probably not needed if we are using nest generate)
#
printf "\nIs this for a react app? [y/n] \n"
varIsReactApp='n'
read varIsReactApp
if [ $varIsReactApp == 'y' ]
then
    yarn add -D @testing-library/react
    yarn add -D @testing-library/jest-dom
    yarn add -D jest-cucumber

    wget https://gist.githubusercontent.com/Domnom/cb6090e7f0aae8a964a4bf86a0fa7f93/raw/acbbb324a683408f5d43d5966bd7a0a20b3d9a2c/jest.config.js --output-document=jest.config.js
else
    printf "\nIs this a NestJS app? [y/n] \n"
    varIsNestJSApp='n'
    read varIsNestJSApp

    if [ $varIsNestJSApp == 'y' ]
    then
        yarn add -D @nestjs/testing

        json -I -f package.json -e 'this.jest={
                                        moduleFileExtensions: [
                                            "js",
                                            "json",
                                            "ts"
                                        ],
                                        "rootDir": "src",
                                        "testRegex": ".spec.ts$",
                                        "transform": {
                                            "^.+\\.(t|j)s$": "ts-jest"
                                        },
                                        "coverageDirectory": "../coverage",
                                        "testEnvironment": "node"
                                    }'
    fi
fi
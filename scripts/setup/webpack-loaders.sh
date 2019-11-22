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
# @name Loaders
# @description Install some example webpack loaders
#
mkdir -p .webpack/loaders 


#
# @name Example Webpack Loader 
# @description Install some example webpack loaders
# @param {string} exampleLoaderUrl - url to download from
# @param {string} exampleLoaderFilename - name of the file 
#
exampleLoaderUrl=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/e0d7357dac0627750afe4b563bed67c801bca3fb/webpack.example.loader.js
exampleLoaderFilename=webpack.example.loader.js
renameExampleLoaderFilename=example-loader.js

wget $exampleLoaderUrl --output-document=$exampleLoaderFilename
mv $exampleLoaderFilename .webpack/loaders/$renameExampleLoaderFilename


#
# @name ResolveLoaders
# @description Tell webpack where to look for loaders. By default it looks in `node_modules` but we want it to also look in `.webpack/loaders`
#

# @todo - add this to webpack config 
    #    /** 
    #     * @name ResolveLoaders
    #     * @description Tell webpack where to look for loaders. By default it looks in `node_modules` but we want it to also look in `.webpack/loaders`
    #     **/
    #    resolveLoader: {
    #       modules: ['node_modules', path.resolve(__dirname,'.webpack/loaders')]
    #    }, 



# @todo - add to `rules`

    #    /** 
    #     * @name Typescript
    #     * @description TS and TSX loader 
    #     **/
    #    {
    #        test : /\.tsx?$/,
    #        use: [
    #            'awesome-typescript-loader', 
    #            'example-loader' /** example webpack loader from `.webpack/loaders/example-loader.js` */
    #        ]
    #    },    


#
# @name options
# @description Loader utils to use options with module.rules
#
yarn add -D loader-utils
# @todo - 
#    use: [
#        {
#            exampleLoader: 'example-loader', /** example webpack loader from `.webpack/loaders/example-loader.js` */
#            /** @requires yarn add -D loader-utils */
#            options: {
#                name: 'Some name'
#            }
#        }
#    ]
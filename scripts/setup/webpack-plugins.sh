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
mkdir -p .webpack/plugins


#
# @name Example Webpack Plugin 
# @description Install some example webpack Plugins
# @param {string} examplePluginUrl - url to download from
# @param {string} examplePluginFilename - name of the file 
#
examplePluginUrl=https://gist.githubusercontent.com/mitni455/32958a1df2a2e5c1e5dcdbde5bab0136/raw/58f5d352af1abdf4d381d8ff741c0865872fbab9/webpack.example.plugin.js
examplePluginFilename=webpack.example.Plugin.js
renameExamplePluginFilename=FileListPlugin

wget $examplePluginUrl --output-document=$examplePluginFilename
mv $examplePluginFilename .webpack/plugins/$renameExamplePluginFilename




# @todo - add to Plugins 

    # const FileListPlugin = require('./.webpack/plugins/FileListPlugin');

    # plugins: {
    #     /** 
    #     * @name FileListPlugin 
    #     * @namespace plugins 
    #     * @description Example plugin 
    #     **/
    #     new FileListPlugin({options: true})   

    # }

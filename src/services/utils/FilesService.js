const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
const path = require('path');
const rimraf = require("rimraf");


/**
 * @requires Models 
 */
const FileModel = require('../../models/FileModel');
const FolderModel = require('../../models/FolderModel');

/** 
 * Look ma, it's cp -R. 
 * @param {string} src The path to the thing to copy. 
 * @param {string} dest The path to the new copy. 
 * */ 
var copyRecursiveSync = (src, dest) => { 
    var exists = fs.existsSync(src); 
    var stats = exists && fs.statSync(src); 
    
    var isDirectory = exists && stats.isDirectory(); 
    
    if (exists && isDirectory) { 
        fs.mkdirSync(dest); 
        fs.readdirSync(src).forEach(childItemName => { 
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName)); 
        }); 
    } 
    else { 
        fs.copyFileSync(src, dest); // UPDATE FROM: fs.linkSync(src, dest); 
    } 
};

/**
 * File Service is a helper wrapper to extend fs and glob 
 *
 * @class FileService
 */
class FileService{

    /**
     * Copy folder from source path to destination 
     *
     * @param {FolderModel} source - path to the folder
     * @param {string} destination - path to the folder
     */
    copyFolder(sourceFolderModel, destination) {
        rimraf.sync(destination);
        copyRecursiveSync(sourceFolderModel.path, destination);
        return new FolderModel(destination);
    }


    /**
     * Returns the file paths and contents of files matching a pattern like '*.playbook.js'
     * 
     * @param {string} fromFolder - path to start search from 
     * @param {string} filePattern - e.g. "*.playbook.js"
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @memberof Controller
     * @usage FileService.findAll(process.cwd(), '*.playbook.js')
     */
    findAll(fromFolder, filePattern){

        /** 
         * @step set defaults and validate 
         */
        fromFolder = fromFolder || process.cwd(); 
        filePattern = filePattern || '*.playbook.js';

        /** 
         * @step find all paths 
         * @requires glob 
         */
        // var filePaths = glob.sync(fromFolder, filePattern, {});
            // filePaths = filePaths.concat( glob.sync(fromFolder + `/**/${filePattern}`, {}) );
        const filePaths = glob.sync(fromFolder + `/**/${filePattern}`, {}) ;

        /** 
         * @step map file paths to file model so includes contents too 
         * @description this is easier to deal with files this way 
         */
        const fileModels = filePaths.map(filePath => {
            return new FileModel(filePath);
        });

        return fileModels;
    }

    /**
     * Returns the file paths and contents of files matching a pattern like '*.playbook.js'
     * 
     * @param {string} filePattern - e.g. "*.playbook.js"
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @returns {string} playbookFiles[0].path - path to the file 
     * @returns {string} playbookFiles[0].contents - contents of the file 
     * @memberof Controller
     * @usage FileService.findAll('*.playbook.js')
     */
    findAllCwd(filePattern){
        return this.findAll(process.cwd() , filePattern);
    }

    /**
     * Create Folder helper
     *
     * @param {*} folderPath
     * @param {*} folderName
     * @returns {FolderModel} folderModel
     * @memberof FileService
     */
    createFolder(folderPath, folderName)
    {
        const fullFolderPath = path.join(folderPath, folderName);
        try
        {
            fs.mkdirSync(fullFolderPath, { recursive : true });
            return new FolderModel(fullFolderPath);
        }
        catch(err)
        {
            console.log(`Error is writing the file: ${chalk.red('err.message')}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }
    }

    /**
     * Create File helper 
     *
     * @param {string} filePath - path to the folder 
     * @param {string} fileName - name of the file with the extension
     * @param {string} fileContents - contents to save into the file 
     * @returns {FileModel} fileModel - file model is a nice wrapper for path and the contents 
     * @memberof FileService
     */
    createFile(filePath, fileName, fileContents){
        const fullFilePath = path.join(filePath, fileName);
        try{
            fs.writeFileSync(fullFilePath, fileContents, {encoding:'utf8'});
            return new FileModel(fullFilePath, fileContents);
        }catch(err){
            console.log(`Error is writing the file: ${chalk.red('err.message')}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }

    }

    /**
     * @todo implement 
     *
     * @returns
     * @memberof FileService
     */
    mvFile(){
        return 'todo'
    }
    mvFolder(){

    }
    /**
     * @todo implement append to file 
     *
     * @memberof FileService
     */
    appendToFile(){
        
    }
    prependToFile(){
        
    }

    /**
     * @todo implement append to file 
     *
     * @memberof FileService
     */
    ls(folderPath){

        const folderName = folderPath.split('/').pop();
        console.log( chalk.blue('List files and folders from: ')+chalk.bgMagenta.bold(folderName) + chalk.bgBlue.white(folderPath) );

        fs.readdirSync(folderPath).forEach(file => {
            console.log('• '+fileModel.path.replace(folderPath,''));
        });
    }
    lsAll(folderPath, txtOptionalMsg){

        txtOptionalMsg = txtOptionalMsg ? txtOptionalMsg : 'List ALL files and folders from: '; 
        const folderName = folderPath.split('/').pop();
        console.log('\n'+ chalk.green(txtOptionalMsg)+chalk.bgMagenta.bold(folderName) +'\n'+ chalk.blue(folderPath));

        const fileModels = this.findAll(folderPath, '*');
        fileModels.forEach(fileModel => {
            console.log('• '+fileModel.path.replace(folderPath,''));
        })
    }

}

module.exports = new FileService();
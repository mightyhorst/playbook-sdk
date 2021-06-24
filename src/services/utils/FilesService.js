const fs = require('fs');
const os = require('os');
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

    constructor()
    {
        this.homeDir = path.resolve(os.homedir(), '.playbook');
        const hasPlaybookFolder = this.checkFolderExists(this.homeDir);
        if(!hasPlaybookFolder){
            console.warn(chalk.cyan('There is no .playbook folder, so I\'m going to create one'));
            this.createPlaybookFolder();
        }
    }

    /**
     * Create a .playbook folder if it doesn't exist
     */
    createPlaybookFolder(){
        try{
            this.createFolder(os.homedir(), '.playbook');
        }
        catch(err){
            console.error(chalk.red('I am very sorry, but I could NOT create a .playbook folder in the home directory of ')+this.homeDir);
            console.error(chalk.gray('Error logs:\n'+err.message));
        }
    }

    /**
     * Check the folder exists
     * @param {string} fullPathToFolder - full path to the folder to check
     * @returns 
     */
    checkFolderExists(fullPathToFolder){
        return fs.existsSync(fullPathToFolder) && fs.lstatSync(fullPathToFolder).isDirectory();
    }
    /**
     * Check the file exists
     * @param {string} fullPathToFile - full path to the file to check
     * @returns 
     */
    checkFileExists(fullPathToFile){
        return fs.existsSync(fullPathToFile) && fs.lstatSync(fullPathToFile).isFile();
    }

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
        const filePaths = glob.sync(fromFolder + `/**/${filePattern}`, {});

        /** 
         * @step map file paths to file model so includes contents too 
         * @description this is easier to deal with files this way 
         */
        const fileModels = filePaths.map(filePath => {
            /**
             * @step add cwd to the path 
             * @desc this will complain sometimes so it's safer with the full path
             */
            filePath = path.join(process.cwd(), filePath); 
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
        const fullFolderPath = !!folderName ? path.join(folderPath, folderName): folderPath;
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
     *
     *
     * @param {string} folderPath - path to where this folder is installed
     * @param {string} folderName - name of the folder
     * @returns {FolderModel} folderModel - folder model 
     * @memberof FileService
     */
    createFolder(folderPath, folderName){
        const fullFilePath = path.join(folderPath, folderName);
        try{
            fs.mkdirSync(fullFilePath, { recursive : true });
            return new FolderModel(fullFilePath);
        }catch(err){
            console.log(`Error is writing the file: ${chalk.red(err.message)}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
        }
    }

    deleteFolder(folderPath) {
        try
        {
            rimraf.sync(folderPath);
        }
        catch(err)
        {
            console.log(`Error is writing the file: ${chalk.red(err.message)}. Arguments: ${chalk.magenta(JSON.stringify(arguments))}`);
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





    findFile(folderPath, fileName) {

        const filePath = path.resolve(folderPath, fileName);

        try
        {
            let fileData = fs.readFileSync(filePath);
            return new FileModel(filePath, fileData.toString())
        }
        catch(err)
        {
            throw err;
        }
    }

}

module.exports = new FileService();

const fs = require('fs');
const glob = require('glob');

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
        fs.copyFile(src, dest); // UPDATE FROM: fs.linkSync(src, dest); 
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
     * @param {*} source
     * @param {*} destination
     */
    copyFolder(source, destination) {
        copyRecursiveSync(src, dest);
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
        var filePaths = glob.sync(process.cwd() + filePattern, {});
            filePaths = filePaths.concat( glob.sync(process.cwd() + `/**/${filePattern}`, {}) );

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


}

module.exports = new FileService();
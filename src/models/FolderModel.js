const fs = require('fs');
const path = require('path');

const FileModel = require('./FileModel');
const FileService = require('../services/utils/FilesService');

/**
 * IFile represents the path and the contents of a file 
 *
 * @class FolderModel
 */
class FolderModel{

    /**
     * Creates an instance of FolderModel.
     * 
     * @param {string} path - path to the file
     * @memberof FolderModel
     */
    constructor(path){
        this.path = path;
    }


    /**
     * Write the file 
     *
     * @param {string} fileName
     * @param {string} fileContents
     * @returns {FileModel} fileModel - file path and contents 
     * @memberof FolderModel
     */
    add(fileName, fileContents){
        try{
            return FileService.createFile(this.path, fileName, fileContents);
        }
        catch(err){
            return false; 
        }
    }


    /**
     * @todo upload/save folder 
     *
     * @memberof FolderModel
     */
    save(){

    }
    upload(){
        this.save();
    }
    /**
     * @todo sync with server 
     *
     * @memberof FolderModel
     */
    sync(){

    }
    download(){
        this.sync();
    }

    /**
     * @todo Destroys the folder locally and optionally remotely
     *
     * @param {boolean} destroyOnMsStorage - destory on the MS storage server too 
     * @memberof FileModel
     */
    destroy(destroyOnMsStorage){
        destroyOnMsStorage = destroyOnMsStorage || false; 

    }
}
module.exports = FolderModel;
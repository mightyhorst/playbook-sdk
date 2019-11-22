const fs = require('fs');
const path = require('path');

/**
 * IFile represents the path and the contents of a file 
 * 
 * @var {FileModel} playbookFileModel - FileModel representing the playbook.js file 
 * @var {FolderModel} docsFolderModel - Folder Model representing the path to the docs folder referred to by the playbook file 
 *
 * @class ExampleModel
 */
class ExampleModel{

    /**
     * Creates an instance of ExampleModel.
     * 
     * @param {string} name - example name 
     * @param {FileModel} playbookFileModel - FileModel representing the playbook.js file 
     * @param {FolderModel} docsFolderModel - Folder Model representing the path to the docs folder referred to by the playbook file 
     * @memberof ExampleModel
     */
    constructor(name, playbookFileModel, docsFolderModel){

        this.name = name; 
        this.playbookFileModel = playbookFileModel;

        if(docsFolderModel){
            this.docsFolderModel = docsFolderModel; 
        }
        else{
            
        }
    }

    

    /**
     * @todo upload/save folder 
     *
     * @memberof ExampleModel
     */
    save(){

    }
    upload(){
        this.save();
    }
    put(){
        this.upload();
    }
    /**
     * @todo sync with server 
     *
     * @memberof ExampleModel
     */
    sync(){

    }
    download(){
        this.sync();
    }

    /**
     * @todo Destroys the file locally and optionally remotely
     *
     * @param {boolean} destroyOnMsStorage - destory on the MS storage server too 
     * @memberof ExampleModel
     */
    destroy(destroyOnMsStorage){
        destroyOnMsStorage = destroyOnMsStorage || false; 

    }
}
module.exports = ExampleModel;
const path = require('path');
const chalk = require('chalk');
const FileService = require('./utils/FilesService');
const Constants = require('../constants/index');
const ExampleModel = require('../models/ExampleModel');
const FolderModel = require('../models/FolderModel');
const FileModel = require('../models/FileModel');


class ExamplesService{

    constructor(){
        this.pathToExamplesFolder = Constants.examplesFolder;
    }

    /**
     * Returns the file paths to all the *playbook.js files 
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @memberof Controller
     * @todo refactor to use FileService not glob directly 
     */
    findAllExamples(){
        /**
         * @step find file models 
         */
        const fileModels =  FileService.findAll(this.pathToExamplesFolder, 'example.*.playbook.js');
        
        /**
         * @step map to example model 
         */
        const exampleModels = fileModels.map(playbookFileModel => {
            try{
                const folder = this._parseFolderFromFile(playbookFileModel);
                const playbookFolderModel = new FolderModel(folder.path); 
                // playbookFolderModel.lsAll(); 
                return new ExampleModel(folder.name, playbookFileModel, playbookFolderModel);
            }
            catch(err){
                throw err;
            }
        })

        return exampleModels;
    }

    /**
     * Parse the example folder pah from the file model name  
     *
     * @param {FileModel} playbookFileModel
     * @memberof ExamplesService
     */
    _parseFolderFromFile(playbookFileModel){
        const name = playbookFileModel.nameSansExt;
        const parts = name.split('.');
        
        if(parts[1]){

            const folderPath = playbookFileModel.folder;
            const folderName = parts[1];

            return {
                name: folderName, 
                path: path.resolve(folderPath, folderName)
            }
        }
        else{
            const err = new Error('The name doesn\'t match the pattern');
            err.type = 'InvalidName';
            throw err;
        }
    }
}
module.exports = new ExamplesService();
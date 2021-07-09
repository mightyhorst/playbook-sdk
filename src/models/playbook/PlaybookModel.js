/**
 * @requires Logs
 */
const chalk = require('chalk');

/**
 * @requires Services
 */
// import * as TextService from '../../services/utils/TextService';
const TextService = require('../../services/utils/TextService');
const {transformId} = require('../../services/utils/transformId');

/**
 * @requires Models
 */
// import { PlaybookCategoryModel } from './PlaybookCategoryModel';
// const {PlaybookCategoryModel} = require('./PlaybookCategoryModel');
const PlaybookCategoryModel = require('./PlaybookCategoryModel');

/**
 * The Playbook model assists in creating the playbook.js file that is to be consumed by the playbook SDK
 *
 * @class PlaybookModel
 */
class PlaybookModel {

    name;
    outputFileName;
    categoryModels = [];
    stepModels = [];
    nextCatId = 0;

    /**
     * 
     * @param {string} name - playbook name
     * @param {string} outputFileName - @optional output name for the playbook.json @default playbook.json
     */
    constructor(name, outputFileName)
    {
        this.nextCatId = 0;
        this.name = name;
        this.outputFileName = outputFileName || 'playbook.json';

        this.categoryModels = [];
        this.stepModels = [];
    }

    /**
     * Creates a PlaybookCategoryModel that represents ".addCategory()" in the playbook.js file
     *
     * @param name — playbook name
     * @param optionalId — optional - playbook id
     * @param optionalFolderName — optional - folder name
     * 
     * @returns {PlaybookCategoryModel}
     * @memberof PlaybookModel
     */
    addCategory(name, optionalId, optionalFolderName)
    {
        /**
         * @transform generate and transform ID and folderName
         */
        const id = optionalId || transformId('cat', this.nextCatId, name);
        const folderName = optionalFolderName || id;

        /**
         * @step create the playbook category
         */
        const category = new PlaybookCategoryModel(
            name,
            id,
            folderName,
        );

        /**
         * @store add to data array
         */
        this.categoryModels.push(category);
        this.nextCatId++;

        return category;
    }

    addCategoryModel(catModel){
        this.categoryModels.push(catModel);
        this.nextCatId++;
    }
    

    /**
     * This is used to add the require blocks for each step directly into the playbook.js
     * e.g. 
     *  const {{name}} = require('./'+'{{path}}');
     *  const step01_intro = require('./cat01_intro/scene01_intro/step01_intro/step.playbook.js');
     * @param {string} path - path to the step folder
     * @param {string} name - the step constant name
     * 
     * @deprecated not needed as we directly add the require block to the ."addStepFromModel" builder
     */
    addStep(path, name)
    {
        this.stepModels.push({
            path : path,
            name : name
        });
    }
    /**
     * Stash a step model directly for easy access in the controller
     * @param {StepModel} stepModel - step model to stash on the playbook model
     * @see PlaybookJsonService.convertToModel - for usage
     */
    addStepModel(stepModel){
        this.stepModels.push(stepModel);
    }

    /**
     * Prints the playbook.js entry and any categories that are a part of this playbook
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookModel
     */
    printJsContent(indentSize = 1)
    {
        let indent = TextService.indent(indentSize);


        let content = 'const path = require("path");\n\n';

        this.stepModels.forEach((stepModel) => {
            // content += "const " + stepModel.name + " = require('./" + stepModel.path + "\');\n";
        });

        content += '\nplaybook("' + this.name + '")\n';

        this.categoryModels.forEach((category) => {
            content += category.printJsContent(indentSize);
        })

        content += indent + '.write(path.join(__dirname, "' + this.outputFileName + '"));'

        return content;
    }

}

module.exports = PlaybookModel;

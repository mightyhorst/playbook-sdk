/**
 * @requires Logs
 */
const chalk = require('chalk');

/**
 * @requires Services
 */
// import * as TextService from '../../services/utils/TextService';
const TextService = require('../../services/utils/TextService');

/**
 * @requires Models
 */
// import {
//     PlaybookTimelineDescriptionModel, 
//     PlaybookTimelineCodeModel,
//     PlaybookTimelineTerminalModel
// } from './PlaybookTimelineModel';
const {
    PlaybookTimelineDescriptionModel, 
    PlaybookTimelineCodeModel,
    PlaybookTimelineTerminalModel
} = require('./PlaybookTimelineModel');

/**
 * The Step model added to a playbook scene model. This will contain a timeline that 
 * orders how we play back the playbook
 *
 * @class PlaybookStepModel
 */
// export class PlaybookStepModel
class PlaybookStepModel
{
    name;
    commitId;

    timelineDescriptionModels = [];
    timelineCodeModels = [];
    timelineTerminalModels = [];
    

    /**
     * @constructor
     * @param {string} name - scene title
     * @param {string} commitId - commit ID for something
     * @todo 
     *      - [ ] refactor name to title
     *      - [ ] add ID and folderName 
     */
    constructor(name, commitId)
    {
        this.name = name;
        this.commitId = commitId;
    }

    /**
     * Creates a PlaybookTimelineDescriptionModel that represents ".addDescriptionFromMdFile()" in the playbook.js file
     *
     * @param {string} name
     * @returns {PlaybookTimelineDescriptionModel}
     * @memberof PlaybookStepModel
     */
    addDescriptionFromMdFile(start, duration, filePath)
    {
        const timelineDescriptionModel = new PlaybookTimelineDescriptionModel(start, duration, filePath);
        this.timelineDescriptionModels.push(timelineDescriptionModel);

        return timelineDescriptionModel;
    }
    addDescriptionModel(timelineDescriptionModel){
        this.timelineDescriptionModels.push(timelineDescriptionModel);
    }

    /**
     * Creates a PlaybookTimelineCodeModel that represents ".addCode()" in the playbook.js file
     *
     * @param {number} start
     * @param {number} duration
     * @param {string} templateFilePath
     * @param {string} outputFilePath
     * @param {string} template_data
     * 
     * @returns {PlaybookTimelineCodeModel}
     * @memberof PlaybookStepModel
     */
    addCode(start, duration, templateFilePath, outputFilePath, template_data)
    {
        const timelineCodeModel = new PlaybookTimelineCodeModel(start, duration, templateFilePath, outputFilePath, template_data);
        this.timelineCodeModels.push(timelineCodeModel);
        
        return timelineCodeModel;
    }
    addCodeModel(timelineCodeModel){
        this.timelineCodeModels.push(timelineCodeModel);
    }

    /**
     * Creates a PlaybookTimelineTerminalModel that represends the ".addTerminal()" in the playbook.js file
     *
     * @param {number} start
     * @param {number} duration
     * @returns
     * @memberof PlaybookStepModel
     */
    addTerminal(start, duration)
    {
        const timelineTerminalModel = new PlaybookTimelineTerminalModel(start, duration);
        this.timelineTerminalModels.push(timelineTerminalModel);

        return timelineTerminalModel;
    }
    addTerminalModel(timelineTerminalModel){
        this.timelineTerminalModels.push(timelineTerminalModel);
    }
    
    /**
     * Prints the step entry in playbook.js format and any timeline data that is a part of this step
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookStepModel
     */
    printJsContent(indentSize = 4)
    {
        const indent = TextService.indent(indentSize);

        let content = "const path = require('path');\n\n";
            content += 'module.exports = step("' + this.name + '")\n';

        this.timelineDescriptionModels.forEach((timelineDescriptionModel) => {
            content += timelineDescriptionModel.printJsContent(indentSize + 1);
        });

        this.timelineCodeModels.forEach((timelineCodeModel) => {
            content += timelineCodeModel.printJsContent(indentSize + 1);
        });

        this.timelineTerminalModels.forEach((timelineTerminalModel) => {
            content += timelineTerminalModel.printJsContent(indentSize + 1);
        });

        return content;
    }

}

module.exports = PlaybookStepModel;

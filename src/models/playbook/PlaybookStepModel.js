/**
 * @requires Services
 */
import * as TextService from '../../services/utils/TextService';

/**
 * @requires Models
 */
import {
    PlaybookTimelineDescriptionModel, 
    PlaybookTimelineCodeModel,
    PlaybookTimelineTerminalModel
} from './PlaybookTimelineModel';

/**
 * The Step model added to a playbook scene model. This will contain a timeline that 
 * orders how we play back the playbook
 *
 * @class PlaybookStepModel
 */
export class PlaybookStepModel
{
    name;
    commitId;

    timelineDescriptionModels = [];
    timelineCodeModels = [];
    timelineTerminalModels = [];
    

    constructor(name, commitId)
    {
        this.name = name;
        this.commitId = commitId;
    }

    /**
     * Creates a PlaybookTimelineDescriptionModel that represents ".addDescriptionFromMdFile()" in the playbook.js file
     *
     * @param {*} name
     * @returns {PlaybookTimelineDescriptionModel}
     * @memberof PlaybookStepModel
     */
    addDescriptionFromMdFile(start, duration, filePath)
    {
        const timelineDescriptionModel = new PlaybookTimelineDescriptionModel(start, duration, filePath);
        this.timelineDescriptionModels.push(timelineDescriptionModel);

        return timelineDescriptionModel;
    }

    /**
     * Creates a PlaybookTimelineCodeModel that represents ".addCode()" in the playbook.js file
     *
     * @param {*} start
     * @param {*} duration
     * @param {*} templateFilePath
     * @param {*} outputFilePath
     * @param {*} compileData
     * @returns {PlaybookTimelineCodeModel}
     * @memberof PlaybookStepModel
     */
    addCode(start, duration, templateFilePath, outputFilePath, compileData)
    {
        const timelineCodeModel = new PlaybookTimelineCodeModel(start, duration, templateFilePath, outputFilePath, compileData);
        this.timelineCodeModels.push(timelineCodeModel);

        return timelineCodeModel;
    }

    /**
     * Creates a PlaybookTimelineTerminalModel that represends the ".addTerminal()" in the playbook.js file
     *
     * @param {*} start
     * @param {*} duration
     * @returns
     * @memberof PlaybookStepModel
     */
    addTerminal(start, duration)
    {
        const timelineTerminalModel = new PlaybookTimelineTerminalModel(start, duration);
        this.timelineTerminalModels.push(timelineTerminalModel);

        return timelineTerminalModel;
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

        let content = "const path = require('path');\n\n"
            content += 'module.exports = step("' + this.name + '")\n';

        this.timelineDescriptionModels.forEach((timelineDescriptionModel) => {
            content += timelineDescriptionModel.printJsContent(indentSize + 1);
        })

        this.timelineCodeModels.forEach((timelineCodeModel) => {
            content += timelineCodeModel.printJsContent(indentSize + 1);
        })

        this.timelineTerminalModels.forEach((timelineTerminalModel) => {
            content += timelineTerminalModel.printJsContent(indentSize + 1);
        })

        return content;
    }

}
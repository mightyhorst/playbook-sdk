/**
 * @requires Services
 */
import * as TextIndentService from '../../services/utils/TextIndentService';

/**
 * @requires Models
 */
import {
    PlaybookTimelineDescriptionModel, 
    PlaybookTimelineCodeModel
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
     * @param {*} name
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
     * Prints the step entry in playbook.js format and any timeline data that is a part of this step
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookStepModel
     */
    printJsContent(indentSize = 3)
    {
        const indent = TextIndentService.indent(indentSize);

        let content = indent + '.addStep("' + this.name + '")\n';

        this.timelineDescriptionModels.forEach((timelineDescriptionModel) => {
            content += timelineDescriptionModel.printJsContent(indentSize + 1);
        })

        this.timelineCodeModels.forEach((timelineCodeModel) => {
            content += timelineCodeModel.printJsContent(indentSize + 1);
        })

        return content;
    }

}
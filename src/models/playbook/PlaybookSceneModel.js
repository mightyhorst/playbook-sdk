/**
 * @requires Services
 */
// import * as TextService from '../../services/utils/TextService';
const TextService = require('../../services/utils/TextService');

/**
 * @requires Models
 */
// import { PlaybookStepModel } from './PlaybookStepModel';
// const { PlaybookStepModel } = require( './PlaybookStepModel' );
const PlaybookStepModel = require( './PlaybookStepModel' );

/**
 * The scene model added to a playbook category model. This will contain steps
 *
 * @class PlaybookCategoryModel
 */
// export class PlaybookSceneModel
class PlaybookSceneModel
{
    name;
    stepModels = [];

    /**
     * @constructor
     * @param {string} name - name
     * @param {string?} optionalId - optional - id
     * @param {string?} optionalFolderName - optional - folder name
     */
    constructor(name, optionalId, optionalFolderName)
    {
        this.name = name;
        
        if(optionalId) 
            this.id = optionalId;
        if(optionalFolderName)
            this.folderName = optionalFolderName;
    }

    /**
     * Creates a PlaybookStepModel that represents ".addStep()" in the playbook.js file
     *
     * @param {string} name
     * @param {string?} optionalCommitId - optional - commit id
     * @returns {PlaybookStepModel}
     * @memberof PlaybookSceneModel
     */
    addStep(name, optionalCommitId)
    {
        /**
         * @todo make sure step models works
         * @author Mitchy 
         */
        const stepModel = new PlaybookStepModel(
            name,
            optionalCommitId,
        );
        // this.stepModels.push(name);
        this.stepModels.push(stepModel);
    }
    addStepModel(stepModel){
        this.stepModels.push(stepModel);
    }

    /**
     * Prints the scene entry in playbook.js format and any steps that are a part of this scene
     *
     * @param {number} [indentSize=1]
     * @param {boolean} fromPlaybookJsonService - added by for backwards compat @author Mitchy 
     * @returns {string}
     * @memberof PlaybookSceneModel
     */
    printJsContent(indentSize = 2, fromPlaybookJsonService = true)
    {
        const indent = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent + '.addScene("' + this.name + '")\n';

        if(!fromPlaybookJsonService){
            this.stepModels.forEach((stepName) => {
                content += indent2 + '.addStepFromModel(' + stepName + ')\n';
            });
        }
        else{
            this.stepModels.forEach((stepModel) => {
                // content += indent2 + '.addStepFromModel(' + stepModel.playbookJsRequireId + ')\n';
                const requirePath = `require('./${stepModel.relativePathFromPlaybookFolder}/step.playbook.js')`;
                content += indent2 + `.addStepFromModel(${requirePath})\n`;
            });
        }

        return content;
    }
}
module.exports = PlaybookSceneModel;

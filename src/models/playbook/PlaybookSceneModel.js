/**
 * @requires Services
 */
import * as TextIndentService from '../../services/utils/TextIndentService';

/**
 * @requires Models
 */
import { PlaybookStepModel } from './PlaybookStepModel';

/**
 * The scene model added to a playbook category model. This will contain steps
 *
 * @class PlaybookCategoryModel
 */
export class PlaybookSceneModel
{
    name;
    stepModels = [];

    constructor(name)
    {
        this.name = name;
    }

    /**
     * Creates a PlaybookStepModel that represents ".addStep()" in the playbook.js file
     *
     * @param {*} name
     * @returns {PlaybookStepModel}
     * @memberof PlaybookSceneModel
     */
    addStep(name, commitId)
    {
        const step = new PlaybookStepModel(name, commitId);
        this.stepModels.push(step);

        return step;
    }

    /**
     * Prints the scene entry in playbook.js format and any steps that are a part of this scene
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookSceneModel
     */
    printJsContent(indentSize = 2)
    {
        const indent = TextIndentService.indent(indentSize);

        let content = indent + '.addScene("' + this.name + '")\n';

        this.stepModels.forEach((step) => {
            content += step.printJsContent(indentSize + 1);
        })

        return content;
    }
}
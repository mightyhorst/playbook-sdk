/**
 * @requires Services
 */
import * as TextService from '../../services/utils/TextService';

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
    addStep(name)
    {
        this.stepModels.push(name);
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
        const indent = TextService.indent(indentSize);
        const indent2 = TextService.indent(indentSize + 1);

        let content = indent + '.addScene("' + this.name + '")\n';

        this.stepModels.forEach((stepName) => {
            content += indent2 + '.addStepFromModel(' + stepName + ')\n';
        })

        return content;
    }
}
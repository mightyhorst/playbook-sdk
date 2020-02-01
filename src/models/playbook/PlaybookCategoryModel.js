/**
 * @requires Services
 */
import * as TextIndentService from '../../services/utils/TextIndentService';

/**
 * @requires Models
 */
import { PlaybookSceneModel } from "./PlaybookSceneModel";


/**
 * The category model added to a playbook model. This will contain scenes
 *
 * @class PlaybookCategoryModel
 */
export class PlaybookCategoryModel {

    name;
    sceneModels = [];

    constructor(name)
    {
        this.name = name;
    }

    /**
     * Creates a PlaybookSceneModel that represents ".addScene()" in the playbook.js file
     *
     * @param {*} name
     * @returns {PlaybookSceneModel}
     * @memberof PlaybookCategoryModel
     */
    addScene(name)
    {
        const scene = new PlaybookSceneModel(name);
        this.sceneModels.push(scene);

        return scene;
    }

    /**
     * Prints the category entry in playbook.js format and any scenes that are a part of this category
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookCategoryModel
     */
    printJsContent(indentSize = 1)
    {
        const indent = TextIndentService.indent(indentSize);

        let content = indent + '.addCategory("' + this.name + '")\n';

        this.sceneModels.forEach((scene) => {
            content += scene.printJsContent(indentSize + 1);
        })

        return content;
    }
}
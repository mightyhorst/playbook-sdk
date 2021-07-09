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
// import { PlaybookSceneModel } from "./PlaybookSceneModel";
// const { PlaybookSceneModel } = require("./PlaybookSceneModel");
const PlaybookSceneModel = require("./PlaybookSceneModel");


/**
 * The category model added to a playbook model. This will contain scenes
 *
 * @class PlaybookCategoryModel
 */
// export class PlaybookCategoryModel {
class PlaybookCategoryModel {

    id;
    name;
    sceneModels = [];

    /**
     * @constructor
     * @param {string} name - playbook name
     * @param {string} id - playbook id
     * @param {string} folderName - folder name
     */
    constructor(name, id, folderName)
    {
        this.name = name;
        this.id = id;
        this.folderName = folderName;
        this.sceneModels = [];
    }

    /**
     * Creates a PlaybookSceneModel that represents ".addScene()" in the playbook.js file
     *
     * @param {string} name - name
     * @param {string?} optionalId - optional - id
     * @param {string?} optionalFolderName - optional - folder name
     * @returns {PlaybookSceneModel}
     * @memberof PlaybookCategoryModel
     */
    addScene(name, optionalId, optionalFolderName)
    {
        const scene = new PlaybookSceneModel(
            name,
            optionalId,
            optionalFolderName,
        );
        this.sceneModels.push(scene);

        return scene;
    }
    addSceneModel(sceneModel){
        this.sceneModels.push(sceneModel);
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
        const indent = TextService.indent(indentSize);

        let content = indent + '.addCategory("' + this.name + '")\n';

        this.sceneModels.forEach((scene) => {
            content += scene.printJsContent(indentSize + 1);
        })

        return content;
    }
}

module.exports = PlaybookCategoryModel;

/**
 * @requires Services
 */
import * as TextIndentService from '../../services/utils/TextIndentService';

/**
 * @requires Models
 */
import { PlaybookCategoryModel } from './PlaybookCategoryModel';

/**
 * The Playbook model assists in creating the playbook.js file that is to be consumed by the playbook SDK
 *
 * @class PlaybookModel
 */
export class PlaybookModel {

    name;
    outputFileName;
    categoryModels = [];


    constructor(name, outputFileName)
    {
        this.name = name;
        this.outputFileName = outputFileName;
    }

    /**
     * Creates a PlaybookCategoryModel that represents ".addCategory()" in the playbook.js file
     *
     * @param {*} name
     * @returns {PlaybookCategoryModel}
     * @memberof PlaybookModel
     */
    addCategory(name)
    {
        const category = new PlaybookCategoryModel(name);
        this.categoryModels.push(category);

        return category;
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
        let indent = TextIndentService.indent(indentSize);

        let content = 'playbook("' + this.name + '")\n';

        this.categoryModels.forEach((category) => {
            content += category.printJsContent(indentSize);
        })

        content += indent + '.write("' + this.outputFileName + '");'

        return content;
    }

}
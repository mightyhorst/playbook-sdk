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
    stepModels = [];


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

    addStep(path, name)
    {
        this.stepModels.push({
            path : path,
            name : name
        });
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


        let content = 'const path = require("path");\n\n';

        this.stepModels.forEach((stepModel) => {
            content += "const " + stepModel.name + " = require('./" + stepModel.path + "\');\n";
        });

        content += '\nplaybook("' + this.name + '")\n';

        this.categoryModels.forEach((category) => {
            content += category.printJsContent(indentSize);
        })

        content += indent + '.write(path.join(__dirname, "' + this.outputFileName + '"));'

        return content;
    }

}
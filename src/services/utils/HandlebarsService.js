/**
 * @requires fs
 */
const path = require('path');
const fs = require('fs');

/**
 * @requires handlebars
 */
const handlebars = require('handlebars');
const delimiters = require('handlebars-delimiters');

/**
 * @requires errors
 */
const {
    ValidationError,
} = require('../../errors');


/**
 * @constant TEMPLATES_DIR
 */
const TEMPLATES_DIR = path.resolve(__dirname, '../../views/templates');

class HandlebarsService{
    constructor(){
        
    }
    getStepFolder(filePath){
        return path.resolve(TEMPLATES_DIR, 'step', filePath);
    }
    /**
     * 
     * @param {PlaybookStepModel} stepModel  
     */
    stepPlaybook({
        categoryModel,
        sceneModel,
        stepModel,
    }){
        /**
         * @step validate
         */
        const {isValid, errors:valdiationErrors} = this._validate({
            categoryModel,
            sceneModel,
            stepModel,
        });
        if(!isValid){
            throw new ValidationError({
                payload: {
                    categoryModel,
                    sceneModel,
                    stepModel,
                },
                valdiationErrors,
            });
        }

        /**
         * @step read the step.playbook.js handlebars file
         */
        const stepPlaybookPath = this.getStepFolder('step.playbook.js.hbs');
        const stepPlaybook = fs.readFileSync(stepPlaybookPath, 'utf8');

        /**
         * @step compile handlebars file
         */
        delimiters(Handlebars, ['[{--', '--}]']);
        const template = handlebars.compile(stepPlaybook);

        /**
         * @step generate the output
         */
        const output = template({
            category:{
                folderName: categoryModel.folderName,
            },
            scene:{
                folderName: sceneModel.folderName,
            },
            step: {
                title: stepModel.title,
                folderName: stepModel.folderName,
                description: [
                    {
                        start: 200,
                        duration: 3200,
                    },
                ],
            },
        });
        return output;
    }
    _validate({
        categoryModel,
        sceneModel,
        stepModel,
    }){
        const {
            isValid:isCategoryValid,
            errors: categoryErrors,
        } = this._validateCatModel(categoryModel);
        const {
            isValid:isSceneValid,
            errors:sceneErrors,
        } = this._validateSceneModel(sceneModel);
        const {
            isValid:isStepValid,
            errors:stepErrors,
        } = this._validateStepModel(stepModel);
        return {
            isValid: isCategoryValid && isSceneValid && isStepValid,
            errors: {
                category: categoryErrors,
                scene: sceneErrors,
                step: stepErrors,
            },
        };
    }
    _validateCatModel(catModel){
        let isValid = false;
        let errors = [];

        const isObject = typeof(catModel) === 'object';
        if(!isObject) errors.push('Not an object');

        const hasFolderName = catModel.hasOwnProperty('folderName');
        if(!hasFolderName) errors.push('Missing folderName');


        isValid = isObject && hasFolderName;
        return {isValid,errors};
    }
    _validateSceneModel(sceneModel){
        let isValid = false;
        let errors = [];

        const isObject = typeof(sceneModel) === 'object';
        if(!isObject) errors.push('Not an object');

        const hasFolderName = sceneModel.hasOwnProperty('folderName');
        if(!hasFolderName) errors.push('Missing folderName');

        isValid = isObject && hasFolderName;
        return {isValid,errors};
    }
    _validateStepModel(stepModel){
        let isValid = false;
        let errors = [];

        const isObject = typeof(stepModel) === 'object';
        if(!isObject) errors.push('Not an object');

        const hasFolderName = stepModel.hasOwnProperty('folderName');
        if(!hasFolderName) errors.push('Missing folderName');

        isValid = isObject && hasFolderName;
        return {isValid, errors};
    }
}

module.exports = new HandlebarsService();

const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires MenuModels - view models
 */
const {
    QuestionEditorModel, 
    QuestionInputModel,
} = require('../../models/menus');

/**
 * @requires Errors
 */
const {
    MissingAttributeError,
} = require('../../errors');

/**
 * @constant QuestionIds
 */
const QuestionIds = {
    TEMPLATE_FILENAME_ID: 'TEMPLATE_FILENAME_ID',
    OUTPUT_ID: 'OUTPUT_ID',
    HBS_CONTENTS_ID: 'HBS_CONTENTS_ID',
    TEMPLATE_DATA_ID: 'TEMPLATE_DATA_ID',
    START_ID: 'START_ID',
    DURATION_ID: 'DURATION_ID',
}

/**
 * @view Create a new step prompt
 */
class CreateTimelineCodeView{

    /**
     * @constructor Creates an instance of CreateTimelineCodeView.
     * 
     * @param {number} default_startMs - default - start time in milliseconds
     * @param {number} default_durationMs - default - duration time in milliseconds
     * @param {string} default_templateFilePath - default - path to the hbs template
     * @param {string} default_outputFilePath - default - path to the output file in the code player
     * @param {string} default_template_data - default - template data
     * @param {string} default_hbsContents - default - contents for the hbs file
     * @param {string} fullPathToCodeFolder - default - full path to the folder where we want to save the code file, so we can check whether the file name will clash 
     * 
     * @memberof CreateTimelineCodeView
     */
    constructor({
        default_startMs, 
        default_durationMs, 
        default_templateFilePath, 
        default_outputFilePath, 
        default_hbsContents,
        default_template_data,
        fullPathToCodeFolder,
    }){
        /**
         * @constant questionTemplateFileName - template file name for the "template" path
         * @see 
         *      {
         *          "code": {
         *              "template": {{👉}}
         *          }
         *      }
         */
         const questionTemplateFileName = new QuestionInputModel(
            QuestionIds.TEMPLATE_FILENAME_ID,
            '👉 What should I call the template file?',
            default_templateFilePath || 'template.hbs',
            async (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \nReceived: ${val}\n`;
                return true;
            },
            (val) => {
                /**
                 * @cache answer to use in follow up question
                 * @todo add "filter" and "when" callbacks to inquirerjs view models
                 */
                process.env[QuestionIds.TEMPLATE_FILENAME_ID] = val;
                return val;
            },
        );
        
        
        /**
         * @constant questionOutputPath - output path relative to the code player for the "output" key
         * @see 
         *      {
         *          "code": {
         *              "output": {{👉}}
         *          }
         *      }
         */
         const questionOutputPath = new QuestionInputModel(
            QuestionIds.OUTPUT_ID,
            '👉 What should I call the output file?',
            default_outputFilePath || 'hello/world.js',
            (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        /**
         * @constant questionHbsContents - description input
         */
        const questionHbsContents = new QuestionEditorModel(
            QuestionIds.HBS_CONTENTS_ID, 
            '👉 Please enter the code for the template file.',
            default_hbsContents,
            (val)=>{
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Needs more content. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        let questionTemplateData;
        if(default_template_data){
            questionTemplateData = new QuestionEditorModel(
                QuestionIds.TEMPLATE_DATA_ID, 
                '👉 Please enter the template data to be compiled into the hbs template.',
                JSON.stringify(default_template_data, null, 4),
                (val)=>{
                    const isGreaterThanZero = val.length > 0;
                    if(!isGreaterThanZero) 
                        return `Needs more content. \n\nreceived: ${val}\n`;

                    try{
                        JSON.parse(val);
                    }
                    catch(err){
                        return `Template data must be JSON e.g. {"hello": "world"}`;
                    }
                    return true;
                },
            );
        }

        /**
         * @constant questionStartTime - start time 
         */
        const questionStartTime = new QuestionInputModel(
            QuestionIds.START_ID,
            '⏰ What is the start time?',
            default_startMs,
            (val) => {
                const isNumber = !isNaN(val);
                return isNumber || `${val} is not a number`;
            },
        );
        
        /**
         * @constant questionDurationTime - duration time 
         */
        const questionDurationTime = new QuestionInputModel(
            QuestionIds.DURATION_ID,
            '⏰ What is the duration time?',
            default_durationMs,
            (val) => {
                const isNumber = !isNaN(val);
                return isNumber || `${val} is not a number`;
            },
        );

        /**
         * @constant questions - questions order for the prompt
         */
        this.questions = [
            questionTemplateFileName.question,
            questionOutputPath.question,
            questionHbsContents.question,
            questionStartTime.question,
            questionDurationTime.question,
        ];
        if(default_template_data){
            this.questions.push(questionTemplateData.question);
        }
    }

    /**
     * @method show
     * @description Show the questions and return the answers
     * @async
     * @returns 
     *      {boolean} isValid
     *      { {template: string[], output: string[], hbsContents: [], start: string[], duration: string[], template_data?: [] } } validationErrors
     *      {string} template
     *      {string} output
     *      {string} hbsContents
     *      {number} start
     *      {number} duration
     *      {string?} template_data
     */
    async show(){
        
        try{
            /**
             * @step prompt user with questions
             */
            const answers = await inquirer.prompt(this.questions);

            /**
             * @step revalidate answers
             */
            const {
                isValid, 
                validationErrors,
                template,
                output,
                hbsContents,
                start,
                duration,
                template_data,
            } = this._validateAnswers(answers);

            /**
             * @returns 
             *      {boolean} isValid
             *      { {description: string[]}, {start: string[]}, {duration: string[]} } validationErrors
             *      {string} fileName
             *      {string} description
             *      {number} start
             *      {number} duration
             */
            return {
                isValid, 
                validationErrors,
                template,
                output,
                hbsContents,
                start,
                duration,
                template_data,
            };
          
        }
        catch(err){
            throw err;
        }
    }
    _validateAnswers(answers){
        let isValid = false;
        const validationErrors = {
            template: [],
            output: [],
            hbsContents: [],
            start: [],
            duration: [],
            template_data: [],
        };

        let isTemplateValid = false;
        const template = answers[QuestionIds.TEMPLATE_FILENAME_ID];
        let isOutputValid = false;
        const output = answers[QuestionIds.OUTPUT_ID];
        let isHbsValid = false;
        const hbsContents = answers[QuestionIds.HBS_CONTENTS_ID];
        let isStartValid = false;
        const start = (answers[QuestionIds.START_ID]);
        let isDurationValid = false;
        const duration = (answers[QuestionIds.DURATION_ID]);
        let isTemplateDataValid = false;
        let template_data = answers.hasOwnProperty(QuestionIds.TEMPLATE_DATA_ID) ? answers[QuestionIds.TEMPLATE_DATA_ID] : {};

        let isTemplateGtZero = false;
        if(template.length > 1){
            isTemplateGtZero = true;
        }
        else{
            validationErrors.template.push('"template" must be greater than 0');
        }
        
        let isOutputGtZero = false;
        if(output.length > 1){
            isOutputGtZero = true;
        }
        else{
            validationErrors.template.push('"output" must be greater than 0');
        }
        
        let isDescGtZero = false;
        if(hbsContents.length > 1){
            isDescGtZero = true;
        }
        else{
            validationErrors.hbsContents.push('"template" must be greater than 0');
        }

        let isStartGtZero = false;
        if(start > 0){
            isStartGtZero = true;
        }
        else{
            validationErrors.start.push('Start time must be greater than 0');
        }
        
        let isDurationGtZero = false;
        if(duration > 0){
            isDurationGtZero = true;
        }
        else{
            validationErrors.duration.push('Duration time must be greater than 0');
        }

        let isStartNumber = false;
        if(!isNaN(start)){
            isStartNumber = true;
        }
        else{
            validationErrors.start.push('Start time must be a number');
        }
        
        let isDurationNumber = false;
        if(!isNaN(duration)){
            isDurationNumber = true;
        }
        else{
            validationErrors.duration.push('Duration time must be a number');
        }

        if(answers.hasOwnProperty(QuestionIds.TEMPLATE_DATA_ID)){
            try{
                template_data = JSON.parse(JSON.stringify(answers[QuestionIds.TEMPLATE_DATA_ID]));
                isTemplateDataValid = true;
            }
            catch(err){
                console.log(err.message);
                validationErrors.template_data.push('Make sure that "template_data" is valid JSON');
                isTemplateDataValid = false;
            }
        }
        else{ 
            isTemplateDataValid = true;
        }

        isTemplateValid = isTemplateGtZero;
        isOutputValid = isOutputGtZero;
        isHbsValid = isDescGtZero;
        isStartValid = isStartGtZero && isStartNumber;
        isDurationValid = isDurationGtZero && isDurationNumber;
        isValid = isTemplateValid && isOutputValid && isHbsValid && isStartValid && isDurationValid && isTemplateDataValid;
        
        return {
            isValid, 
            validationErrors,
            template,
            output,
            hbsContents,
            start,
            duration,
            template_data
        };
    }
}
module.exports = CreateTimelineCodeView;

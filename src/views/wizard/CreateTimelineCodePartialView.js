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
    PARTIAL_FILENAME_ID: 'PARTIAL_FILENAME_ID',
    PARTIAL_ID: 'PARTIAL_ID',
    HBS_CONTENTS_ID: 'HBS_CONTENTS_ID',
    PARTIAL_DATA_ID: 'PARTIAL_DATA_ID',
    START_ID: 'START_ID',
    DURATION_ID: 'DURATION_ID',
}

/**
 * @view Create a new step prompt
 */
class CreateTimelineCodePartialView{

    /**
     * @constructor Creates an instance of CreateTimelineCodePartialView.
     * 
     * @param {number} default_startMs - default - start time in milliseconds
     * @param {number} default_durationMs - default - duration time in milliseconds
     * @param {string} default_templateFilePath - default - path to the hbs template
     * @param {string} default_partialId - default - partial ID from the template e.g. {{partial01}}
     * @param {string} default_template_data - default - template data
     * @param {string} default_hbsContents - default - contents for the hbs file
     * 
     * @param {string[]?} otherPartialIds - optional - other partial IDs to make sure we don't duplicate or double up on IDs by mistake
     * @param {string?} hbsContents - optional - handlebars contenst from the template file, so we can check the partial actually exists
     * 
     * @memberof CreateTimelineCodePartialView
     */
    constructor({
        default_startMs, 
        default_durationMs, 
        default_templateFilePath, 
        default_partialId, 
        default_hbsContents,
        default_template_data,
        /**
         * @param checks - other checks
         */
        otherPartialIds,
        hbsContents,
    }){
        /**
         * @constant questionPartialFileName - partial file name for the "partial" path
         * @see 
         *      {
         *          "code": {
         *              "template": {{👉}}
         *          }
         *      }
         */
         const questionPartialFileName = new QuestionInputModel(
            QuestionIds.PARTIAL_FILENAME_ID,
            '👉 What should I call the partial file?',
            default_templateFilePath || 'template.hbs',
            async (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \nReceived: ${val}\n`;
                return (true);
                // return Promise.resolve(true);
            },
        );
        
        
        /**
         * @constant questionPartialId - partialId path relative to the code player for the "partialId" key
         * @see 
         *      {
         *          "code": {
         *              "partialId": {{👉}}
         *          }
         *      }
         */
         const questionPartialId = new QuestionInputModel(
            QuestionIds.PARTIAL_ID,
            '👉 What should I call the template file?',
            default_partialId || 'partial01',
            (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \nReceived: ${val}\n`;
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
                QuestionIds.PARTIAL_DATA_ID, 
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
            questionPartialFileName.question,
            questionPartialId.question,
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
     *      { {template: string[], partialId: string[], hbsContents: [], start: string[], duration: string[], template_data?: [] } } validationErrors
     *      {string} template
     *      {string} partialId
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
                partialId,
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
                partialId,
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
            partialId: [],
            hbsContents: [],
            start: [],
            duration: [],
            template_data: [],
        };

        let isTemplateValid = false;
        const template = answers[QuestionIds.PARTIAL_FILENAME_ID];
        let isPartialIdValid = false;
        const partialId = answers[QuestionIds.PARTIAL_ID];
        let isHbsValid = false;
        const hbsContents = answers[QuestionIds.HBS_CONTENTS_ID];
        let isStartValid = false;
        const start = (answers[QuestionIds.START_ID]);
        let isDurationValid = false;
        const duration = (answers[QuestionIds.DURATION_ID]);
        let isTemplateDataValid = false;
        let template_data = answers.hasOwnProperty(QuestionIds.PARTIAL_DATA_ID) ? answers[QuestionIds.PARTIAL_DATA_ID] : {};

        let isTemplateGtZero = false;
        if(template.length > 1){
            isTemplateGtZero = true;
        }
        else{
            validationErrors.template.push('"template" must be greater than 0');
        }
        
        let isPartialIdGtZero = false;
        if(partialId.length > 1){
            isPartialIdGtZero = true;
        }
        else{
            validationErrors.template.push('"partialId" must be greater than 0');
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

        if(answers.hasOwnProperty(QuestionIds.PARTIAL_DATA_ID)){
            try{
                template_data = JSON.parse(JSON.stringify(answers[QuestionIds.PARTIAL_DATA_ID]));
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
        isPartialIdValid = isPartialIdGtZero;
        isHbsValid = isDescGtZero;
        isStartValid = isStartGtZero && isStartNumber;
        isDurationValid = isDurationGtZero && isDurationNumber;
        isValid = isTemplateValid && isPartialIdValid && isHbsValid && isStartValid && isDurationValid && isTemplateDataValid;
        
        return {
            isValid, 
            validationErrors,
            template,
            partialId,
            hbsContents,
            start,
            duration,
            template_data
        };
    }
}
module.exports = CreateTimelineCodePartialView;

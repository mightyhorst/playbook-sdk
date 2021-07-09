const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires MenuModels - view models
 */
const {
    QuestionEditorModel, QuestionInputModel,
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
    DESCRIPTION_FILENAME_ID: 'DESCRIPTION_FILENAME_ID',
    DESCRIPTION_TITLE_ID: 'DESCRIPTION_TITLE_ID',
    DESCRIPTION_CONTENT_ID: 'DESCRIPTION_CONTENT_ID',
    START_ID: 'START_ID',
    DURATION_ID: 'DURATION_ID',
}

/**
 * @view Create a new step prompt
 */
class CreateTimelineDescriptionView{

    /**
     * @constructor Creates an instance of CreateTimelineDescriptionView.
     * 
     * @param {string} defaultDescriptionFileName - default file name
     * @param {string} defaultDescription - default description text for the md file
     * @param {number} defaultStartMs - default start time in milliseconds
     * @param {number} defaultDurationMs - default duration time in milliseconds
     * 
     * @memberof CreateTimelineDescriptionView
     */
    constructor(defaultDescriptionFileName, defaultDescription, defaultStartMs, defaultDurationMs){
        /**
         * @constant questionDescriptionFileName - start time 
         */
         const questionDescriptionFileName = new QuestionInputModel(
            QuestionIds.DESCRIPTION_FILENAME_ID,
            '👉 What should I call the description file?',
            defaultDescriptionFileName,
            (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \n\nreceived: ${val}\n`;
                return true;
            },
        );
        
        /**
         * @constant questionTitle - start time 
         */
         const questionTitle = new QuestionInputModel(
            QuestionIds.DESCRIPTION_TITLE_ID,
            '👉 What is the friendly title ?',
            '',
            (val) => {
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Must be longer than 0. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        /**
         * @constant questionDescription - description input
         */
        const questionDescription = new QuestionEditorModel(
            QuestionIds.DESCRIPTION_CONTENT_ID, 
            '👉 Please enter the description panel ',
            defaultDescription,
            (val)=>{
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `Needs more content. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        /**
         * @constant questionStartTime - start time 
         */
        const questionStartTime = new QuestionInputModel(
            QuestionIds.START_ID,
            '⏰ What is the start time?',
            defaultStartMs,
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
            defaultDurationMs,
            (val) => {
                const isNumber = !isNaN(val);
                return isNumber || `${val} is not a number`;
            },
        );

        /**
         * @constant questions - questions order for the prompt
         */
        this.questions = [
            questionDescriptionFileName.question,
            questionTitle.question,
            questionDescription.question,
            questionStartTime.question,
            questionDurationTime.question,
        ];
    }

    /**
     * @method show
     * @description Show the questions and return the answers
     * @async
     * @returns 
     *      {boolean} isValid
     *      { {description: string[]}, {start: string[]}, {duration: string[]} } validationErrors
     *      {string} fileName
     *      {string} description
     *      {number} start
     *      {number} duration
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
                fileName,
                description,
                title,
                start,
                duration,
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
                fileName,
                description,
                title,
                start,
                duration,
            };
          
        }
        catch(err){
            throw err;
        }
    }
    _validateAnswers(answers){
        let isValid = false;
        const validationErrors = {
            filename: [],
            description: [],
            start: [],
            duration: [],
            title: [],
        };

        let isFilenameValid = false;
        const fileName = answers[QuestionIds.DESCRIPTION_FILENAME_ID];
        let isDescValid = false;
        const description = answers[QuestionIds.DESCRIPTION_CONTENT_ID];
        let isStartValid = false;
        const start = (answers[QuestionIds.START_ID]);
        let isDurationValid = false;
        const duration = (answers[QuestionIds.DURATION_ID]);
        let isTitleValid = false;
        const title = answers[QuestionIds.DESCRIPTION_TITLE_ID];

        let isFilenameGtZero = false;
        if(fileName.length > 1){
            isFilenameGtZero = true;
        }
        else{
            validationErrors.filename.push('Description must be greater than 0');
        }
        
        let isTitleGtZero = false;
        if(title.length > 1){
            isTitleGtZero = true;
        }
        else{
            validationErrors.title.push('Title must be greater than 0');
        }
        
        let isDescGtZero = false;
        if(description.length > 1){
            isDescGtZero = true;
        }
        else{
            validationErrors.description.push('Description must be greater than 0');
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

        isFilenameValid = isFilenameGtZero;
        isDescValid = isDescGtZero;
        isTitleValid = isTitleGtZero;
        isStartValid = isStartGtZero && isStartNumber;
        isDurationValid = isDurationGtZero && isDurationNumber;
        isValid = isFilenameValid && isDescValid && isTitleValid && isStartValid && isDurationValid;
        
        return {
            isValid, 
            validationErrors,
            fileName,
            description,
            title,
            start,
            duration,
        };
    }
}
module.exports = CreateTimelineDescriptionView;

const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires MenuModels - view models
 */
const {
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
    NEW_STEP_ID: 'NEW_STEP_ID',
    NEW_STEP_TITLE: 'NEW_STEP_TITLE',
}

/**
 * @view Create a new step prompt
 */
class CreateNewStepView{

    /**
     * @constructor Creates an instance of CreateNewStepView.
     * 
     * @param {string} nextStepId - the next index in the step list e.g. "step01-"
     * 
     * @memberof CreateNewStepView
     */
    constructor(nextStepId){
        
        const stepId = `${nextStepId < 10 ? '0'+nextStepId : nextStepId}` || '01';

        const defaultPrefix = `step`;
        const defaultVal = `${defaultPrefix}${stepId}-`;
        this.prefix = defaultVal;

        /**
         * @param questionWhatIsTheNewStepId - step folder name and id
         */
        const questionWhatIsTheNewStepId = new QuestionInputModel(
            QuestionIds.NEW_STEP_ID, 
            'What is the new step name? ',
            defaultVal,
            (val)=>{
                /**
                 * @deprecated
                 * @rules MUST start "step"
                 */
                const isStep = val.substring(0,defaultPrefix.length) === defaultPrefix ? true: 'Please start with '+defaultPrefix;
                return true || isStep;
            },
            (val)=>{
                if(val === defaultVal) return val; 
                return val ? chalk.grey(`step${nextStepId}-`) + chalk.green(val) : '';
            },
        );

        /**
         * @constant questionWhatIsTheNewStepTitle - scene title
         */
         const questionWhatIsTheNewStepTitle = new QuestionInputModel(
            QuestionIds.NEW_STEP_TITLE, 
            '👉 What is the new step title? ',
            '',
            (val)=>{
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `You can't have an empty title. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        this.questions = [
            questionWhatIsTheNewStepId.question,
            questionWhatIsTheNewStepTitle.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.NEW_STEP_ID]){
                const stepName = answers[QuestionIds.NEW_STEP_ID];
                return {
                    isValid: true, /** @todo validation */
                    id: this.prefix+stepName,
                    folderName: this.prefix+stepName,
                    title: answers[QuestionIds.NEW_STEP_TITLE],
                };
            }
            else{
                throw new MissingAttributeError(QuestionIds.NEW_STEP_ID, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = CreateNewStepView;

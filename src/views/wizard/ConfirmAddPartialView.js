const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires MenuModels - view models
 */
const {
    QuestionConfirmModel,
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
    SHOULD_I_SHOW_ADD_PARTIAL: 'SHOULD_I_SHOW_ADD_PARTIAL',
}

/**
 * @view Choose a Working Directory question
 */
class ConfirmAddPartialView{

    /**
     * Creates an instance of ConfirmAddPartialView.
     * 
     * @memberof ConfirmAddPartialView
     */
    constructor(){
        
        /**
         * @param questionAddPartial - 💁‍♂️ Would you like to add a partial?
         */
        const questionAddPartial = new QuestionConfirmModel(
            QuestionIds.SHOULD_I_SHOW_ADD_PARTIAL, 
            chalk.italic.greenBright('💁 Would you like to add a partial? 💁'),
            true,
            (val) => {
                switch(val){
                    case 'true':
                    case 'ok':
                    case 'yes':
                    case 'false':
                    case 'no':
                        return true;
                    default:
                        return `You must enter "true", "ok", "yes" OR "false", "no". You entered: ${val}.`;
                }
            },
        );

        this.questions = [
            questionAddPartial.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.SHOULD_I_SHOW_ADD_PARTIAL]){
                const answer = answers[QuestionIds.SHOULD_I_SHOW_ADD_PARTIAL];
                return this._validate(answer);
            }
            else{
                throw new MissingAttributeError(QuestionIds.SHOULD_I_SHOW_ADD_PARTIAL, answers);
            }
        }
        catch(err){
            throw err;
        }
    }
    _validate(val){
        switch(val){
            case 'true':
            case 'ok':
            case 'yes':
                return true;
            case 'false':
            case 'no':
                return false;
            default:
                throw new Error(chalk.red(`💩 You must enter "true", "ok", "yes" OR "false", "no". You entered: ${val}.`));
        }
    }

}
module.exports = ConfirmAddPartialView;

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
    SHOULD_I_INIT_PLAYBOOK: 'SHOULD_I_INIT_PLAYBOOK',
}

/**
 * @view Should I Init the Playbook?
 */
class ShouldIInitPlaybookView{

    /**
     * Creates an instance of ShouldIInitPlaybookView.
     * 
     * @memberof ShouldIInitPlaybookView
     */
    constructor(){
        
        /**
         * @param questionInitPlaybook - 💁‍♂️ Would you like to add a partial?
         */
        const questionInitPlaybook = new QuestionConfirmModel(
            QuestionIds.SHOULD_I_INIT_PLAYBOOK, 
            chalk.italic.greenBright('💁 Would you like to init the playbook? 💁'),
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
            questionInitPlaybook.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.SHOULD_I_INIT_PLAYBOOK]){
                const answer = answers[QuestionIds.SHOULD_I_INIT_PLAYBOOK];
                return this._validate(answer);
            }
            else{
                throw new MissingAttributeError(QuestionIds.SHOULD_I_INIT_PLAYBOOK, answers);
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
module.exports = ShouldIInitPlaybookView;

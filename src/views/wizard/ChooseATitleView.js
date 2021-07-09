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
    PLAYBOOK_TITLE_ID: 'keyPlaybookFolder',
}

/**
 * @view Choose a Working Directory question
 */
class ChooseATitleView{

    /**
     * Creates an instance of ChooseATitleView.
     * 
     * @memberof ChooseATitleView
     */
    constructor(){
        
        /**
         * @param questionTitle - what's the playbook name?
         */
        const questionTitle = new QuestionInputModel(
            QuestionIds.PLAYBOOK_TITLE_ID, 
            'What\'s the playbook name?',
            '',
            (val)=>{
                return val.length > 0 ? true: 'Must be longer!';
            },
        );

        this.questions = [
            questionTitle.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.PLAYBOOK_TITLE_ID]){
                return answers[QuestionIds.PLAYBOOK_TITLE_ID];
            }
            else{
                throw new MissingAttributeError(QuestionIds.PLAYBOOK_TITLE_ID, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ChooseATitleView;

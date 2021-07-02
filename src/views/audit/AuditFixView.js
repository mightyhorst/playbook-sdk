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
    UPDATE_PLAYBOOK: 'UPDATE_PLAYBOOK',
    CREATE_FOLDERS: 'CREATE_FOLDERS',
}

/**
 * @view Fix the missing folders and playbook.json gaps
 */
class AuditFixView{

    /**
     * @constructor Creates an instance of AuditFixView.
     * 
     * @memberof AuditFixView
     */
    constructor(){
        
        /**
         * @constant questionUpdatePlaybook - do you want to update playbook
         */
        const questionUpdatePlaybook = new QuestionConfirmModel(
            QuestionIds.UPDATE_PLAYBOOK, 
            'Should I update the playbook.json?',
            true,
        );
        
        /**
         * @constant questionUpdatePlaybook - do you want to update playbook
         */
        const questionCreateFolders = new QuestionConfirmModel(
            QuestionIds.CREATE_FOLDERS, 
            'Should I create the missing folders?',
            true,
        );

        this.questions = [
            questionUpdatePlaybook.question,
            questionCreateFolders.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers){
                return {
                    shouldIUpdatePlaybookJson: answers[QuestionIds.UPDATE_PLAYBOOK],
                    shouldICreateMissingFolders: answers[QuestionIds.CREATE_FOLDERS],
                }
            }
            else{
                throw new MissingAttributeError(QuestionIds.UPDATE_PLAYBOOK, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = AuditFixView;
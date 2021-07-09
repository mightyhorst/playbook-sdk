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
    PLAYBOOK_FOLDER: 'keyPlaybookFolder',
}

/**
 * @view Choose a Working Directory question
 */
class ChooseWorkingDirView{

    /**
     * Creates an instance of ChooseWorkingDirView.
     * 
     * @param {string?} optionalWorkingDir - optional working directory
     * 
     * @memberof ChooseWorkingDirView
     */
    constructor(optionalWorkingDir){
        
        /**
         * @param keyPlaybookFolder - path to install the playbook (default cwd)
         */
        const defaultFolder = optionalWorkingDir || './';
        const questionPlaybookFolder = new QuestionInputModel(
            QuestionIds.PLAYBOOK_FOLDER, 
            'Where shall we look for playbook files and folders? (hit enter for the current folder)',
            defaultFolder,
            (val)=>{
                return val.substring(0,2) === defaultFolder ? true: 'Please start with '+defaultFolder;
            },
            (val)=>{
                if(val === defaultFolder) return val; 
                // return val ? chalk.grey(defaultFolder) + chalk.green('learn2code-graphql') + chalk.grey('/')  : '';
                return val;
            },
        );

        this.questions = [
            questionPlaybookFolder.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.PLAYBOOK_FOLDER]){
                return answers[QuestionIds.PLAYBOOK_FOLDER];
            }
            else{
                throw new MissingAttributeError(QuestionIds.PLAYBOOK_FOLDER, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ChooseWorkingDirView;

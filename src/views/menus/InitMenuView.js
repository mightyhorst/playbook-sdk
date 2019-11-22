const inquirer = require('inquirer');
const chalk = require('chalk');

const MenuModels = require('../../models/menus/index');
const QuestionChoiceModel = MenuModels.Question.ChoiceModel;
const QuestionListModel = MenuModels.Question.ListModel;
const QuestionInputModel = MenuModels.Question.InputModel;

class InitMenuView{

    /**
     * Creates an instance of InitMenuView.
     * 
     * @param {*} choiceModels
     * @memberof InitMenuView
     */
    constructor(choiceModels){

        /**
         * @param keyChosenExample - which example to use 
         */
        const questionListModel = new QuestionListModel(
            'keyChosenExample', 
            'Which example do you want to use?', 
            choiceModels
        );

        /**
         * @param keyPlaybookName - playbook file name 
         */
        const defaultPlaybookName = 'hello.playbook.js';
        const questionPlaybookName = new QuestionInputModel(
            'keyPlaybookName', 
            'What shall we call this playbook?',
            defaultPlaybookName,
            (val)=>{
                return val.length > 1 ? true: 'Please enter more than 1 letters';
            },
            (val)=>{
                if(val === defaultPlaybookName) return val; 
                return val ? chalk.green(val) + chalk.grey('.playbook.js') : '';
            },
        );
        
        /**
         * @param keyPlaybookFolder - path to install the playbook (default cwd)
         */
        const questionPlaybookFolder = new QuestionInputModel(
            'keyPlaybookFolder', 
            'Where shall we install the playbook file and folders? (hit enter for this folder)',
            './'
        );

        this.questions = [
            questionListModel.question,
            questionPlaybookName.question,
            questionPlaybookFolder.question
        ];
    }

    createMenu(){

    }

    show(){
        let showMenu;
        try{
            showMenu = inquirer.prompt(this.questions);
            return showMenu;
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = InitMenuView;
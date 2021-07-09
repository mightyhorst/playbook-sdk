const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires ViewModels
 */
// const MenuModels = require('../../models/menus/index');
// const ChoiceModel = require('../../models/menus/ChoiceModel');
// const QuestionChoiceModel = MenuModels.Question.ChoiceModel;
// const QuestionListModel = MenuModels.Question.ListModel;
// const QuestionInputModel = MenuModels.Question.InputModel;
const {
    ChoiceModel,
    QuestionListModel,
    QuestionInputModel,
} = require('../../models/menus');

/**
 * @requires Errors
 */
const MissingAttributeError = require('../../errors/missing-attr.error');

class ChooseCategoryView{

    /**
     * Creates an instance of ChooseCategoryView.
     * 
     * @param {string[]} categories - list of category names
     * 
     * @memberof ChooseCategoryView
     */
    constructor(categories){

        this.exitLabel = '👋 Exit';
        this.newCategoryLabel = 'Create a New Category';

        let choiceModelsForCats = categories.map(cat => {
            const choiceModel = new ChoiceModel(false, cat);
            return choiceModel;
        });

        /**
         * @const {ChoiceModel[]} choiceModels - choose a category menu
         */
        const choiceModels = [
            ...choiceModelsForCats,
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.newCategoryLabel,
            ),
            new ChoiceModel(
                false,
                this.exitLabel,
            ),
            new ChoiceModel(true),
        ];        

        /**
         * @param keyChosenCategory - which category to use 
         */
        const questionListModel = new QuestionListModel(
            'keyChosenCategory', 
            'Which category do you want to use?', 
            choiceModels,
        );

        /**
         * @param keyPlaybookName - playbook file name 
         */
        // const defaultPlaybookName = 'hello.playbook.js';
        // const questionPlaybookName = new QuestionInputModel(
        //     'keyPlaybookName', 
        //     'What shall we call this playbook?',
        //     defaultPlaybookName,
        //     (val)=>{
        //         return val.length > 1 ? true: 'Please enter more than 1 letters';
        //     },
        //     (val)=>{
        //         if(val === defaultPlaybookName) return val; 
        //         return val ? chalk.green(val) + chalk.grey('.playbook.js') : '';
        //     },
        // );
        
        /**
         * @param keyPlaybookFolder - path to install the playbook (default cwd)
         */
        // const defaultFolder = './';
        // const questionPlaybookFolder = new QuestionInputModel(
        //     'keyPlaybookFolder', 
        //     'Where shall we install the playbook file and folders? (hit enter for this folder)',
        //     defaultFolder,
        //     (val)=>{
        //         return val.substring(0,2) === defaultFolder ? true: 'Please start with '+defaultFolder;
        //         // return val.length > 1 ? true: 'Please enter more than 1 letters';
        //     },
        //     (val)=>{
        //         if(val === defaultFolder) return val; 
        //         return val ? chalk.grey(defaultFolder) + chalk.green('learn2code-graphql') + chalk.grey('/')  : '';
        //     },
        // );

        this.questions = [
            questionListModel.question,
            // questionPlaybookName.question,
            // questionPlaybookFolder.question,
        ];
    }

    createMenu(){

    }

    async show(){
        try{
            const answers = await inquirer.prompt(this.questions);

            const chosenCat = answers.keyChosenCategory;

            if(chosenCat){
                return {
                    isExit: chosenCat === this.exitLabel,
                    isNew: chosenCat === this.newCategoryLabel,
                    value: chosenCat,
                };
            }
            else{
                throw new MissingAttributeError('keyChosenCategory', answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ChooseCategoryView;
const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires ViewModels
 */
const {
    ChoiceModel,
    QuestionListModel,
    QuestionInputModel,
} = require('../../models/menus');

/**
 * @requires Errors
 */
const MissingAttributeError = require('../../errors/missing-attr.error');

class ShowStepMenuView{

    /**
     * Creates an instance of ShowStepMenuView.
     * 
     * @memberof ShowStepMenuView
     */
    constructor(){

        this.BACK = '👈 Back to Choose Step';
        this.EDIT_TIMELINE = '⏰ Edit timeline';
        this.DELETE_TIMELINE = '❌ Delete timeline';
        this.ADD_DESCRIPTION = '📗 Add Description';
        this.ADD_CODE = '👾 Add Code';
        this.ADD_TEST = '🎓 Add Test';
        this.ADD_CLI = '💻 Add Command';
        this.ADD_AUDIO = '🎬 Add Audio/Video';
        this.EXIT = '👋 Exit';

        /**
         * @const {ChoiceModel[]} choiceModels - choose a step menu
         */
        const choiceModels = [
            new ChoiceModel(
                false,
                this.BACK,
            ),
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.EDIT_TIMELINE,
            ),
            new ChoiceModel(
                false,
                this.DELETE_TIMELINE,
            ),
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.ADD_DESCRIPTION,
            ),
            new ChoiceModel(
                false,
                this.ADD_CODE,
            ),
            new ChoiceModel(
                false,
                this.ADD_TEST,
            ),
            new ChoiceModel(
                false,
                this.ADD_CLI,
            ),
            new ChoiceModel(
                false,
                this.ADD_AUDIO,
            ),
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.EXIT,
            ),
        ];        

        /**
         * @param keyChosenStep - which step to use 
         */
        const questionListModel = new QuestionListModel(
            'keyChosenStep', 
            'Which step do you want to use?', 
            choiceModels,
        );

        this.questions = [
            questionListModel.question,
        ];
    }

    async show(){
        try{
            const answers = await inquirer.prompt(this.questions);

            const chosenStep = answers.keyChosenStep;

            if(chosenStep){
                return chosenStep;
            }
            else{
                throw new MissingAttributeError('keyChosenStep', answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ShowStepMenuView;

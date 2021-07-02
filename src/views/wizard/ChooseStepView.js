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

class ChooseStepView{

    /**
     * Creates an instance of ChooseStepView.
     * 
     * @param {string[]} steps - list of step names
     * 
     * @memberof ChooseStepView
     */
    constructor(steps){

        this.exitLabel = '👋 Exit';
        this.backLabel = '👈 Back';
        this.newStepLabel = 'Create a New Step';

        let choiceModelsForSteps = steps.map(step => {
            const choiceModel = new ChoiceModel(false, step);
            console.log(choiceModel.choice);
            return choiceModel;
        });

        /**
         * @const {ChoiceModel[]} choiceModels - choose a step menu
         */
        const choiceModels = [
            new ChoiceModel(
                false,
                this.backLabel,
            ),
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.newStepLabel,
            ),
            new ChoiceModel(true),
            ...choiceModelsForSteps,
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.exitLabel,
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
                return {
                    isNew: chosenStep === this.newStepLabel,
                    isBack: chosenStep === this.backLabel,
                    isExit: chosenStep === this.exitLabel,
                    value: chosenStep,
                };
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
module.exports = ChooseStepView;
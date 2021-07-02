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

class ChooseSceneView{

    /**
     * Creates an instance of ChooseSceneView.
     * 
     * @param {string[]} scenes - list of scene names
     * 
     * @memberof ChooseSceneView
     */
    constructor(scenes){

        this.exitLabel = '👋 Exit';
        this.backLabel = '👈 Back';
        this.newSceneLabel = 'Create a New Scene';

        let choiceModelsForScenes = scenes.map(scene => {
            const choiceModel = new ChoiceModel(false, scene);
            return choiceModel;
        });

        /**
         * @const {ChoiceModel[]} choiceModels - choose a scene menu
         */
        const choiceModels = [
            new ChoiceModel(
                false,
                this.backLabel,
            ),
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.newSceneLabel,
            ),
            new ChoiceModel(true),
            ...choiceModelsForScenes,
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.exitLabel,
            ),
        ];        

        /**
         * @param keyChosenScene - which scene to use 
         */
        const questionListModel = new QuestionListModel(
            'keyChosenScene', 
            'Which scene do you want to use?', 
            choiceModels,
        );

        this.questions = [
            questionListModel.question,
        ];
    }

    async show(){
        try{
            const answers = await inquirer.prompt(this.questions);

            const chosenScene = answers.keyChosenScene;

            if(chosenScene){
                return {
                    isBack: chosenScene === this.backLabel,
                    isExit: chosenScene === this.exitLabel,
                    isNew: chosenScene === this.newSceneLabel,
                    value: chosenScene,
                };
            }
            else{
                throw new MissingAttributeError('keyChosenScene', answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ChooseSceneView;
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

/**
 * @constant QuestionIds
 */
const QuestionIds = {
    CHOOSE_PARTIAL_TO_EDIT: 'CHOOSE_PARTIAL_TO_EDIT',
};

class ChoosePartialView{

    /**
     * Creates an instance of ChoosePartialView.
     * 
     * @param {PlaybookTimelineCodePartialModel[]} partialModels - list of PlaybookTimelineCodePartialModel's 
     * 
     * @memberof ChoosePartialView
     */
    constructor(partialModels){

        this.exitLabel = '👋 Exit';
        this.backLabel = '👈 Back';

        this.CODE_ICON = '👾';

        this.timelineModels = partialModels;

        let choiceModelsForTimelines = partialModels.map(partial => {
            const icon = this.CODE_ICON;
            const choiceModel = new ChoiceModel(false, `${icon} ${partial.partialId}`);
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
            ...choiceModelsForTimelines,
            new ChoiceModel(true),
            new ChoiceModel(
                false,
                this.exitLabel,
            ),
        ];        

        /**
         * @param questionWhichPartial - chose which step to edit
         */
        const questionWhichPartial = new QuestionListModel(
            QuestionIds.CHOOSE_PARTIAL_TO_EDIT, 
            'Which partial do you want to edit?', 
            choiceModels,
        );

        this.questions = [
            questionWhichPartial.question,
        ];
    }

    async show(){
        try{
            const answers = await inquirer.prompt(this.questions);

            let chosenStep = answers[QuestionIds.CHOOSE_PARTIAL_TO_EDIT];
            const isBack = chosenStep === this.backLabel;
            const isExit = chosenStep === this.exitLabel;

            let removeIcon = chosenStep.split(' ');
            removeIcon.shift();
            chosenStep = removeIcon.join(' ');

            if(chosenStep){
                return {
                    isBack,
                    isExit,
                    chosenStep,
                };
            }
            else{
                throw new MissingAttributeError(QuestionIds.CHOOSE_PARTIAL_TO_EDIT, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = ChoosePartialView;

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
    CHOOSE_TIMELINE_TO_EDIT: 'CHOOSE_TIMELINE_TO_EDIT',
};

class EditTimelineView{

    /**
     * Creates an instance of EditTimelineView.
     * 
     * @param {PlaybookTimelineModel[]} timelineModels - list of timeline models
     * @param {PlaybookTimelineCodePartialModel[]} partialModels - list of partial models
     * 
     * @memberof EditTimelineView
     */
    constructor(timelineModels, partialModels){

        this.exitLabel = '👋 Exit';
        this.backLabel = '👈 Back';

        this.DESCRIPTION_ICON = '📗';
        this.CODE_ICON = '👾';
        this.PARTIAL_ICON = '👾📦';
        this.TEST_ICON = '🎓';
        this.BROWSER_ICON = '🌎';
        this.CLI_ICON = '💻';
        this.AUDIO_ICON = '🎬';
        this.VIDEO_ICON = '🎬';

        this.timelineModels = timelineModels;
        this.partialModels = partialModels || [];
        const allModels = [
            ...this.timelineModels,
            ...this.partialModels,
        ];

        let choiceModelsForTimelines = allModels.map(timelineOrPartial => {
            let icon;
            switch(timelineOrPartial.panel){
                case 'description':
                    icon = this.DESCRIPTION_ICON;
                    break;
                case 'code':
                    icon = this.CODE_ICON;
                    break;
                case 'partial':
                    icon = this.PARTIAL_ICON;
                    break;
                case 'test':
                    icon = this.TEST_ICON;
                    break;
                case 'browser':
                    icon = this.BROWSER_ICON;
                    break;
                case 'audio':
                    icon = this.AUDIO_ICON;
                    break;
                case 'video':
                    icon = this.VIDEO_ICON;
                    break;
                case 'terminal':
                    icon = this.CLI_ICON;
                    break;
            }
            let title;
            if(timelineOrPartial.panel === 'partial' && timelineOrPartial.hasOwnProperty('partialId')){
                title = timelineOrPartial.partialId;
            }
            else if(timelineOrPartial.hasOwnProperty('title')){
                title = timelineOrPartial.title;
            }
            else{
                throw new Error(chalk.red(`💩 I had problem showing the edit timeline, because I was missing a "title" or "partialId"`)+JSON.stringify(timelineOrPartial, null, 4));
            }
            console.log(`\n\n\n ====> timelineOrPartial: \n`, {timelineOrPartial});
            const choiceModel = new ChoiceModel(false, `${icon} ${title}`);
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
         * @param questionListModel - chose which step to edit
         */
        const questionListModel = new QuestionListModel(
            QuestionIds.CHOOSE_TIMELINE_TO_EDIT, 
            'Which timeline do you want to edit?', 
            choiceModels,
        );

        this.questions = [
            questionListModel.question,
        ];
    }

    _isPartial(chosen){
        return chosen.includes(this.PARTIAL_ICON);
    }

    async show(){
        try{
            const answers = await inquirer.prompt(this.questions);

            let chosen = answers[QuestionIds.CHOOSE_TIMELINE_TO_EDIT];
            const isBack = chosen === this.backLabel;
            const isExit = chosen === this.exitLabel;
            const isPartial = this._isPartial(chosen);

            /**
             * @step remove icon
             */
            let chosenParts = chosen.split(' ');
            chosenParts.shift();
            chosen = chosenParts.join(' ');

            if(chosen){
                return {
                    isBack,
                    isExit,
                    isPartial,
                    chosen,
                };
            }
            else{
                throw new MissingAttributeError(QuestionIds.CHOOSE_TIMELINE_TO_EDIT, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = EditTimelineView;

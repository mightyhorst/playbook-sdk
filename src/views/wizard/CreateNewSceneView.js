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
    NEW_SCENE_ID: 'NEW_SCENE_ID',
    NEW_SCENE_TITLE: 'NEW_SCENE_TITLE',
}

/**
 * @view Create a new scene prompt
 */
class CreateNewSceneView{

    /**
     * @constructor Creates an instance of CreateNewSceneView.
     * 
     * @param {string} nextSceneId - the next index in the scene list e.g. "scene01-"
     * 
     * @memberof CreateNewSceneView
     */
    constructor(nextSceneId){
        
        const sceneId = `${nextSceneId < 10 ? '0'+nextSceneId : nextSceneId}` || '01';

        const defaultPrefix = `scene`;
        const defaultVal = `${defaultPrefix}${sceneId}-`;
        this.prefix = defaultVal;

        /**
         * @param questionWhatIsTheNewSceneId - scene folder name and id
         */
        const questionWhatIsTheNewSceneId = new QuestionInputModel(
            QuestionIds.NEW_SCENE_ID, 
            '👉 What is the new scene folder name (and id)? ',
            defaultVal,
            (val)=>{
                /**
                 * @deprecated
                 * @rules MUST start "scene"
                 */
                const isScene = val.substring(0,defaultPrefix.length) === defaultPrefix ? true: 'Please start with '+defaultPrefix;
                return true || isScene;
            },
            (val)=>{
                if(val === defaultVal) return val; 
                return val ? chalk.grey(`scene${nextSceneId}-`) + chalk.green(val) : '';
            },
        );

        /**
         * @constant questionWhatIsTheNewSceneTitle - scene title
         */
         const questionWhatIsTheNewSceneTitle = new QuestionInputModel(
            QuestionIds.NEW_SCENE_TITLE, 
            '👉 What is the new scene title? ',
            '',
            (val)=>{
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `You can't have an empty title. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        this.questions = [
            questionWhatIsTheNewSceneId.question,
            questionWhatIsTheNewSceneTitle.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.NEW_SCENE_ID]){
                const sceneName = answers[QuestionIds.NEW_SCENE_ID];
                return {
                    isValid: true, /** @todo validation */
                    id: this.prefix+sceneName,
                    folderName: this.prefix+sceneName,
                    title: answers[QuestionIds.NEW_SCENE_TITLE],
                };
            }
            else{
                throw new MissingAttributeError(QuestionIds.NEW_SCENE_ID, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = CreateNewSceneView;
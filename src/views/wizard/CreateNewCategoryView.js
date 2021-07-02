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
    NEW_CATEGORY_ID: 'NEW_CATEGORY_ID',
    NEW_CATEGORY_TITLE: 'NEW_CATEGORY_TITLE',
}

/**
 * @view Create a new category prompt
 */
class CreateNewCategoryView{

    /**
     * @constructor Creates an instance of CreateNewCategoryView.
     * 
     * @param {string} nextCatId - the next index in the category list e.g. "cat01-"
     * 
     * @memberof CreateNewCategoryView
     */
    constructor(nextCatId){
        
        const catId = `${nextCatId < 10 ? '0'+nextCatId : nextCatId}` || '01';

        const defaultPrefix = `cat`;
        const defaultVal = `${defaultPrefix}${catId}-`;
        this.prefix = defaultVal;

        /**
         * @constant questionWhatIsTheNewCategoryId - folder name and ID of the category
         */
        const questionWhatIsTheNewCategoryId = new QuestionInputModel(
            QuestionIds.NEW_CATEGORY_ID, 
            '👉 What is the new category folder name (and id)? ',
            defaultVal,
            (val)=>{
                /**
                 * @deprecated
                 * @rules MUST start "cat"
                 */
                const isCat = val.substring(0,defaultPrefix.length) === defaultPrefix ? true: 'Please start with '+defaultPrefix;
                return true || isCat;
            },
            (val)=>{
                if(val === defaultVal) return val; 
                return val ? chalk.grey(`cat${nextCatId}-`) + chalk.green(val) : '';
            },
        );

        /**
         * @constant questionWhatIsTheNewCategoryTitle - category title
         */
         const questionWhatIsTheNewCategoryTitle = new QuestionInputModel(
            QuestionIds.NEW_CATEGORY_TITLE, 
            '👉 What is the new category title? ',
            '',
            (val)=>{
                const isGreaterThanZero = val.length > 0;
                if(!isGreaterThanZero) 
                    return `You can't have an empty title. \n\nreceived: ${val}\n`;
                return true;
            },
        );

        this.questions = [
            questionWhatIsTheNewCategoryId.question,
            questionWhatIsTheNewCategoryTitle.question,
        ];
    }

    async show(){
        
        try{
            const answers = await inquirer.prompt(this.questions);
            if(answers[QuestionIds.NEW_CATEGORY_ID]){
                const categoryName = answers[QuestionIds.NEW_CATEGORY_ID];
                return {
                    isValid: true, /** @todo validation */
                    id: this.prefix+categoryName,
                    folderName: this.prefix+categoryName,
                    title: answers[QuestionIds.NEW_CATEGORY_TITLE],
                };
            }
            else{
                throw new MissingAttributeError(QuestionIds.NEW_CATEGORY_ID, answers);
            }
        }
        catch(err){
            throw err;
        }
    }

}
module.exports = CreateNewCategoryView;
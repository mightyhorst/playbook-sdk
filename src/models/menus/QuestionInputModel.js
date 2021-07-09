const QuestionModel = require('./QuestionModel');

class QuestionInputModel extends QuestionModel{
    
    /**
     * @constructor
     * @param {string} questionId - question ID and key in the answers object 
     * @param {string} message - quetion to the user
     * @param {string} defaultMsg - default answer
     * @param {()=>boolean} validate - validator function
     * @param {()=>any} transformInput - transform the prompt before the return value in the answers object
     * @param {()=>any} transformOutput - filter the result before returned
     * @param {()=>boolean} shouldIshow - should I show this question
     */
    constructor(questionId, message, defaultMsg, validate, transformInput, transformOutput, shouldIshow){
        
        super(questionId, message);
        this.question.type = 'input';
        this.question.default = () => defaultMsg || '';

        if(validate)
            this.question.validate = validate;

        if(transformInput)
            this.question.transformer = transformInput;
        
        if(transformOutput)
            this.question.filter = transformOutput;
        
        if(shouldIshow)
            this.question.when = shouldIshow;
    }

    /*
    getQuestion(){
        return this.question;
    }
    */
}
module.exports = QuestionInputModel;
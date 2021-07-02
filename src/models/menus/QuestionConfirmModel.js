const QuestionModel = require('./QuestionModel');

class QuestionConfirmModel extends QuestionModel{
    
    /**
     * 
     * @param {string} questionId - question ID and key in the answers object 
     * @param {string} message - quetion to the user
     * @param {boolean} defaultVal - default answer
     * @param {()=>boolean} validate - validator function
     * @param {()=>any} transformer - transform the prompt before the return value in the answers object
     */
    constructor(questionId, message, defaultVal, validate, transformer, optionalPrefix){
        
        super(questionId, message);
        this.question.type = 'check';
        this.question.default = !!defaultVal;

        if(validate)
            this.question.validate = validate;

        if(transformer)
            this.question.transformer = transformer;
    }

    /*
    getQuestion(){
        return this.question;
    }
    */
}
module.exports = QuestionConfirmModel;
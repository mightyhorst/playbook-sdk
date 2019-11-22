const QuestionModel = require('./QuestionModel');

class QuestionInputModel extends QuestionModel{
    
    constructor(varName, message, defaultMsg, validate, transformer){
        
        super(varName, message);
        this.question.type = 'input';
        this.question.default = () => defaultMsg || '';

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
module.exports = QuestionInputModel;
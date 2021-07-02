const QuestionModel = require('./QuestionModel');

class QuestionEditorModel extends QuestionModel{
    
    /**
     * 
     * @param {string} questionId - question ID and key in the answers object 
     * @param {string} message - quetion to the user
     * @param {string} defaultMsg - default answer
     * @param {()=>boolean} validate - validator function
     * @param {()=>any} transformer - transform the answer before the return value in the answers object
     * @param {string} optionalEditor - optional editor e.g. 'node' or 'code'
     */
    constructor(questionId, message, defaultMsg, validate, transformer, optionalEditor){
        
        super(questionId, message);
        process.env.EDITOR = optionalEditor || 'nano';
        this.question.type = 'editor';
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
module.exports = QuestionEditorModel;
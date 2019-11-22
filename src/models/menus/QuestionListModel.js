const QuestionModel = require('./QuestionModel');

class QuestionListModel extends QuestionModel{
    
    constructor(varName, message, choiceModels){
        
        super(varName, message);

        this.question.type = 'list';
        this.question.choices = choiceModels.map(model=>model.choice);
    }

    getQuestion(){
        return this.question;
    }

}
module.exports = QuestionListModel;
const QuestionModel = require('./QuestionModel');

class QuestionListModel extends QuestionModel{
    
    /**
     * 
     * @param {string} varName - key name
     * @param {string} message - message or question to ask the user
     * @param {string[]} choiceModels - array of choices to display as a select menu
     */
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
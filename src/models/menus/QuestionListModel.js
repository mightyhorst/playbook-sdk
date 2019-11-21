class QuestionListModel extends QuestionModel{
    
    constructor(varName, message, choiceModels){
        super(varName, message);
        this.questions = {
            choices: choiceModels.map(model=>model.choice)
        }
    }

}
module.exports = QuestionListModel;
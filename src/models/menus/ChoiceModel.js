const inquirer = require('inquirer');

class ChoiceModel{
    
    constructor(isSeperator, varName, isDisabled){
        if(isSeperator)
            this.choice = new inquirer.Separator()
        else
            this.choice = {
                name: varName,
                isDisabled: isDisabled || false
            }
    }

}
module.exports = QuestionModel;
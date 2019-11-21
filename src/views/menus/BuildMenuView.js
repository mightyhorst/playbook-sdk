const inquirer = require('inquirer');

const MenuModels = require('../../models/menus/index');
const QuestionChoiceModel = MenuModels.Question.ChoiceModel;
// const QuestionChoiceModel = require('../../models/menus/ChoiceModel');
const QuestionListModel = MenuModels.Question.ListModel;

class BuildMenuView{

    constructor(){

        const choiceModels = [
            new QuestionChoiceModel(false, 'Hello World example'),
            new QuestionChoiceModel(false, 'Simple example'),
        ];
        const questionListModel = new QuestionListModel('varChosenExample', 'Which example do you want to use?', choiceModels)
        this.questions = questionListModel.questions;
    }

    createMenu(){

    }

}
module.exports = new BuildMenuView();
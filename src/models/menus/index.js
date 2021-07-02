module.exports = {
    ChoiceModel: require('./ChoiceModel'),
    QuestionListModel: require('./QuestionListModel'),
    QuestionInputModel: require('./QuestionInputModel'),
    QuestionConfirmModel: require('./QuestionConfirmModel'),
    QuestionEditorModel: require('./QuestionEditorModel'),
    /**
     * @deprecated 
     */
    Question: {
        ChoiceModel: require('./ChoiceModel'),
        ListModel: require('./QuestionListModel'),
        InputModel: require('./QuestionInputModel'),
        EditorModel: require('./QuestionEditorModel'),
    },
}

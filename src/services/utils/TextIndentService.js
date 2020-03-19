module.exports = {
    indent: (numberOfTabs) => {
        let indent = "";

        for (var i = 0; i < numberOfTabs; i++)
        {
            indent += "\t";
        }

        return indent;
    },
    formatToStringOrNum: (value) => {
        return isNaN(value) ? '"' + value + '"' : value;
    }
}
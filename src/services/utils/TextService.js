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
    },
    numberFormatter: (num) => {
        if ((num + "").length > 2)
        {
            return num;
        }
        else
        {
            return ("0" + num).slice(-2);
        }
    }
}
const chalk = require('chalk');

class LogService
{

    success(msg, topPaddingHeight = 2, bottomPaddingHeight = 2)
    {
        const chalkedMsg = chalk.green(msg);
        this.printMsg(chalkedMsg, topPaddingHeight, bottomPaddingHeight)
    }

    error(msg, topPaddingHeight = 2, bottomPaddingHeight = 2)
    {
        const chalkedMsg = chalk.red(msg);
        this.printMsg(chalkedMsg, topPaddingHeight, bottomPaddingHeight)
    }

    



    /***********************************
     * 
     * Private Functions
     * 
     ***********************************/
    printMsg(chalkedMsg, topPaddingHeight, bottomPaddingHeight)
    {
        const topPadding = this.generateVerticalPadding(topPaddingHeight);
        const bottomPadding = this.generateVerticalPadding(bottomPaddingHeight);

        console.log(`${topPadding}${chalkedMsg}${bottomPadding}`);
    }


    generateVerticalPadding(paddingHeight)
    {
        let padding = "";

        for (let i = 0; i < paddingHeight; i++)
        {
            padding += "\n";
        }

        return padding;
    }
}

module.exports = new LogService();
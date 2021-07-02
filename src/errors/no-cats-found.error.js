const chalk = require('chalk');
class NoCategoriesFoundError extends Error
{
    constructor(
        path,
        filesAndFolders,
    )
    {
        super(chalk.redBright(`The could not find any categories in the path: `)+chalk.bgGreen(`${path} \n`)+chalk.grey(`This is what I received:\n`)+JSON.stringify(filesAndFolders, null, 4));
    }
 
    toString()
    {
        return this.message;
    }
}

module.exports = NoCategoriesFoundError;
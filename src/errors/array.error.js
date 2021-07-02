const chalk = require('chalk');
class ArrayError extends Error
{
    constructor(
        array,
    )
    {
        super(chalk.redBright("The array is missing what you're looking for. Please check the array: \n")+chalk.grey(`This is what I received:\n`)+JSON.stringify(array, null, 4));
    }
 
    toString()
    {
        return this.message;
    }
}

module.exports = ArrayError;
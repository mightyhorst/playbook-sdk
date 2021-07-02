const chalk = require('chalk');
class MissingAttributeError extends Error
{
    constructor(
        key,
        object,
    )
    {
        super(chalk.redBright(`The key "${key}" is missing. Please check the object: \n`)+chalk.grey(`This is what I received:\n`)+JSON.stringify(object, null, 4));
    }
 
    toString()
    {
        return this.message;
    }
}

module.exports = MissingAttributeError;
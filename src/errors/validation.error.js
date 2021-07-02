const chalk = require('chalk');
class ValidationError extends Error
{
    /**
     * @constructor
     * @param {string} message - optional payload
     * @param {any} payload - object that was invalid
     * @param {string} validationErrors - missing key and message
     */
    constructor({payload, validationErrors}){
        super(
            chalk.redBright(
                `There was validation error: \n`
            ) + 
            chalk.grey(
                `This is the error:\n`
            ) +
            JSON.stringify({payload, validationErrors}, null, 4)
        );
        this.payload = payload;
        this.validationErrors = validationErrors;
    }
 
    toString(){
        return this.message;
    }
    toJson(){
        return {
            message: this.message,
            payload: this.payload,
            validationErrors: this.validationErrors,
        }
    }
    log(){
        console.error(this.toString());
    }
}

module.exports = ValidationError;
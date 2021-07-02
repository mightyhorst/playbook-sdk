const chalk = require('chalk');
class FileSystemError extends Error
{
    /**
     * 
     * @param {Error} err - the error thrown by FS module
     * @param {any?} payload - optional payload
     * @param {string?} path - path attempted to read or write too
     */
    constructor(err, path, payload){
        super(
            chalk.redBright(
                `There was file system error. Most likely a file or folder cannot be found: \n`
            ) + 
            chalk.grey(
                `This is the error:\n`
            ) +
            JSON.stringify({errorMessage: err.message}, null, 4)
        );
    }
 
    toString(){
        return this.message;
    }
    log(){
        console.error(this.toString());
    }
}

module.exports = FileSystemError;
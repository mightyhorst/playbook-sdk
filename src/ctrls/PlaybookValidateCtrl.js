const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Services 
 * @param ValidationService - Validate github URL 
 */
const PlaybookService = require('../services/PlaybookService');

 /**
 * Playbook Validate handler 
 * 
 * @api /playbook/validate
 * @calledby router 
 *
 * @class PlaybookValidateCtrl
 * @extends {Controller}
 */
class PlaybookValidateCtrl extends Controller {

    constructor()
    {
        super();
    }

    async validate(args)
    {
        try
        {
            let githubUrl = args[3];
            let githubBranchOrTag = args[4]

            if (!githubUrl)
            {
                let githubUrlAnswer = await inquirer.prompt({
                    type : "input",
                    name : "githubUrl",
                    message : "Please enter the github url that contains the playbook.json you want to validate",
                    validate: (val) => {
                        return val != "";
                    }
                })

                githubUrl = githubUrlAnswer.githubUrl;
            }

            if (!githubBranchOrTag)
            {
                let githubBranchOrTagAnswer = await inquirer.prompt({
                    type : "input",
                    name : "githubBranchOrTag",
                    message : "Which branch or tag does this playbook.json belong to?",
                    default : "master"
                })

                githubBranchOrTag = githubBranchOrTagAnswer.githubBranchOrTag;
            }

            // -- Send to the ms-playbook API for validation
            try
            {
                console.log(chalk.green("\nValidating the playbook.json file...\n"))

                await PlaybookService.validatePlaybookJson(githubUrl, githubBranchOrTag);

                console.log(chalk.green("The playbook.json file is valid!\n"))
            }
            catch(validationError)
            {
                console.error(chalk.red('============================================================\n'));
                console.log(chalk.red("The playbook.json file did not pass validation! \n"));
                console.log(chalk.red(JSON.stringify(validationError, null, 4)));
                console.log(chalk.red("\nPlease fix these errors and try again\n"));
                console.error(chalk.red('============================================================\n'));
            }
            
        }
        catch(err)
        {
            throw err;
        }
    }

}

module.exports = new PlaybookValidateCtrl();
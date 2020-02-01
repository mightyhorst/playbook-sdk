const inquirer = require('inquirer');

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Models
 */
const QuestionInputModel = require('../models/menus/QuestionInputModel');

/**
 * @requires Services 
 * @param ValidationService - Validate github URL 
 */
const ValidationService = require('../services/utils/ValidationService');
const NodeGitService = require('../services/nodegit/NodeGitService');

 /**
 * Playbook Magic handler 
 * 
 * @api /playbook/magic
 * @calledby router 
 *
 * @class PlaybookMagicCtrl
 * @extends {Controller}
 */
class PlaybookMagicCtrl extends Controller {

    constructor()
    {
        super();
    }

    /**
     * @name convertGit2Playbook
     * @description Creates a playbook from the commit history of a git repo
     * @param args - arg[3] is optional and should be the repo we read from
     * @param {string} args[1] - 'playbook'
     * @param {string} args[2] - 'magic'
     * @param {string} args[3] - 'http://github.com/user/repo' 
     */
    async convertGit2Playbook(args)
    {
        /**
         * @step 1. Get the user repo if not yet provided or the url is not a valid github url
         */
        let githubUrl = args[3];

        console.log("**************************************************")
        console.log("I've forced the github to read from https://github.com/Domnom/nodegit-tester for a simple example");
        console.log("**************************************************")
        githubUrl = "https://github.com/Domnom/nodegit-tester";

        if (!githubUrl || !ValidationService.isGithubUrl(githubUrl))
        {
            // -- Prompt user for a github repo
            // githubUrl = inquirer.prompt("YO WHERE THE GITHUB URL AT")
            let githubUrlAnswer = await inquirer.prompt({
                type : "input",
                name : "githubUrl",
                default: "https://github.com/Domnom/nodegit-tester",
                message: "What github repo would you like to convert?",
                validate: (val)=>{
                    return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                },

            })

            githubUrl = githubUrlAnswer.githubUrl;
        }
        
        /**
         * @step 2. Create the blueprints folder 
         */
        const blueprintsFolderModel = await NodeGitService.createBlueprintsFolder(githubUrl);

        process.stderr.write("\n============ Processing complete ============\n")
        process.stderr.write("\nYou can now view your blueprints folder at this path:\n\n"["green"]);
        process.stderr.write((blueprintsFolderModel.path + "\n")["yellow"]);
        process.stderr.write("\n=============================================\n\n")
        return;
    }

}

module.exports = new PlaybookMagicCtrl();
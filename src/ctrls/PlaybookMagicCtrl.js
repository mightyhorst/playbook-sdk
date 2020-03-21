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
const PlaybookService = require('../services/PlaybookService');

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
        let appAndBlueprintFolderPaths;
        let blueprintRepoData;
        try
        {
            /**
             * @step 1. Get the user repo if not yet provided or the url is not a valid github url
             */
            let githubUrl = args[3];
            let blueprintGithubUrl = args[4];

            // -- Prompt for the app github URL if it has not been provided
            if (!githubUrl || !ValidationService.isGithubUrl(githubUrl))
            {
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

            if (!blueprintGithubUrl || !ValidationService.isGithubUrl(githubUrl))
            {
                let blueprintGithubUrlAnswer = await inquirer.prompt({
                    type : "input",
                    name : "blueprintGithubUrl",
                    default: "https://github.com/Domnom/test-blueprint",
                    message: "What github repo would you like to save the blueprints to?",
                    validate: (val)=>{
                        return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                    },
                })

                blueprintGithubUrl = blueprintGithubUrlAnswer.blueprintGithubUrl;
            }

            /**
             * @step 2. Prepare app and blueprint folder paths and cleanup any old mess
             */
            appAndBlueprintFolderPaths = NodeGitService.prepareAppAndBlueprintFolderPaths(githubUrl, blueprintGithubUrl);

            /**
             * @step 3. Create or clone a git repo to store/update the blueprints 
             */
            blueprintRepoData = await NodeGitService.createOrCloneBlueprintRepoFromGithubUrl((blueprintGithubUrl ? blueprintGithubUrl : githubUrl), appAndBlueprintFolderPaths.blueprintFolderPath);
            
            if (blueprintRepoData)
            {
                /**
                 * @step 4. Create the blueprints folder with the github URL
                 */
                blueprintRepoData = await NodeGitService.createBlueprintsFolderFromGithubUrl(githubUrl, blueprintRepoData, appAndBlueprintFolderPaths.appFolderPath);

                /**
                 * @step 5. Ask if we want to build the playbook.json
                 */
                let buildPlaybookJsonFileAnswer = await inquirer.prompt({
                    type : "confirm",
                    name : "buildPlaybookJsonFile",
                    message : "Would you like to generate the playbook.json file?"
                })

                const buildPlaybookJsonFile = buildPlaybookJsonFileAnswer.buildPlaybookJsonFile

                if (buildPlaybookJsonFile)
                {
                    global.playbook = require('../playbook.sdk').playbook;
                    await PlaybookService.buildPlaybookJsonFromGithub(blueprintGithubUrl, blueprintRepoData);
                }
                else
                {
                    process.stderr.write("\nIf you would like to generate the playbook.json then run the command 'playbook build'\n")
                }

                /**
                 * @step 6. Push blueprint repo
                 */
                await NodeGitService.pushRepo(blueprintRepoData.repo, 
                                              undefined,
                                              blueprintRepoData.branch);

                process.stderr.write("\n============ Processing complete ============\n\n")
                process.stderr.write(`You can view your blueprints at the branch "${blueprintRepoData.branch}" found in the repo:\n`["green"]);
                process.stderr.write((blueprintGithubUrl + "/tree/" + blueprintRepoData.branch + "\n")["yellow"]);
                process.stderr.write("\n=============================================\n\n")
            }
        }
        catch(err)
        {
            console.error(err);
            throw err;
        }
        finally
        {
            /**
             * @step 7. Cleanup blueprint folder
             */
            this.deleteFolder(appAndBlueprintFolderPaths.blueprintFolderPath);  
            
        }
        
        return;
    }

}

module.exports = new PlaybookMagicCtrl();
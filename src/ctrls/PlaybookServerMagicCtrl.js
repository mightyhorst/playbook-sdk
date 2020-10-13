const inquirer = require('inquirer');
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
const chalk = require('chalk');
const ora = require('ora');

/**
 * @import Constants
 */
const { RoleEnum } = require('../constants/role.const');

/**
 * @import Controllers
 */
const AuthController = require('../ctrls/AuthController');

/**
 * @import Services
 */
const AuthService = require('../services/utils/AuthService');
const ValidationService = require('../services/utils/ValidationService');
const NodeGitService = require('../services/nodegit/NodeGitService');
const WorkspaceService = require('../services/microservices/playbook/workspace.service');
const PlaybookService = require('../services/microservices/playbook/playbook.service');


/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');
const { accessToken } = require('../services/utils/AuthService');
const { pause } = require('../services/typewriter/TypeWriterService');
const playbookService = require('../services/microservices/playbook/playbook.service');
const LogService = require('../services/utils/LogService');

class PlaybookServerMagicCtrl extends Controller {

    /**
     * Converts a git repo into a masterclass blueprint. This function follows a similar pattern to the 
     * Magic command but it is handled remotely
     *
     * @param {*} args
     * @memberof PlaybookServerMagicCtrl
     */
    async createBlueprintFromGitUrl(args)
    {
        // -- First setup login credentials (this will either prompt for user name and password or it will populate the AuthService)
        await AuthController.login();

        if (AuthService.accessToken)
        {
            const serverMagicSpinner = ora("")
            try
            {
                /**
                 * @Step
                 * Fetch the github url that we want to convert to a blueprint
                 */
                const appGitUrlAnswer = await inquirer.prompt({
                    type : "input",
                    name : "appGitUrl",
                    default: "https://github.com/Domnom/nodegit-tester",
                    message: "What git repo would you like to convert?",
                    validate: (val)=>{
                        return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid git URL';
                    },
                })
                const appGitUrl = appGitUrlAnswer.appGitUrl;

                /**
                 * @Step
                 * Provide an app checkout ref. A checkout ref can be a branch or tag
                 */
                const appGitCheckoutRefAnswer = await inquirer.prompt({
                    type : "input",
                    name : "appGitCheckoutRef",
                    default : "master",
                    message : "Which branch/tag would you like to convert from",
                    validate: (val) => {
                        return val.length > 0;
                    }
                })
                const appGitCheckoutRef = appGitCheckoutRefAnswer.appGitCheckoutRef;

                /**
                 * @Step
                 * Check if the github repo exists AND is public. If it doesnt then theres no point in continuing
                 */
                serverMagicSpinner.text = "Checking the app repo...";
                serverMagicSpinner.start();
                await NodeGitService.checkIfRepoExists(appGitUrl, appGitCheckoutRef);
                serverMagicSpinner.stop();

                /**
                 * @Step
                 * Fetch all the workspaces that this user belongs to and has the correct permissions to create a new playbook to
                 */
                const allWorkspaces = WorkspaceService.filterByRole(AuthService.workspaces, RoleEnum.OWNER, { cascading: true });
                let workspaceToUse;

                /**
                 * @Step
                 * Prompt the user with 'select workspace' until the workspace they select has:
                 * - Enough room for more playbooks
                 * - Any other validation things
                 */
                while(!workspaceToUse)
                {
                    /**
                     * @Step
                     * Allow the user to search and select the workspace they want to use
                     */
                    const workspaceAnswer = await inquirer.prompt([
                        {
                            type: "search-list",
                            message: "Select Workspace",
                            name: "workspace",
                            choices: allWorkspaces.map(workspaceRbac => ({name: workspaceRbac.workspace, value: workspaceRbac.workspace })),
                        }
                    ])


                    /**
                     * @Step
                     * Validate the workspace by sending to server (this will check if there is enough room in the project)
                     */
                    const workspaceApiData = await WorkspaceService.show(workspaceAnswer.workspace, AuthService.accessToken);

                    // -- TODO: Validate the number of projects to max number of projects (this will be an integration piece with stripe)
                    
                    workspaceToUse = workspaceAnswer.workspace;
                }

                
                /**
                 * @Step
                 * Prompt for a playbook name (default this to the repo name)
                 */
                let playbookNameToUse;
                
                while(!playbookNameToUse)
                {
                    const playbookNameAnswer = await inquirer.prompt({
                        type : "input",
                        name : "playbookName",
                        default: "",
                        message: "What would you like to name your playbook blueprint?",
                        validate: (val) => {
                            return val.length > 0;
                        }
                    })

                    // -- Validate the playbook name (Because we are using ora, we cannot validate within the valiate function)
                    try
                    {
                        serverMagicSpinner.text = "Validating playbook name...";
                        serverMagicSpinner.start();
                        
                        // -- Validate the playbook name with the workspace (pings the server to see if the combination exists or returns a 404)
                        await PlaybookService.validatePlaybookNameIsUnique(workspaceToUse, playbookNameAnswer.playbookName);
                        
                        serverMagicSpinner.stop();
                        
                        playbookNameToUse = playbookNameAnswer.playbookName;
                    }
                    catch(err)
                    {
                        serverMagicSpinner.stop();
                        if (err.message)
                        {
                            LogService.error(err.message, 1, 1);
                        }
                        else
                        {
                            LogService.error("Validation failed. Please try again", 1, 1);
                        }
                    }
                }
                
                /**
                 * @Step
                 * Prompt the user for an initial version
                 */
                const blueprintVersionAnswer = await inquirer.prompt({
                    type : "input",
                    name : "blueprintVersion",
                    default : "1.0.0",
                    message : "Provide the initial blueprint version (this needs to be in semver format and will be used as the published version later)",
                    validate : (val) => {
                        return !!ValidationService.checkAndGetSemver(val) ? true : "Please enter a semver valid version";
                    }
                })
                
                serverMagicSpinner.text = "Processing and create your new playbook blueprint...";
                serverMagicSpinner.start();

                let result = await PlaybookService.createBlueprintWithMagic({
                    app_git_url : appGitUrl,
                    app_git_checkout_ref : appGitCheckoutRef,
                    workspace : workspaceToUse,
                    playbook_name : playbookNameToUse,
                    blueprint_version : blueprintVersionAnswer.blueprintVersion
                }, AuthService.accessToken)

                serverMagicSpinner.stop();

                LogService.success("Your playbook blueprint has been created!");

            }
            catch(err)
            {
                // -- Disable spinner if it has been started
                if (serverMagicSpinner.isSpinning)
                {
                    serverMagicSpinner.stop();
                }
                if (err instanceof Error)
                {
                    console.log('\n\n' + chalk.red(err.toString()) + '\n\n');
                }
                else
                {
                    console.log('\n\n' + chalk.red(err) + '\n\n');
                }
            }

        }
        else
        {
            console.error(chalk.red("Unable to continue with smagic. Login is required"))
        }
    }

    
}

module.exports = new PlaybookServerMagicCtrl();
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
const ValidationService = require('../services/utils/ValidationService')

 /**
 * Playbook Validate handler 
 * 
 * @api /playbook/validate
 * @calledby router 
 *
 * @class PlaybookVersionCtrl
 * @extends {Controller}
 */
class PlaybookVersionCtrl extends Controller {

    constructor()
    {
        super();
    }


    /**
     * Update an existing playbook by adding a draft to its versions array or attempts to
     * create a new playbook with the new draft
     *
     * @param {*} args [1] = authour, [2] = playbookName, [3] = blueprintVersion, [4] = draftBlueprintGitCheckoutRef, [5] = draftAppGitCheckoutRef(if app_url is set)
     * @memberof PlaybookVersionCtrl
     */
    async draft(args)
    {
        try
        {
            let authour = args[3];
            let playbookName = args[4];
            let blueprintVersion = args[5];
            let draftBlueprintGitCheckoutRef = args[6]
            let draftAppGitCheckoutRef = args[7] // -- Optional and only if the authour has an app associated to this playbook
        
            /**
             * Authour input
             */
            if (!authour)
            {
                let authourAnswer = await inquirer.prompt({
                    type : "input",
                    name : "authour",
                    message : "Please enter the name of the authour",
                    validate: (val) => {
                        return val != "" ? true : "An authour name is required"
                    }
                })

                authour = authourAnswer.authour;
            }

            /**
             * Playbook name input
             */
            if (!playbookName)
            {
                let playbookNameAnswer = await inquirer.prompt({
                    type : "input",
                    name : "playbookName",
                    message : "Please enter the name of the playbook",
                    validate: (val) => {
                        return val != "" ? true : "A Playbook name is required"
                    }
                })

                playbookName = playbookNameAnswer.playbookName;
            }

            /**
             * Blueprint version input
             */
            if (!blueprintVersion || ( blueprintVersion && !ValidationService.checkAndGetSemver(blueprintVersion)))
            {
                let blueprintVersionAnswer = await inquirer.prompt({
                    type : "input",
                    name : "blueprintVersion",
                    message : "Please enter the intended blueprint version this draft will be for",
                    validate: (val) => {
                        return val != "" ? true : "The blueprint version must be valid semver";
                    }
                })

                blueprintVersion = blueprintVersionAnswer.blueprintVersion;
            }

            /**
             * Draft blueprint git checkout ref input
             */
            if (!draftBlueprintGitCheckoutRef)
            {
                let draftBlueprintGitCheckoutRefAnswer = await inquirer.prompt({
                    type : "input",
                    name : "draftBlueprintGitCheckoutRef",
                    message : "What is the name of the branch/tag in the blueprint repo that contains the files for this draft",
                    validate: (val) => {
                        return val != "" ? true : "A branch/tag nam for your blueprint repo is required";
                    }
                })

                draftBlueprintGitCheckoutRef = draftBlueprintGitCheckoutRefAnswer.draftBlueprintGitCheckoutRef;
            }

            // -- First we need to use the authour and playbook and check if there is a playbook to save a draft to
            console.log(chalk.green("\n\nSearching for your playbook...\n"));
            let existingPlaybookEntriesArray = await PlaybookService.getPlaybookEntry(playbookName, authour);

            if (existingPlaybookEntriesArray.length === 0)
            {
                console.log(chalk.yellow("We could not find the playbook from authour '" + authour + "' with playbook name '" + playbookName + "'\n"))
                
                const createNewPlaybookAnswer = await inquirer.prompt({
                    type : "confirm",
                    name : "createNewPlaybook",
                    message : "Would you like to create a new playbook?"
                })

                if (createNewPlaybookAnswer.createNewPlaybook)
                {
                    // -- We will need a blueprint_url in order to continue
                    const blueprintUrlAnswer = await inquirer.prompt({
                        type : "input",
                        name : "blueprintUrl",
                        message: "What github repo do your blueprint files belong in?",
                        validate: (val)=>{
                            return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                        }
                    })


                    console.log(chalk.green("Creating your new playbook\n"));

                    // -- We can only continue if we have a playbook entry so lets automatically do that
                    try
                    {
                        await PlaybookService.createPlaybookEntry(
                            playbookName, 
                            authour,
                            undefined,
                            blueprintUrlAnswer.blueprintUrl,
                            blueprintVersion,
                            undefined,
                            draftBlueprintGitCheckoutRef
                        );

                        
                        console.log(chalk.green('============================================================\n'))
                        console.log(chalk.green("Your playbook has been created! You can preview your draft at: \n\n"))
                        console.log(PlaybookService.createMasterclassUrl(authour, playbookName, blueprintVersion));
                        console.log(chalk.green('\n============================================================\n\n'))
                    }
                    catch(createPlaybookEntryError)
                    {
                        console.error(chalk.red('============================================================\n'));
                        console.error(chalk.red("There was an error creating your playbook!\n"))
                        if (typeof createPlaybookEntryError == "object")
                        {
                            console.error(JSON.stringify(createPlaybookEntryError, null, 4));
                        }
                        else
                        {
                            console.error(createPlaybookEntryError);
                        }
                        console.error(chalk.red("\nPlease resolve these errors and try again!\n"))
                        console.error(chalk.red('============================================================\n'));
                    }

                }
                else
                {
                    console.log(chalk.yellow("\nAborting draft creation. If you would like to create a draft then a playbook will be required\n"))
                }
            }
            else
            {
                console.log(chalk.green("Playbook found!\n"));

                // -- There was a playbook that was found. If there is an app then ask if we want to specify a draftAppGitCheckoutRef
                const playbookModel = existingPlaybookEntriesArray[0];

                if (playbookModel.app_url)
                {
                    const createDraftAppGitcheckoutRefAnswer = await inquirer({
                        type : "confirm",
                        name : "create",
                        message : "Your playbook contains an app url. Would you like to add branch/tag to this app for this draft?"
                    })

                    if (createDraftAppGitcheckoutRefAnswer.create)
                    {
                        const draftAppGitCheckoutRefAnswer = await inquirer({
                            type : "input",
                            name : "draftAppGitCheckoutRef",
                            message: "Please enter the name of the branch/tag to access the app data",
                            default: "master"
                        })

                        draftAppGitCheckoutRef = draftAppGitCheckoutRefAnswer.draftAppGitCheckoutRef != "" ? draftAppGitCheckoutRefAnswer.draftAppGitCheckoutRef : "master";
                    }
                }
                else
                {
                    // -- ensure that the draftAppGitCheckoutRef is reset to undefined as there is no app_url
                    draftAppGitCheckoutRef = undefined;
                }

                // -- Attempt to create the draft
                try
                {
                    await PlaybookService.createDraft(
                        authour,
                        playbookName,
                        blueprintVersion,
                        draftBlueprintGitCheckoutRef,
                        draftAppGitCheckoutRef
                    )

                    console.log(chalk.green('============================================================\n'))
                    console.log(chalk.green("Your draft has been created! You can preview this at: \n\n"))
                    console.log(PlaybookService.createMasterclassUrl(authour, playbookName, blueprintVersion));
                    console.log(chalk.green('\n============================================================\n\n'))
                }
                catch(createDraftError)
                {
                    console.error(chalk.red('============================================================\n'));
                    console.error(chalk.red("There was an error creating your draft!\n"))
                    if (typeof createDraftError == "object")
                    {
                        if (createDraftError.statusCode == 409 && createDraftError.error && createDraftError.error.message)
                        {
                            console.error(createDraftError.error.message);
                        }
                        else
                        {
                            console.error(JSON.stringify(createDraftError, null, 4));
                        }
                    }
                    else
                    {
                        console.error(createDraftError);
                    }
                    console.error(chalk.red("\nPlease resolve these errors and try again!\n"))
                    console.error(chalk.red('============================================================\n'));
                }
            }
           
        }
        catch(err)
        {
            console.error("This is the err", err);
        }
    }



    /**
     * Attes
     *
     * @param {*} args
     * @memberof PlaybookVersionCtrl
     */
    async publish(args)
    {
        try
        {
            let authour = args[3];
            let playbookName = args[4];
            let blueprintVersion = args[5];
            let draftAppGitCheckoutRef = args[6] // -- Optional and only if the authour has an app associated to this playbook

            /**
             * Authour input
             */
            if (!authour)
            {
                let authourAnswer = await inquirer.prompt({
                    type : "input",
                    name : "authour",
                    message : "Please enter the name of the authour",
                    validate: (val) => {
                        return val != "" ? true : "An authour name is required"
                    }
                })

                authour = authourAnswer.authour;
            }

            /**
             * Playbook name input
             */
            if (!playbookName)
            {
                let playbookNameAnswer = await inquirer.prompt({
                    type : "input",
                    name : "playbookName",
                    message : "Please enter the name of the playbook",
                    validate: (val) => {
                        return val != "" ? true : "A Playbook name is required"
                    }
                })

                playbookName = playbookNameAnswer.playbookName;
            }

            /**
             * Blueprint version input
             */
            if (!blueprintVersion || ( blueprintVersion && !ValidationService.checkAndGetSemver(blueprintVersion)))
            {
                let blueprintVersionAnswer = await inquirer.prompt({
                    type : "input",
                    name : "blueprintVersion",
                    message : "What version will you be publishing today?",
                    validate: (val) => {
                        return val != "" ? true : "The blueprint version must be valid semver";
                    }
                })

                blueprintVersion = blueprintVersionAnswer.blueprintVersion;
            }

            // -- First we need to use the authour and playbook and check if there is a playbook to save a draft to
            console.log(chalk.green("\n\nSearching for your playbook...\n"));
            let existingPlaybookEntriesArray = await PlaybookService.getPlaybookEntry(playbookName, authour);

            if (existingPlaybookEntriesArray.length === 0)
            {
                console.log(chalk.yellow("We could not find the playbook from authour '" + authour + "' with playbook name '" + playbookName + "'\n"))
                
                const createNewPlaybookAnswer = await inquirer.prompt({
                    type : "confirm",
                    name : "createNewPlaybook",
                    message : "Would you like to create a new playbook?"
                })

                if (createNewPlaybookAnswer.createNewPlaybook)
                {
                    // -- We will need a blueprint_url in order to continue
                    const blueprintUrlAnswer = await inquirer.prompt({
                        type : "input",
                        name : "blueprintUrl",
                        message: "What github repo do your blueprint files belong in?",
                        validate: (val)=>{
                            return ValidationService.isGithubUrl(val) ? true: 'Please enter a valid github URL';
                        }
                    })


                    console.log(chalk.green("Creating your new playbook\n"));

                    // -- We can only continue if we have a playbook entry so lets automatically do that
                    try
                    {
                        await PlaybookService.createPlaybookEntry(
                            playbookName, 
                            authour,
                            undefined,
                            blueprintUrlAnswer.blueprintUrl,
                            blueprintVersion,
                        );

                        // -- Playbook is now created. Continue with publishing code
                    }
                    catch(createPlaybookEntryError)
                    {
                        console.error(chalk.red('============================================================\n'));
                        console.error(chalk.red("There was an error creating your playbook!\n"))
                        if (typeof createPlaybookEntryError == "object")
                        {
                            console.error(JSON.stringify(createPlaybookEntryError, null, 4));
                        }
                        else
                        {
                            console.error(createPlaybookEntryError);
                        }
                        console.error(chalk.red("\nPlease resolve these errors and try again!\n"))
                        console.error(chalk.red('============================================================\n'));
                    }

                }
                else
                {
                    console.log(chalk.yellow("\nAborting publish. If you would like to publish a version then a playbook will be required\n"))
                    return;
                }
            }
            
            // -- Publish the version
            console.log(chalk.green("Publishing your version...\n"));
            try
            {
                await PlaybookService.publish(
                    authour,
                    playbookName,
                    blueprintVersion
                )
                
                console.log(chalk.green('============================================================\n'))
                console.log(chalk.green("Your playbook version has been published! You can view it at:\n\n"))
                console.log(PlaybookService.createMasterclassUrl(authour, playbookName, blueprintVersion));
                console.log(chalk.green('\n============================================================\n\n'))
            }
            catch(publishError)
            {
                console.error(chalk.red('============================================================\n'));
                console.error(chalk.red("There was an error publishing your version!\n"))
                if (typeof publishError == "object")
                {
                    if (publishError.statusCode == 409 && publishError.error && publishError.error.message)
                    {
                        console.error(publishError.error.message);
                    }
                    else
                    {
                        console.error(JSON.stringify(publishError, null, 4));
                    }
                }
                else
                {
                    console.error(publishError);
                }
                console.error(chalk.red("\nPlease resolve these errors and try again!\n"))
                console.error(chalk.red('============================================================\n'));
            }
        }
        catch(err)
        {
            throw err;
        }
    }

}

module.exports = new PlaybookVersionCtrl();
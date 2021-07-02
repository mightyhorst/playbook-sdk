const Git = require("nodegit");
const path = require("path");
const os = require('os');
const _ = require('lodash');
const Url = require('url-parse');
const chalk = require('chalk');
const Axios = require('axios');

/**
 * @requires Models
 */
// import {
//     PlaybookModel,
//     PlaybookStepModel
// } from '../../models/playbook/index';
const {
    PlaybookModel,
    PlaybookStepModel
} = require('../../models/playbook');

/**
 * @requires Services 
 */
const FilesService = require('../utils/FilesService');
const DiffService = require('../diff/DiffService');
const TextService = require('../utils/TextService');

/**
 * @import Errors
 */
const RepoNotFoundError = require('../../errors/repo-not-found.error');

class NodeGitService
{
    /**
     * Builds the app and blueprint folder paths and deletes the existing folders at those paths (incase the tool crashed in a previous run)
     *
     * @param {*} appGithubUrl
     * @param {*} blueprintGithubUrl
     * @returns {
     *              appFolderPath : <string>,
     *              blueprintFolderPath : <string>,
     *              authour : <string>,
     *              playbookName : <string>
     *          }
     * @memberof NodeGitService
     */
    prepareAppAndBlueprintFolderPaths(appGithubUrl, blueprintGithubUrl)
    {
        const homeDir = FilesService.homeDir;

        const appUrl = new Url(appGithubUrl);
        const appPathnameSplit = appUrl.pathname.split("/");
        const appFolderPath = path.resolve(homeDir, 'git-projects/' + appPathnameSplit.join("_"));

        const blueprintUrl = new Url(blueprintGithubUrl);
        const blueprintPathnameSplit = blueprintUrl.pathname.split("/");
        const blueprintFolderPath = path.resolve(homeDir, ('sxd-git-projects/' + blueprintPathnameSplit.join('_')))
        
        FilesService.deleteFolder(appFolderPath);
        FilesService.deleteFolder(blueprintFolderPath);  

        return {
            appFolderPath : appFolderPath,
            blueprintFolderPath : blueprintFolderPath,
            authour : appPathnameSplit[appPathnameSplit.length - 2],
            playbookName : appPathnameSplit[appPathnameSplit.length - 1]
        }
    }

    /**
     * Clones an existing repo (un/initialised) to tmp blueprints and creates a branch for new blueprint files
     *
     * @param {*} githubUrl
     * @param {*} isBlueprintRepo
     * @returns {
     *              repo: {Git.Repository},
     *              folderPath : {String},
     *              index : {String},
     *              branch : {String},
     *              isInit : {Boolean}
     *          }
     * @memberof NodeGitService
     */
    async createOrCloneBlueprintRepoFromGithubUrl(githubUrl, blueprintFolderPath)
    {
        let blueprintFolder;
        let repo;
        let isInit = false;

        const signature = Git.Signature.now("Foo bar", "dom@kitset.io");

        // -- Before we begin, lets attempt to delete the current folder located at the blueprintFolderPath. This is to ensure that if the tool crashed earlier and nothing was cleaned up, that the folder are prepared


        // -- Next we need to ensure there is a repo that we can write to. We will not dynamically create a repo (maybe we can do this later but we will need to use the github API directly)
        try
        {
            repo = await this.cloneRepo(githubUrl, blueprintFolderPath);
        }
        catch(err)
        {
            throw err;
        }

        // -- Next attempt to fetch previous commits. If there are no commits then the repo requires initializing
        try
        {
            let commitOids = await this.getCommitHistory(repo);
        }
        catch(err)
        {
            // -- There are no previous commits. Lets initialize the repo with a readme file and push that to master
            isInit = true;

            // -- Create a README.md file for this repo
            const readmeFileModel = FilesService.createFile(
                blueprintFolderPath,
                "README.md",
                "Generated with playbook magic"
            )

            // -- Load the repo index so we can add files
            const blueprintRepoIndex = await repo.refreshIndex();

            // -- Add the readme to commit
            await blueprintRepoIndex.addByPath("README.md");
            await blueprintRepoIndex.write();
            const oid = await blueprintRepoIndex.writeTree();

            await repo.createCommit("HEAD", signature, signature, "initial commit", oid, []);

            await this.pushRepo(repo);

        }

        // -- Create a remote that we can use to contact the remote repo
        const remote = await this.connectToRemote(repo, 'origin');

        return {
            repo : repo,
            folderPath : blueprintFolderPath,
            index : null,
            branch : null,
            isInit : isInit,
            remote : remote
        };
    }



    /**
     * Takes an app from a github URL and generates the playbook.js file with code master/partials in a blueprints repo.
     * This will commit all files generated and delete the local app repo
     *
     * @param {*} githubUrl
     * @param {*} blueprintRepoData
     * @returns
     * @memberof NodeGitService
     */
    async createBlueprintsFolderFromGithubUrl(githubUrl, githubAppTag, blueprintRepoData, appFolderPath)
    {
        // -- This is temporary to ensure we have a directory to clone to. We should resort to /tmp later
        FilesService.createFolder(path.resolve(os.homedir(), '.playbook'), "git-projects");
        // githubUrl = "git@github.com:mitni455/master-class-trello-clone.git";
        try
        {
            // -- Get the repo name from the github URL
            const appRepoUrl = new Url(githubUrl);
            const appPathnameSplit = appRepoUrl.pathname.split('/');
            const appOwner = appPathnameSplit[appPathnameSplit.length - 2];

            // -- Open the repo
            let repo;
            try
            {
                repo = await this.cloneRepo(githubUrl, appFolderPath, githubAppTag);
            }
            catch(err)
            {
                console.error("there was err here", err);
                throw err;
            }


            // -- Fetch all the commits from the start of time
            const commitOids = await this.getCommitHistory(repo);
            
            // -- Check if the github project that we will want to save this project to is available
            // TODO

            /********************************************
             *
             *  Sample of using the playbook models
             * 
             *********************************************/
            // const playbookModel = new PlaybookModel("LOOK IVE CHANGED TODO - Get the name from github url", "playbook.js");
            // const categoryModel = playbookModel.addCategory("TODO - Create a category name");
            // const sceneModel = categoryModel.addScene("TODO - Create a scene name");
            // const step1Model = sceneModel.addStep("TODO - Step name", "commit01");/
            // const descriptionModel = step1Model.addDescriptionFromMdFile(20, 1000, "new/file/readme.mdx");
            // const codeModel = step1Model.addCode(1000, 4000, "path/to/code.hbs", {
            //     "partial_1" : "Partial data",
            //     "partial_2" : "{{partial_2}}"
            // })
            // const partial1Model = codeModel.addPartial(1000, 2000, "partial_1", "path/to/partial_1.hbs");
            // const partial2Model = codeModel.addPartial(3000, 1000, "partial_2", "path/to/partial_2.hbs", {
            //     "randomData" : "This should be working"
            // });
            
            await this.iterateCommitsAndGenerateBlueprintContent(commitOids, blueprintRepoData, repo, appOwner, appFolderPath);
            
        }
        catch(err)
        {
            console.error("There was an error with connecting to your repo: ", err);
        }
        finally
        {
            return blueprintRepoData;
        }
    }


    /**
     * Iterates over an array of commits from a repo and generates the beginning of the playbook.js file
     *
     * @param {*} commitOids
     * @param {*} blueprintRepoData
     * @returns
     * @memberof NodeGitService
     */
    async iterateCommitsAndGenerateBlueprintContent(commitOids, blueprintRepoData, repo, appOwner, appFolderPath)
    {
        try
        {
            if (commitOids.length > 0 && blueprintRepoData && repo && appOwner && appFolderPath)
            {
                const playbookModel = new PlaybookModel("LOOK IVE CHANGED TODO - Get the name from github url", "playbook.json");
                const categoryModel = playbookModel.addCategory("TODO - Create a category name");
                const sceneModel = categoryModel.addScene("TODO - Create a scene name");
                
                let completedStepsByMergeCommit = [];

                let commitsForStepImplementation = [];

                // -- With the commitOids, fetch the commits and check for changes. The first commit will be the init commit
                for (let commitOidI = 0; commitOidI < commitOids.length; commitOidI++)
                {
                    const commitOid = commitOids[commitOidI];

                    const commit = await repo.getCommit(commitOid);

                    const commitMessage = commit.message();
                    
                    // -- Break the commit message into header and body (later this can be broken into different segments)
                    let commitMessageSplitByParagraphs = commitMessage.split("\n\n");
                    let commitHeader = commitMessageSplitByParagraphs.shift();

                    // commitMessageSplitByParagraphs will now contain the remaining commit body paragraphs that can be used to define other parts of this playbook


                    // -- The commit will either be a branch commit or a merge pull request. For the merge pull requests, we will need to generate a new "step"
                    if (this.isMergeRequest(commitMessage, commitOidI, "github"))
                    {
                        // -- Catcher to force the first commit (repo init) to run its own step
                        if (commitOidI === 0)
                        {
                            commitsForStepImplementation.push(commit);
                        }

                        // -- We will now create a new step and use the build up of commits to implement this step
                        const stepName = "step-" + TextService.numberFormatter(completedStepsByMergeCommit.length + 1)
                        const stepVariableName = stepName.replace(/-/g, "_");

                        // -- Add a Step to the playbook.js file
                        const stepModel = new PlaybookStepModel(stepName);

                        // -- Create a new step folder in the blueprints folder
                        const stepFolderModel = FilesService.createFolder(blueprintRepoData.folderPath, stepName);

                        // -- Attempt to read the branch name of this merge and use a cli command to execute a git checkout -b command
                        const mergedBranchName = this.getBranchNameFromCommitMessage(commitHeader, appOwner, "github");
                        
                        if (mergedBranchName)
                        {
                            const terminalModel = stepModel.addTerminal(0, 100);
                            terminalModel.addCommand("git checkout -b " + mergedBranchName);
                        }
                        
                        for (let commitInStepI = 0; commitInStepI < commitsForStepImplementation.length; commitInStepI++)
                        {
                            const commitInStep = commitsForStepImplementation[commitInStepI];

                            await this.handleCommitForBlueprintCreation(commitInStep, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel)
                        }

                        // -- TODO: Only enable this once we have proper filtering on the commit body as it will also contain all file commits that we merged
                        // this.createTerminalModelFromCommitMessage(stepModel, commitMessage);

                        // -- Once the step has been handled, add the step to an array of completed steps
                        completedStepsByMergeCommit.push(commit)

                        // -- Save the step playbook.js data to its own playbook.js file in its step folder
                        const playbookJsStepFileModel = FilesService.createFile(stepFolderModel.path,
                                                                                'playbook-' + stepName + '.js',
                                                                                stepModel.printJsContent())

                        // -- Register the step model to both the playbook and scene models
                        playbookModel.addStep(playbookJsStepFileModel.path.slice(blueprintRepoData.folderPath.length + 1), stepVariableName)
                        sceneModel.addStep(stepVariableName);

                        // -- Add and commit this file
                        await this.addAndCommitFile(blueprintRepoData.repo,
                                                    blueprintRepoData.index,
                                                    playbookJsStepFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                                    "feat(" + playbookJsStepFileModel.name + "): Initialising the playbook step js file which is used by the main playbook.js file");

                        commitsForStepImplementation = [];
                    }
                    else
                    {
                        // -- This is a normal commit and needs to be added to the step implementation array
                        commitsForStepImplementation.push(commit);
                    }

                    // -- If we are at the end of the commit Oids and there are still commits that have not been handled by a merge then we should finish them here in their own step
                    if (commitOidI === commitOids.length - 1 && commitsForStepImplementation.length > 0)
                    {
                        // -- We will now create a new step and use the build up of commits to implement this step
                        const stepName = "trailing-commits";
                        const stepVariableName = stepName.replace(/-/g, "_");

                        // -- Add a Step to the playbook.js file
                        const stepModel = new PlaybookStepModel(stepName);

                        // -- Create a new step folder in the blueprints folder
                        const stepFolderModel = FilesService.createFolder(blueprintRepoData.folderPath, stepName);
                        
                        for (let commitInStepI = 0; commitInStepI < commitsForStepImplementation.length; commitInStepI++)
                        {
                            const commitInStep = commitsForStepImplementation[commitInStepI];

                            await this.handleCommitForBlueprintCreation(commitInStep, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel)
                        }

                        // -- Save the step playbook.js data to its own playbook.js file in its step folder
                        const playbookJsStepFileModel = FilesService.createFile(stepFolderModel.path,
                                                                                'playbook-' + stepName + '.js',
                                                                                stepModel.printJsContent())

                        // -- Register the step model to both the playbook and scene models
                        playbookModel.addStep(playbookJsStepFileModel.path.slice(blueprintRepoData.folderPath.length + 1), stepVariableName)
                        sceneModel.addStep(stepVariableName);

                        // -- Add and commit this file
                        await this.addAndCommitFile(blueprintRepoData.repo,
                                                    blueprintRepoData.index,
                                                    playbookJsStepFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                                    "feat(" + playbookJsStepFileModel.name + "): Initialising the playbook step js file which is used by the main playbook.js file");
                    }

                }
                const playbookJsContent = playbookModel.printJsContent();

                // -- Save the playbookJs file to the blueprint root folder
                const playbookJsFileModel = FilesService.createFile(blueprintRepoData.folderPath, 'playbook.js', playbookJsContent);

                // -- Add and commit the playbook js file
                await this.addAndCommitFile(blueprintRepoData.repo,
                                            blueprintRepoData.index,
                                            playbookJsFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                            "feat(" + playbookJsFileModel.name + "): Initialising the playbook js file that can be used to generate the playbook json file");
                
            }
            else
            {
                console.error("There are no commits in this repo!")
                return;
            }
        } 
        catch(err) 
        {
            console.error("iterateCommitsAndGenerateBlueprintContent", err);
            throw err;
        }
        finally
        {
            if (appFolderPath)
            {
                // -- Delete the local app folder
                // FilesService.deleteFolder(appFolderPath)
            }
            return blueprintRepoData;
        }
    }

    /**
     * Handle the commit object of a repo
     *
     * @param {*} commit
     * @param {*} blueprintRepoData
     * @param {*} stepModel
     * @param {*} stepName
     * @param {*} completedStepsByMergeCommit
     * @param {*} stepFolderModel
     * @returns
     * @memberof NodeGitService
     */
    async handleCommitForBlueprintCreation(commit, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel)
    {
        try
        {
            if (commit && blueprintRepoData && stepModel && stepName && completedStepsByMergeCommit && stepFolderModel)
            {
                /******************************
                 *
                 * Handle commit files body
                 * 
                 ******************************/
                const diffList = await commit.getDiff();

                for (let diffI = 0; diffI < diffList.length; diffI++)
                {
                    const diff = diffList[diffI];

                    await this.handleDiffForBlueprintCreation(commit, diff, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel)
                }

                /******************************
                 *
                 * Handle commit message body
                 * 
                 ******************************/
                // -- Now that the files are handled, lets handle the commit message (the commit message body may contain metadata for the playbook.json e.g cli terminal)
                this.createTerminalModelFromCommitMessage(stepModel, commit.message())
                    
                
            }
            else
            {
                console.error("handleCommitForBlueprintCreation is missing required method arguments!");
                return;
            }
        }
        catch(err)
        {
            throw err;
        }
    }

    /**
     * Handle the diff object fetched by the commit object
     *
     * @param {*} commit
     * @param {*} diff
     * @param {*} blueprintRepoData
     * @param {*} stepModel
     * @param {*} stepName
     * @param {*} completedStepsByMergeCommit
     * @param {*} stepFolderModel
     * @returns
     * @memberof NodeGitService
     */
    async handleDiffForBlueprintCreation(commit, diff, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel)
    {
        try
        {
            if (commit && diff && blueprintRepoData && stepModel && stepName && completedStepsByMergeCommit && stepFolderModel)
            {
                const patches = await diff.patches();
                    
                let changedFileStartTime= 0;

                for (let patchI = 0; patchI < patches.length; patchI++)
                {
                    const patch = patches[patchI];

                    const avgDuration = await this.handlePatchForBlueprintCreation(commit, patch, blueprintRepoData, stepModel, stepName, changedFileStartTime, completedStepsByMergeCommit, stepFolderModel)

                    if (avgDuration)
                    {
                        changedFileStartTime += avgDuration;
                    }
                }
            }
            else
            {
                console.error("handleDiffForBlueprintCreation is missing required method arguments!");
                return;
            }
        }
        catch(err)
        {
            throw err;
        }
    }

    /**
     * Handle the patch object fetched by the diff object of a commit
     *
     * @param {*} commit
     * @param {*} patch
     * @param {*} blueprintRepoData
     * @param {*} stepModel
     * @param {*} stepName
     * @param {*} changedFileStartTime
     * @param {*} completedStepsByMergeCommit
     * @param {*} stepFolderModel
     * @returns
     * @memberof NodeGitService
     */
    doOnce = true;
    async handlePatchForBlueprintCreation(commit, patch, blueprintRepoData, stepModel, stepName, changedFileStartTime, completedStepsByMergeCommit, stepFolderModel)
    {
        try
        {
            if (commit && patch && blueprintRepoData && stepModel && stepName && changedFileStartTime != null && completedStepsByMergeCommit && stepFolderModel)
            {
                // -- We can use a patch to get the path of the modified file
                const patchFilePath = patch.newFile().path();
                const patchFolderPath = path.dirname(patchFilePath);
                const patchFileExtName = path.extname(patchFilePath);
                const patchFileName = path.basename(patchFilePath, patchFileExtName)
                
                if (!(this.isIgnoredPath(patchFolderPath) || this.isIgnoredFile(patchFileName + patchFileExtName)) && !patch.isDeleted())
                {
                    // -- Fetch the current file contents
                    const currentMergeFileEntry = await commit.getEntry(patchFilePath);
                    const currentMergeFileBlob = await currentMergeFileEntry.getBlob();
                    const currentMergeFileContent = currentMergeFileBlob.toString();
                    const avgDuration = Math.ceil((currentMergeFileContent.length / 30) / 100) * 100;

                    // -- Using the modified file, decide
                    if (patchFileExtName === ".md" || patchFileExtName === ".mdx")
                    {
                        // -- Create a description timeline entry in the playbook.js for .md and .mdx files
                        await this.createDescriptionModel(blueprintRepoData, stepModel, stepName, changedFileStartTime, avgDuration, stepFolderModel, patchFolderPath, patchFilePath, patchFileName, patchFileExtName, currentMergeFileContent);
                    }
                    else
                    {
                        await this.createCodeModel(patch, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel, patchFolderPath, patchFilePath, patchFileName, avgDuration, currentMergeFileContent, changedFileStartTime)
                    }

                    return avgDuration;
                }
            }
            else
            {
                console.error("Missing required method arguments!");
            }
            return;
        }
        catch(err)
        {
            throw err;
        }
    }

    /**
     * Handle the creation of a description panel entry in playbook.js
     *
     * @param {*} stepModel
     * @param {*} changedFileStartTime
     * @param {*} avgDuration
     * @param {*} patchFilePath
     * @returns
     * @memberof NodeGitService
     */
    async createDescriptionModel(blueprintRepoData, stepModel, stepName, changedFileStartTime, avgDuration, stepFolderModel, patchFolderPath, patchFilePath, patchFileName, patchFileExtName, currentMergeFileContent)
    {
        if (stepModel && changedFileStartTime != null && avgDuration != null && stepFolderModel && patchFolderPath && patchFilePath)
        {
            // -- We will need to create the folder that we store this description file to
            const descriptionFolderModel = FilesService.createFolder(path.join(path.join(stepFolderModel.path, 'description'), 
                                                                     path.dirname(patchFolderPath)), 
                                                                     path.basename(patchFolderPath));
                                                                     
            const descriptionFileModel = FilesService.createFile(descriptionFolderModel.path,
                                                                 patchFileName + patchFileExtName,
                                                                 currentMergeFileContent);

            stepModel.addDescriptionFromMdFile(changedFileStartTime, 
                                               avgDuration, 
                                               descriptionFileModel.path.slice(blueprintRepoData.folderPath.length + 1 + stepName.length));

            // -- Add the new file to the repo index for committing
            await this.addAndCommitFile(blueprintRepoData.repo,
                                        blueprintRepoData.index,
                                        descriptionFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                        "docs(" + descriptionFileModel.name + "): " + stepName + " - Moving your description file for use in masterclass");
        }
        else
        {
            console.error("createDescriptionModel is missing required method arguments!");
            return;
        }
    }

    /**
     * Handle the create of a code panel entry in playbook.js
     *
     * @param {*} patch
     * @param {*} blueprintRepoData
     * @param {*} stepModel
     * @param {*} stepName
     * @param {*} completedStepsByMergeCommit
     * @param {*} stepFolderModel
     * @param {*} patchFolderPath
     * @param {*} patchFilePath
     * @param {*} patchFileName
     * @param {*} avgDuration
     * @param {*} currentMergeFileContent
     * @param {*} changedFileStartTime
     * @returns
     * @memberof NodeGitService
     */
    async createCodeModel(patch, blueprintRepoData, stepModel, stepName, completedStepsByMergeCommit, stepFolderModel, patchFolderPath, patchFilePath, patchFileName, avgDuration, currentMergeFileContent, changedFileStartTime)
    {
        if (patch && blueprintRepoData && stepModel && stepName && completedStepsByMergeCommit && stepFolderModel && patchFolderPath && patchFilePath && patchFileName  && avgDuration != null && currentMergeFileContent != null && changedFileStartTime != null)
        {
            let previousMergeFileContent;

            // -- Lets use the file path to check if this file has been created by a previous step (updated)
            if (completedStepsByMergeCommit.length > 0 && patch.isModified())
            {
                let previousMergeCommit = completedStepsByMergeCommit[completedStepsByMergeCommit.length - 1]

                // -- A previous merge commit exists. Fetch this file inside the previous merge commit so we can create a diff
                try
                {
                    const previousMergeFileEntry = await previousMergeCommit.getEntry(patchFilePath);
                    const previousMergeFileBlob = await previousMergeFileEntry.getBlob();
                    previousMergeFileContent = previousMergeFileBlob.toString();
                }
                catch(err)
                {
                    // -- This should be called if the entry doesn't exist. This is okay as it may be a new file added to the master branch
                    console.error("Warning: Error fetching a file from a previous merge! NOT AN ISSUE: ", err);
                }
            }

            

            const templateData = DiffService.generateMasterTemplateAndPartials(previousMergeFileContent, currentMergeFileContent);
            
            // -- Create the new master template file
            const masterTemplateFolderModel = FilesService.createFolder(path.join(path.join(stepFolderModel.path, 'code'), path.dirname(patchFolderPath)), 
                                                                        path.basename(patchFolderPath));

            const masterTemplateFileModel = FilesService.createFile(masterTemplateFolderModel.path,
                                                                    patchFileName + ".hbs",
                                                                    templateData.masterTemplate)

            // -- Add the new file to the repo index for committing
            await this.addAndCommitFile(blueprintRepoData.repo,
                                        blueprintRepoData.index,
                                        masterTemplateFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                        "feat(" + masterTemplateFileModel.name + "): " + stepName + " - Initialising a master template for printing code in masterclass");

            // -- Add the master template as a code entry in the playbook.js file
            const timelineCodeModel = stepModel.addCode(changedFileStartTime, 
                                                        avgDuration, 
                                                        masterTemplateFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                                        patchFilePath);
            
            // -- Create the partial data files 
            if (!_.isEmpty(templateData.partials))
            {
                const partialTemplateFolderModel = FilesService.createFolder(masterTemplateFolderModel.path, patchFileName + "_partials");
                let partialStartTime = 0;

                for (let partialId in templateData.partials)
                {
                    const partialContent = templateData.partials[partialId];
                    const avgPartialDuration = Math.ceil((partialContent.length / 30) / 100) * 100;
                    
                    const partialFileModel = FilesService.createFile(
                                                    partialTemplateFolderModel.path,
                                                    partialId + ".hbs",
                                                    partialContent
                                                )
                    // -- Add the partial file to the repo index for committing
                    await this.addAndCommitFile(blueprintRepoData.repo,
                                                blueprintRepoData.index,
                                                partialFileModel.path.slice(blueprintRepoData.folderPath.length + 1),
                                                "feat(" + partialFileModel.name + "): " + stepName + " - Initialising a partial file for use in a master template");
                    
                    // -- Add the code partial to the code timeline. This will include it in the playbook.js file
                    timelineCodeModel.addPartial(partialStartTime, 
                                                    avgPartialDuration, 
                                                    partialId, 
                                                    partialFileModel.path.slice(blueprintRepoData.folderPath.length + 1));

                    // -- Set the partial start time to the end of this partial so they do not play at the same time
                    partialStartTime += avgPartialDuration;

                }
            }
        }
        else
        {
            console.error("patchFolderPath: ", patchFolderPath)
            console.error("patchFilePath: ", patchFilePath)
            console.error("patchFileName: ", patchFileName)
            console.error("currentMergeFileContent: ", currentMergeFileContent)
            console.error("changedFileStartTime: ", changedFileStartTime);
            console.error("createCodeModel is missing required method arguments!");

            return;
        }
    }

    /**
     * Handle the creation of a cli panel entry in playbook.js
     *
     * @param {*} stepModel
     * @memberof NodeGitService
     */
    async createTerminalModelFromCommitMessage(stepModel, commitMessage)
    {
        let commitBodySplitByParagraphs = commitMessage.split("\n\n")
        commitBodySplitByParagraphs.shift(); // Remove the commit header

        // -- TODO: We will assume that all content in the body will be commands to run in the cli window
        if (commitBodySplitByParagraphs.length > 0)
        {
            // -- Create the new code panel entry in the playbook.js
            let terminalModel = stepModel.addTerminal(0, 100);

            commitBodySplitByParagraphs.forEach((paragraph) => {
                // -- Split the paragraph into new lines. Each new line will be a command
                paragraph.split('/').forEach((paragraphLine) => {
                    terminalModel.addCommand(paragraphLine);
                });
            })
            // terminalModel.autoCalculateTime(); TODO
        }
    }

    /**
     * Get an array of commit ids from oldest to newest
     *
     * @param {*} repo
     * @returns {Array<string>}
     * @memberof NodeGitService
     */
    async getCommitHistory(repo)
    {
        // -- Fetch the latest commit on master
        const latestMasterCommit = await repo.getHeadCommit();

        // -- Create the walker we will use to get all commits in reverse order leading up to the master commit
        const walker = repo.createRevWalk();
        walker.reset();
        walker.push(latestMasterCommit.sha());
        walker.sorting(Git.Revwalk.SORT.TIME , Git.Revwalk.SORT.REVERSE);

        // -- Iterate over all found commits and save the commit oid/sha to the array
        const commitOids = [];
        let hasNext = true;
        while (hasNext) {
            try 
            {
                const oid = await walker.next();
                commitOids.push(oid.tostrS());
            } 
            catch (err) 
            {
                hasNext = false;
            }
        }

        return commitOids;
    }

    async cloneRepo(url, path, tag="master")
    {
        try
        {
            let credentialsBreak = 0;

            // -- Init an empty repo
            let repo = await Git.Repository.init(path, 0);

            // -- Create a ref spec that will only pull a single branch to local
            const remoteRef = "+refs/" + (tag != "master" ? "tags" : "heads") + "/" + tag;
            const localRef = "refs/remotes/origin/" + tag;

            const remote = await Git.Remote.createWithFetchspec(
                repo,
                'origin',
                this.createSshUrlFromHttps(url),
                remoteRef + ":" + localRef
            )

            // -- Fire request to fetch all data
            
            await repo.fetchAll({
                callbacks : {
                    credentials : function (url, username) {
                        console.log("Cloning - retrieving credentials for the repo '" + url + "'");
                        return Git.Cred.sshKeyFromAgent(username);
                    }
                }
            });
            

            // -- Checkout the tag or set the head if the we are pointing to the master
            if (tag === "master")    
            {
                try
                {
                    await repo.setHead(localRef);
                }
                catch(err)
                {
                    // -- We only want to throw the error if the master doesn't exist. If master doesn't exist it would mean the repo has not been initialised
                    if (tag != "master")
                    {
                        throw err;
                    }
                }
            }
            else
            {
                repo = await this.checkoutTag(repo, tag);
            }
            
            return repo;
        }
        catch(err)
        {
            let errMessage = "Error cloning the github repo! - " + err.message;
            throw errMessage;
        }
    }


    async connectToRemote(repo, remoteName)
    {
        const remote = await repo.getRemote(remoteName);

        await remote.connect(Git.Enums.DIRECTION.FETCH, {
            credentials: function(url, username) {
                return Git.Cred.sshKeyFromAgent(username);
            }
        })

        return remote;
        
    }


    async checkoutTag(repo, githubAppTag)
    {
        if (githubAppTag != "master")
        {
            // -- First we will need to lookup the tag so we can retrieve the tag target id
            let tagReference = await repo.getReference(githubAppTag);
            
            // -- Checkout the tag. This will set the head as detached by default
            await repo.checkoutRef(tagReference);
        }

        return repo;
    }


    async doesBranchAlreadyExistInRemote(remote, branch)
    {
        const referenceList = await remote.referenceList();
        let existingBranch = referenceList.find((reference) => {
            return reference.name() === "refs/heads/" + branch;
        })

        return existingBranch != null
    }

    /**
     * Creates and checkout a branch in a repo
     *
     * @param {*} repo
     * @param {*} branch
     * @memberof NodeGitService
     */
    async createAndCheckoutBranch(repo, branch)
    {
        const headCommit = await repo.getHeadCommit();
        const blueprintBranchRef = await Git.Branch.create(repo, branch, headCommit, 0);
        await repo.checkoutRef(blueprintBranchRef);

        return branch;
    }

    /**
     * Adds an individual file and commits it to the supplied index
     *
     * @param {*} repo
     * @param {*} index
     * @param {*} relativeFilePath
     * @param {*} commitMessage
     * @returns
     * @memberof NodeGitService
     */
    async addAndCommitFile(repo, index, relativeFilePath, commitMessage)
    {    
        var signature = Git.Signature.now("Dominic Trang", "dom@kitset.io");

        // -- Add the readme to commit
        await index.addByPath(relativeFilePath);
        await index.write();
        const oid = await index.writeTree();
        const headRef = await Git.Reference.nameToId(repo, "HEAD");
        const parentCommit = await repo.getCommit(headRef);
        
        const commitId = await repo.createCommit("HEAD", signature, signature, commitMessage, oid, [parentCommit]);

        return commitId;
    }

    /**
     * Push a branch to a github repo
     *
     * @param {*} repo
     * @param {string} [remoteId="origin"]
     * @param {string} [localBranch="master"]
     * @param {*} [remoteBranch=localBranch]
     * @memberof NodeGitService
     */
    async pushRepo(repo, remoteId = "origin", localBranch = "master", remoteBranch = localBranch, isInit = false)
    {
        try
        {
            // -- DISABLING code below as we want to have branches to make it easier to publish versions
            // -- If this is an init, auto-merge the local branch straight to the remote master branch
            // if (isInit)
            // {
            //     remoteBranch = "master";
            // }

            let credentialsBreak = 0;

            const remote = await repo.getRemote(remoteId);

            await remote.push(
                // ["refs/heads/sdk-branch:refs/heads/master"], // -- This merges the local-branch:remote-branch. So sdk-branch pushes to master
                ["+refs/heads/"+ localBranch + ":refs/heads/" + remoteBranch],
                {
                    callbacks: {
                        credentials: function(url, username) {
                            console.log("Pushing - retrieving credentials for the repo '" + url + "'")
                            credentialsBreak++;
                            if (credentialsBreak > 10)
                            {
                                throw "Auth failed. Ensure you have the passphrase for ~/.ssh/id_rsa set in keychain using 'ssh-add -K ~/.ssh/id_rsa' or ensure you the owner/part of the github blueprint repo"
                            }
                            return Git.Cred.sshKeyFromAgent(username);
                        }
                    }
                }
            )
        }
        catch(err)
        {
            throw err;
        }
    }


    /**
     * 
     * @todo Auto detect git remote flavor from either url or commit message
     * @param {*} commitMessage
     * @param {*} commitOidI
     * @param {string} [gitRemoteFlavor="github"]
     * @returns
     * @memberof NodeGitService
     */
    isMergeRequest(commitMessage, commitOidI, gitRemoteFlavor = "github")
    {
        switch(gitRemoteFlavor)
        {
            case "gitlab":
                return commitMessage.indexOf("Merge pull request") === 0 || commitOidI === 0;
            case "github":
            default:
                return commitMessage.indexOf("Merge pull request") === 0 || commitOidI === 0;
        }
    }


    getBranchNameFromCommitMessage(commitMessage, appOwner, gitRemoveFlavor = "github")
    {
        if (commitMessage && appOwner)
        {
            switch(gitRemoveFlavor)
            {
                case "github":
                default:
                    const mergeMessageSplit = commitMessage.split(" from " + appOwner + "/");

                    if (mergeMessageSplit.length > 1)
                    {
                        const branchName = mergeMessageSplit[mergeMessageSplit.length - 1].slice(0, (mergeMessageSplit[mergeMessageSplit.length - 1]).length);

                        return branchName;
                    }
                    else
                    {
                        return;
                    }
            }
        }
        else
        {
            return;
        }
    }

    /**
     * Return true if the path contains a folder that should be ignored
     *
     * @param {*} path
     * @memberof NodeGitService
     */
    isIgnoredPath(path)
    {
        return path.indexOf("node_modules") === 0;
    }

    /**
     * Return true if the file name should be ignored
     *
     * @param {*} fileName
     * @returns
     * @memberof NodeGitService
     */
    isIgnoredFile(fileName)
    {
        switch (fileName)
        {
            case "yarn.lock":
                return true;
            default:
                return false;
        }
    }

    /**
     * Converts a https url to a github ssh url
     *
     * @param {*} urlString
     * @returns
     * @memberof NodeGitService
     */
    createSshUrlFromHttps(urlString)
    {
        const url = new Url(urlString);
        return "git@github.com:" + url.pathname.slice(1) + ".git";
    }



    /**
     * Requests the given URL and if it returns as a 200 then we assume that it is a valid path.
     *
     * @param {*} gitUrl
     * @returns
     * @memberof NodeGitService
     */
    async checkIfRepoExists(gitUrl, gitCheckoutRef) {

        try
        {
            let gitUrlModel = new Url(gitUrl);
            let gitWithCheckoutRefUrl = "";

            if (gitUrl.indexOf("github.com") >= 0)
            {
                gitUrlModel.pathname = path.join('/', gitUrlModel.pathname, 'tree', gitCheckoutRef);
                
            }
            else if (gitUrl.indexOf("gitlab.com") >= 0)
            {
                gitUrlModel.pathname = path.join('/', gitUrlModel.pathname, '-/tree', gitCheckoutRef);
            }
            else
            {
                throw new RepoNotFoundError();
            }

            gitWithCheckoutRefUrl = gitUrlModel.toString();

            const gitResponse = await Axios.get(gitWithCheckoutRefUrl);

            return true;
        }
        catch(err)
        {
            throw new RepoNotFoundError();
        }

    }
}

module.exports = new NodeGitService();
const Git = require("nodegit");
const path = require("path");
const _ = require('lodash');
const Url = require('url-parse');

/**
 * @requires Models
 */
import {
    PlaybookModel
} from '../../models/playbook/index';

/**
 * @requires Services 
 */
const FilesService = require('../utils/FilesService');
const DiffService = require('../diff/DiffService');

class NodeGitService
{
    /**
     * Clones an existing repo (un/initialised) to tmp blueprints and creates a branch for new blueprint files
     *
     * @param {*} githubUrl
     * @param {*} isBlueprintRepo
     * @returns {
     *              repo: {Git.Repository},
     *              url: {String},
     *              folderPath : {String},
     *              index : {String},
     *              branch : {String}
     *          }
     * @memberof NodeGitService
     */
    async createOrCloneBlueprintRepoFromGithubUrl(githubUrl, isBlueprintRepo)
    {
        const blueprintUrl = new Url(githubUrl)
        let blueprintFolder;
        let repo;

        const signature = Git.Signature.now("Foo bar", "dom@kitset.io");

        // -- Lets attempt to clone the repo if it is a blueprint repo. If it isn't then lets generate the blueprint repo name and attempt to clone that
        if (!isBlueprintRepo)
        {
            blueprintUrl.pathname += "-blueprint";
        }

        const blueprintPathnameSplit = blueprintUrl.pathname.split("/");
        const blueprintFolderPath = path.resolve(__dirname, ('../../../../sxd-git-projects/' + blueprintPathnameSplit.join('_')))

        // -- First we need to ensure there is a repo that we can write to. We will not dynamically create a repo (maybe we can do this later but we will need to use the github API directly)
        try
        {
            repo = await this.cloneRepo("git@github.com:" + blueprintUrl.pathname.slice(1) + ".git", blueprintFolderPath);
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
        const branchName = "magic/sdk-blueprint-" + Date.now();
        
        // -- Create a new branch that we can our new blueprint files to
        await this.createAndCheckoutBranch(repo, branchName);

        // -- Load the repo index so we can add files
        const blueprintRepoIndex = await repo.refreshIndex();

        return {
            repo : repo,
            url : blueprintUrl.toString(),
            folderPath : blueprintFolderPath,
            index : blueprintRepoIndex,
            branch : branchName,
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
    async createBlueprintsFolderFromGithubUrl(githubUrl, blueprintRepoData)
    {
        // -- This is temporary to ensure we have a directory to clone to. We should resort to /tmp later
        FilesService.createFolder(path.resolve(__dirname, '../../../../'), "git-projects");

        try
        {
            // -- Get the repo name from the github URL
            const appRepoUrl = new Url(githubUrl);
            const appPathnameSplit = appRepoUrl.pathname.split('/');
            const appOwner = appPathnameSplit[appPathnameSplit.length - 2];
            const appFolderPath = path.resolve(__dirname, '../../../../git-projects/' + appPathnameSplit.join("_"));

            // -- Open the repo
            let repo;
            try
            {
                repo = await this.cloneRepo(githubUrl, appFolderPath);
            }
            catch(err)
            {
                repo = await Git.Repository.open(path.resolve(__dirname, '../../../../git-projects/' + appPathnameSplit.join("_") + '/.git'))
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
            

            if (commitOids.length > 0)
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
                    
                    // -- The commit will either be a branch commit or a merge pull request. For the merge pull requests, we will need to generate a new "step"
                    if (this.isMergeRequest(commitMessage, commitOidI, "github"))
                    {
                        // -- Catcher to force the first commit (repo init) to run its own step
                        if (commitOidI === 0)
                        {
                            commitsForStepImplementation.push(commit);
                        }

                        // -- We will now create a new step and use the build up of commits to implement this step
                        const stepName = "step-" + (completedStepsByMergeCommit.length + 1)

                        // -- Add a Step to the playbook.js file
                        const stepModel = sceneModel.addStep(stepName);

                        // -- Create a new step folder in the blueprints folder
                        const stepFolderModel = FilesService.createFolder(blueprintRepoData.folderPath, stepName);

                        // -- Attempt to read the branch name of this merge and use a cli command to execute a git checkout -b command
                        const mergeMessageSplit = commitMessage.split(" from " + appOwner + "/");

                        if (mergeMessageSplit.length > 1)
                        {
                            const mergedBranchName = mergeMessageSplit[mergeMessageSplit.length - 1].slice(0, (mergeMessageSplit[mergeMessageSplit.length - 1]).indexOf("\n"));

                            const cliModel = stepModel.addCli(0, 100);

                            cliModel.addCommand("git checkout -b " + mergedBranchName);
                        }

                        for (let commitInStepI = 0; commitInStepI < commitsForStepImplementation.length; commitInStepI++)
                        {
                            const commitInStep = commitsForStepImplementation[commitInStepI];

                            // -- We will need to get the files changed for each commit
                            const diffList = await commitInStep.getDiff();

                            for (let diffI = 0; diffI < diffList.length; diffI++)
                            {
                                const diff = diffList[diffI];

                                const patches = await diff.patches();
                                
                                let changedFileStartTime= 0;

                                for (let patchI = 0; patchI < patches.length; patchI++)
                                {
                                    const patch = patches[patchI];

                                    // -- We can use a patch to get the path of the modified file
                                    const patchFilePath = patch.newFile().path();
                                    const patchFolderPath = path.dirname(patchFilePath);
                                    const patchFileExtName = path.extname(patchFilePath);
                                    const patchFileName = path.basename(patchFilePath, patchFileExtName)

                                    // -- Fetch the current file contents
                                    const currentMergeFileEntry = await commit.getEntry(patchFilePath);
                                    const currentMergeFileBlob = await currentMergeFileEntry.getBlob();
                                    const currentMergeFileContent = currentMergeFileBlob.toString();
                                    const avgDuration = Math.ceil((currentMergeFileContent.length / 30) / 100) * 100;

                                    if (patchFileExtName === ".md" || patchFileExtName === ".mdx")
                                    {
                                        // -- Create a description timeline entry in the playbook.js for .md and .mdx files
                                        stepModel.addDescriptionFromMdFile(changedFileStartTime, avgDuration, patchFilePath);
                                    }
                                    else
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
                                                console.error("There was an error fetching a file from a previous merge!", err);
                                            }
                                        }

                                        

                                        const templateData = DiffService.generateMasterTemplateAndPartials(previousMergeFileContent, currentMergeFileContent);
                                        
                                        // -- Create the new master template file
                                        const masterTemplateFolderModel = FilesService.createFolder(
                                                                            path.join(path.join(stepFolderModel.path, 'code'), path.dirname(patchFolderPath)), 
                                                                            path.basename(patchFolderPath)
                                                                        );
                                        const masterTemplateFileModel = FilesService.createFile(
                                                                            masterTemplateFolderModel.path,
                                                                            patchFileName + ".hbs",
                                                                            templateData.masterTemplate
                                                                        )

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
                                    changedFileStartTime += avgDuration;
                                }
                            }
                        }

                        // -- Once the step has been handled, add the step to an array of completed steps
                        completedStepsByMergeCommit.push(commit)

                        commitsForStepImplementation = [];
                    }
                    else
                    {
                        // -- This is a normal commit and needs to be added to the step implementation array
                        commitsForStepImplementation.push(commit);
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

                // -- Now push the repo
                // await this.pushRepo(blueprintRepoData.repo, 
                //                     undefined,
                //                     blueprintRepoData.branch);

                // -- Delete the local app folder
                FilesService.deleteFolder(appFolderPath)
                
                return blueprintRepoData;
            }
            else
            {
                console.error("There are no commits in this repo!")
            }
        }
        catch(err)
        {
            console.error("There was an error with connecting to your repo: ", err);
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
        const latestMasterCommit = await repo.getMasterCommit();

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

    async cloneRepo(url, path)
    {
        try
        {
            let credentialsBreak = 0;
            const repo = await Git.Clone(
                url, 
                path, 
                {
                    fetchOpts : {
                        callbacks : {
                            credentials : function (url, username) {
                                console.log("Cloning - retrieving credentials for the repo '" + url + "'")
                                if (credentialsBreak > 10)
                                {
                                    throw {
                                        message : "Auth failed for the url '" + url + "'. Ensure you have the passphrase for ~/.ssh/id_rsa set in keychain using 'ssh-add -K ~/.ssh/id_rsa' or ensure you the owner/part of the github blueprint repo"
                                    }
                                }
                                return Git.Cred.sshKeyFromAgent(username);
                            }
                        }
                    }
                }
            )

            return repo;
        }
        catch(err)
        {
            let errMessage = "Error cloning the blueprint github repo! - " + err.message;
            throw errMessage;
        }
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
    async pushRepo(repo, remoteId = "origin", localBranch = "master", remoteBranch = localBranch)
    {
        try
        {
            let credentialsBreak = 0;

            const remote = await repo.getRemote(remoteId);

            await remote.push(
                // ["refs/heads/sdk-branch:refs/heads/master"], // -- This merges the local-branch:remote-branch. So sdk-branch pushes to master
                ["refs/heads/"+ localBranch + ":refs/heads/" + remoteBranch],
                {
                    callbacks: {
                        credentials: function(url, username) {
                            console.log("Cloning - retrieving credentials for the repo '" + url + "'")
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
}

module.exports = new NodeGitService();
const Git = require("nodegit");
const path = require("path");
const _ = require('lodash');

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
    async createBlueprintsFolder(githubUrl)
    {
        // -- This is temporary to ensure we have a directory to clone to. We should resort to /tmp later
        FilesService.createFolder(path.resolve(__dirname, '../../../../'), "git-projects");

        try
        {
            // -- Open the repo
            let repo;
            try
            {
                repo = await Git.Clone(githubUrl, path.resolve(__dirname, '../../../../git-projects/nodegit-tester'))
            }
            catch(err)
            {
                repo = await Git.Repository.open(path.resolve(__dirname, '../../../../git-projects/nodegit-tester/.git'))
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
                const playbookModel = new PlaybookModel("LOOK IVE CHANGED TODO - Get the name from github url", "playbook.js");
                const categoryModel = playbookModel.addCategory("TODO - Create a category name");
                const sceneModel = categoryModel.addScene("TODO - Create a scene name");

                // -- Before we iterate over the commits. Lets initialise a temp blueprints folder for storing all the partials etc
                const blueprintsRootFolderModel = FilesService.createFolder(path.resolve(__dirname, '../../../../sxd-git-projects'), 'nodegit-tester-blueprint');
                
                // const partialsRootFolderModel = FilesService.createFolder(path.resolve(blueprintsRootFolderModel.path, 'docs/code'), 'partials');
                
                let completedStepsByMergeCommit = [];

                let commitsForStepImplementation = [];

                // -- With the commitOids, fetch the commits and check for changes. The first commit will be the init commit
                for (let commitOidI = 0; commitOidI < commitOids.length; commitOidI++)
                {
                    const commitOid = commitOids[commitOidI];

                    const commit = await repo.getCommit(commitOid);

                    const commitMessage = commit.message();
                    
                    // -- The commit will either be a branch commit or a merge pull request. For the merge pull requests, we will need to generate a new "step"
                    if (commitMessage.indexOf("Merge pull request") === 0 || commitOidI === 0)
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
                        const stepFolderModel = FilesService.createFolder(blueprintsRootFolderModel.path, stepName);

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

                                        // -- Add the master template as a code entry in the playbook.js file
                                        const timelineCodeModel = stepModel.addCode(changedFileStartTime, avgDuration, masterTemplateFileModel.path);
                                        
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
                                                
                                                // -- Add the code partial to the code timeline. This will include it in the playbook.js file
                                                timelineCodeModel.addPartial(partialStartTime, avgPartialDuration, partialId, partialFileModel.path);

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
                FilesService.createFile(blueprintsRootFolderModel.path, 'playbook.js', playbookJsContent);

                return blueprintsRootFolderModel;
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
}

module.exports = new NodeGitService();
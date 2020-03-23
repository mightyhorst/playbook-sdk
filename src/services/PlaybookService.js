const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
var term = require( 'terminal-kit').terminal;

/**
 * @requires Services 
 */
const FileService = require('../services/utils/FilesService');
const NodeGitService = require('../services/nodegit/NodeGitService');

/**
 * @constant VIEWS 
 */
// const VIEWS = require('../models/constants/views.const');

/**
 * @requires Models 
 */
const Models = require('../models/index');
const FileModel = Models.FileModel;

class PlaybookService{

    constructor(){
        
    }


    async buildPlaybookJsonFromGithub(blueprintGithubUrl, blueprintRepoData)
    {
        try
        {
            let blueprintFolderPath = blueprintRepoData ? blueprintRepoData.folderPath : undefined;
            // -- If there is no blueprint folder path provided, use the github URL to fetch the repo
            if (!blueprintFolderPath)
            {
                const blueprintPathnameSplit = blueprintUrl.pathname.split("/");
                blueprintFolderPath = path.resolve(__dirname, ('../../../sxd-git-projects/' + blueprintPathnameSplit.join('_')))
                
                const repo = await NodeGitService.cloneRepo(blueprintGithubUrl, blueprintFolderPath);
            }
            
            // -- Check to see if the blueprints folder contains a playbook.js file
            const playbookFileBuilt = this.buildPlaybookJsonFromFolderPath(blueprintFolderPath);
            if (playbookFileBuilt) 
            {
                // -- Push the hard-saved playbook.json file that is in the root of the blueprints folder to the repo
                await NodeGitService.addAndCommitFile(blueprintRepoData.repo,
                                                        blueprintRepoData.index,
                                                        'playbook.json',
                                                        "feat(playbook.json): The compiled playbook.js file. Used by masterclass.io");
            }

        }
        catch(err)
        {
            throw err;
        }
    }

    buildPlaybookJsonFromFolderPath(folderPath)
    {
        const playbookFiles = FileService.findAll(folderPath, 'playbook.js');

        if (playbookFiles.length > 0)
        {
            // -- Currently, we will only run the first playbook.js file found. This should exist in the root and we will push this file to the repo
            require(playbookFiles[0].path);
            return true;
        }
        else
        {
            return false;
        }
    }

    
    /**
     * Returns the file paths to all the *playbook.js files 
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @memberof Controller
     * @todo refactor to use FileService not glob directly 
     */
    findAllPlaybooks(){
        const fileModels =  FileService.findAllCwd('*.playbook.js');
        return fileModels;
    }
}

module.exports = new PlaybookService();
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
var term = require( 'terminal-kit').terminal;
const rp = require('request-promise-native');

/**
 * @import Constants
 */
// import {
//     MICROSERVICE_PLAYBOOK_URL, 
//     CLIENT_MASTERCLASS_URL,
// } from '../constants/url.const';
const {
    MICROSERVICE_PLAYBOOK_URL, 
    CLIENT_MASTERCLASS_URL,
} = require('../constants');

/**
 * @requires Services 
 */
const FileService = require('./utils/FilesService');
const NodeGitService = require('./nodegit/NodeGitService');

/**
 * @constant VIEWS 
 */
// const VIEWS = require('../models/constants/views.const');

/**
 * @requires Models 
 */
const Models = require('../models/index');
const FileModel = Models.FileModel;


class PlaybookApiService{

    constructor(){
        
    }

    async getPlaybookEntry(playbookName, authour)
    {
        try
        {
            let result = await rp({
                method : "GET",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook?authour=" + authour + "&playbook_name=" + playbookName,
                json : true
            });

            return result;
        }
        catch(err)
        {
            if (err.hasOwnProperty("error"))
            {
                throw err.error;
            }
            throw err;
        }
    }

    async validatePlaybookJson(url, branchOrTag)
    {
        try
        {
            let result = await rp({
                method : "POST",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook/validate",
                body : {
                    url : url,
                    branchOrTag : branchOrTag
                },
                json: true,
            })

            return result;
        }
        catch(err)
        {
            if (err.hasOwnProperty("error"))
            {
                throw err.error;
            }
            throw err;
        }
    }

    /**
     * Sends a POST to microservice-playbook
     *
     * @param {*} playbookName The name of the playbook
     * @param {*} authour The name of the authour
     * @param {*} appUrl The URL of the git project we generated the blueprint from
     * @param {*} blueprintUrl The URL of the git project that contains all the blueprint/playbook.json data
     * @param {*} blueprintVersion The version we will one day choose to publish to masterclass (follows semver structure)
     * @param {*} appGitCheckoutRef The branch/tag that we used to generate this blueprint (optional in the server but we will supply it here as we should already have the information)
     * @param {*} draftBlueprintGitCheckoutRef The branch/tag that we will use when loading the draft
     * @returns
     * @memberof PlaybookService
     */
    async createPlaybookEntry(playbookName, authour, appUrl, blueprintUrl, blueprintVersion, appGitCheckoutRef, draftBlueprintGitCheckoutRef)
    {
        try
        {
            let result = await rp({
                method : "POST",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook", 
                body : {
                    playbook_name : playbookName,
                    authour: authour,
                    app_url : appUrl,
                    blueprint_url : blueprintUrl,
                    blueprint_version : blueprintVersion,
                    app_git_checkout_ref : appGitCheckoutRef, // -- This will also be used by the server to auto-set the draft_app_git_checkout_ref
                    draft_blueprint_git_checkout_ref: draftBlueprintGitCheckoutRef
                },
                json : true
            });

            return result;
        }
        catch(err)
        {
            if (err.hasOwnProperty("error"))
            {
                throw err.error;
            }
            throw err;
        }
    }

    async updatePlaybookEntry(playbookId, updateData)
    {
        if (!updateData) { updateData = {}; }
        try
        {
            let result = await rp({
                method : "PUT",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook/" + playbookId,
                body : updateData,
                json : true
            })

            return result;
        }
        catch(err)
        {
            if (err.hasOwnProperty("error"))
            {
                throw err.error;
            }
            throw err;
        }
    }


    /**
     * Calls the /playbook/draft route to create a new version draft. This can later be published using the publish function
     *
     * @param {*} authour
     * @param {*} playbookName
     * @param {*} blueprintVersion
     * @param {*} draftBlueprintGitCheckoutRef
     * @param {*} draftAppGitCheckoutRef
     * @returns
     * @memberof PlaybookService
     */
    async createDraft(authour, playbookName, blueprintVersion, draftBlueprintGitCheckoutRef, draftAppGitCheckoutRef)
    {
        try
        {
            let result = await rp({
                method : "POST",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook/draft",
                body : {
                    authour : authour,
                    playbook_name : playbookName,
                    blueprint_version: blueprintVersion,
                    draft_blueprint_git_checkout_ref : draftBlueprintGitCheckoutRef,
                    draft_app_git_checkout_ref : draftAppGitCheckoutRef
                },
                json : true
            })

            return result;
        }
        catch(err)
        {
            throw err;
        }
    }


    /**
     * Calls the /playbook/publish route to publish a blueprint version
     *
     * @param {*} authour
     * @param {*} playbookName
     * @param {*} blueprintVersion
     * @param {*} appGitCheckoutRef
     * @returns
     * @memberof PlaybookService
     */
    async publish(authour, playbookName, blueprintVersion, appGitCheckoutRef)
    {
        try
        {
            let result = await rp({
                method : "POST",
                uri : MICROSERVICE_PLAYBOOK_URL + "/playbook/publish",
                body : {
                    authour : authour,
                    playbook_name : playbookName,
                    blueprint_version : blueprintVersion,
                    app_git_checkout_ref : appGitCheckoutRef
                },
                json : true
            })

            return result;
        }
        catch(err)
        {
            throw err;
        }
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



    createGithubUrl(url, branch) {
        if (branch)
        {
            url += "/tree/" + branch;
        }
        return url;
    }
    

    createMasterclassUrl(authour, playbookName, blueprintVersion) {

        let url = CLIENT_MASTERCLASS_URL + "/#/" + authour + "/" + playbookName;
        
        if (blueprintVersion)
        {
            url += "/" + blueprintVersion;
        }
        return url;
    }
}

module.exports = new PlaybookApiService();

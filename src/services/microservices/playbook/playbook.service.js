/**
 * @import Constants
 */
const {
    MICROSERVICE_PLAYBOOK_URL
} = require('../../../constants/url.const');

/**
 * @import Services
 */
const RestService = require('../rest.service');

/**
 * @import Error
 */
const NotUniqueError = require('../../../errors/not-unique.error');
const AxiosError = require('../../../errors/axios.error');

class PlaybookService
{
    constructor()
    {
        this.url = MICROSERVICE_PLAYBOOK_URL;
    }

    async show(workspace, playbookName)
    {
        try
        {
            const url = `${this.url}/playbook/${workspace}/${playbookName}`;
            const playbookData = await RestService.get(url);

            return playbookData;
        }
        catch(err)
        {
            throw err;
        }
    }


    /**
     * Calls POST /api/magic/playbook
     * Creates a playbook blueprint from a github URL
     *
     * @param {*} playbookData
     * @param {*} accessToken
     * @memberof PlaybookService
     */
    async createBlueprintWithMagic(playbookData, accessToken)
    {
        try
        {
            const url = `${this.url}/magic/playbook`;

            const result = await RestService.post(url, playbookData, accessToken);

            return result;
        }
        catch(err)
        {
            throw err;
        }
    }


    /**
     * Validates if the name is unique. If the playbook isn't found for a given workspace/playbook combination
     * then the combination is unique
     *
     * @param {*} workspace
     * @param {*} playbookName
     * @memberof PlaybookService
     */
    async validatePlaybookNameIsUnique(workspace, playbookName)
    {
        try
        {
            const playbookData = await this.show(workspace, playbookName);

            // -- If the playbook data exists then it is not unique
            throw new NotUniqueError(`The playbook name '${playbookName}' is not unique for the workspace '${workspace}'`);
        }
        catch(err)
        {
            if (err instanceof AxiosError)
            {
                if (err.status === 404)
                {
                    return true;
                }
            }
            throw err;
        }
    }
}

module.exports = new PlaybookService();
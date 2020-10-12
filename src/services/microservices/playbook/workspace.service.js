/**
 * @import Constants
 */
const { MICROSERVICE_PLAYBOOK_URL } = require('../../../constants/url.const')
const { 
    RoleEnum, 
    CascadingRoleEnum 
} = require('../../../constants/role.const');

/**
 * @import Services
 */
const RestService = require('../rest.service')

class WorkspaceService
{
    constructor()
    {
        this.url = MICROSERVICE_PLAYBOOK_URL + "/workspace";
    }

    async getUserWorkspaces(accessToken)
    {
        try
        {
            const workspaces = await RestService.get(this.url)

            return workspaces;
        }
        catch(err)
        {
            throw err;
        }
    }

    async show(workspace, accessToken)
    {
        try
        {
            const url = `${this.url}/${workspace}`;
            const workspaceData = await RestService.get(url, accessToken);

            return workspaceData
        }
        catch(err)
        {
            throw err;
        }
    }



    /**
     * Returns workspaces that match a role.
     * 
     * User stories:
     * - As a user I want all workspaces where I am only a Writer (cascading = false)
     * - As a user I want all workspaces that I can write to (cascading = true)
     *
     * @param {{role: string, workspace: string}[]} workspaces
     * @param {string} role A value defined in the RoleEnum
     * @param {{ cascading : true}} kwargs
     * @memberof WorkspaceService
     */
    filterByRole(workspaces, role, kwargs = {})
    {
        let filteredWorkspaces = [];
        // -- Continue if the role exists in the RoleEnum
        if (RoleEnum[role])
        {
            // -- If cascading is defined in the kwargs then we need to manually filter
            if (kwargs.cascading)
            {
                // -- Fetch the users
                filteredWorkspaces = workspaces.filter((workspaceRbac) => {
                    // console.error("workspace rbac: ", workspaceRbac);
                    const usersCascadingRole = CascadingRoleEnum[workspaceRbac.role]

                    return usersCascadingRole.includes(role)
                })
            }
            else
            {
                // -- Return all workspaces that have a role that match the users role
                filteredWorkspaces = workspaces.filter((workspaceRbac) => workspaceRbac.role === role);
            }
        }
        return filteredWorkspaces;
    }

}

module.exports = new WorkspaceService;
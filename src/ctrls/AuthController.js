const inquirer = require('inquirer');
const chalk = require('chalk');
const open = require('open');

/**
 * @import Services
 */
const FileService = require('../services/utils/FilesService');
const AuthService = require('../services/utils/AuthService');
const LogService = require('../services/utils/LogService');

class AuthCtrl {

    constructor()
    {    
    }


    /**
     * Attempts to log the user in by redirecting to a webpage.
     *
     * @memberof AuthCtrl
     */
    async login()
    {
        // -- Prepare the auth service
        await AuthService.getAccessTokenFromFile();

        // -- First check if the user already has an access token in their ~/.playbook directory
        let accessToken = AuthService.accessToken;

        if (!accessToken)
        {
            // -- There is no access token. We will attempt to log the user in
            const loginUrlAndData = AuthService.getLoginUrlWithData();
            open(loginUrlAndData.url);

            try
            {

                // -- We will now wait for a pin input. The pin is provided by the login redirect
                let authPinAnswer = await inquirer.prompt({
                    type : "input",
                    name : "authPin",
                    message: "Enter the 5-digit pin provided to you after login",
                    validate: (val)=>{
                        return val.toString().length === 5;
                    }
                })

                // -- Send a request and save the access token
                await AuthService.requestAccessTokenPayload(loginUrlAndData.state, authPinAnswer.authPin);

                LogService.success("Login Successful!")

                return true;
            }
            catch(err)
            {
                LogService.error(err);
                return false;
            }
        }
        else
        {
            LogService.success("Logged in as " + AuthService.email);

            // -- Refresh the token?
            return true;
        }
    }
    
}

module.exports = new AuthCtrl();
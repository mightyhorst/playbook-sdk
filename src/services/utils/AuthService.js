const os = require('os');
const path = require('path');
const uuid = require('uuid-random');
const axios = require('axios').default;
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

/**
 * @import Services
 */
const FileService = require('./FilesService');
const LogService = require('./LogService');



class AuthService
{
    constructor()
    {
        this.loginUrl = "http://id-masterclass.herokuapp.com/index.php/auth";
        this.requestAccessTokenUrl = "http://localhost:5000/api/cli/login"
        this.accessToken = null;
        this.accessTokenFileName = ".access_token";
    }
    
    /**
     * Fetches the auth data using the state and pin.
     *
     * @param {*} state
     * @param {*} pin
     * @memberof AuthService
     */
    async requestAccessTokenPayload(state, pin)
    {
        try
        {
            // -- Send the state and pin 
            const authDataResponse = await axios.post(this.requestAccessTokenUrl, {
                state : state,
                pin : pin
            });

            const authData = authDataResponse.data;

            if (authData.response && authData.response.payload)
            {
                const authPayload = authData.response.payload;
                const authPayloadString = JSON.stringify(authPayload);

                // -- Verify the id token
                try
                {
                    // -- Save the auth data to this service
                    this.userData = await this.verify(authPayload.accessToken);
                    this.accessToken = authPayload.accessToken;

                    // -- Save the auth data to .access_token in the users filesystem
                    FileService.createFile(FileService.homeDir, this.accessTokenFileName, authPayloadString);
                }
                catch(err)
                {
                    throw new Error("Failed to verify the new access token")
                }                
            }
            else
            {
                throw new Error("Auth was successful but the cli was unable to understand the response!");
            }
        }
        catch(err)
        {
            if (err.response && err.response.data.message)
            {
                throw new Error(err.response.data.message);
            }
            throw err;
        }
    }

    /**
     * Searches the .playbook folder for an .access_token file. Called from the AuthController to setup the auth service
     * This should be called from constructor but it can't as it is async
     *
     * @memberof AuthService
     */
    async getAccessTokenFromFile()
    {
        // -- Attempt to fetch the file
        try
        {
            const accessTokenFile = FileService.findFile(FileService.homeDir, this.accessTokenFileName);

            try
            {
                const accessTokenContentAsJson = JSON.parse(accessTokenFile.contents);

                // -- Verify the accessToken
                try
                {
                    this.userData = await this.verify(accessTokenContentAsJson.accessToken)
                    this.accessToken = accessTokenContentAsJson.accessToken;
                }
                catch(err)
                {
                    LogService.error("The access token in your store is invalid. Login required");
                }
            }
            catch(err)
            {
                // -- Failed to parse the access token data to json
                LogService.error("Error in reading the access token file")
            }
        }
        catch(err)
        {
            // -- The file could not be loaded... guess there is no file
            this.userData = null;
            this.accessToken = null;
        }

    }

    getLoginUrlWithData()
    {
        const clientId = "client_cli";
        const responseType = "code token id_token";
        const state = this.generateState();
        const nonce = "nonce1";
        const scope = "openid profile offline_access";
        const redirectUri = "http://localhost:5000/api/cli/login";
        const responseMode = "query";

        return {
            state : state,
            url : `${this.loginUrl}?client_id=${clientId}&response_type=${responseType}&state=${state}&nonce=${nonce}&scope=${scope}&redirect_uri=${redirectUri}&response_mode=${responseMode}`
        }
    }

    generateState()
    {
        return uuid();
    }



    /**
     * Private functions
     */
    verify(token) {
        var client = jwksClient({
            jwksUri: 'http://id-masterclass.herokuapp.com/op.jwk'
        });

        function getKey(header, callback) {
            client.getSigningKey(header.kid, function (err, key) {
                var signingKey = key.publicKey || key.rsaPublicKey;
                callback(null, signingKey);
            });
        }

        return new Promise((thenCb, catchCb)=>{
            jwt.verify(token, getKey, {json:true}, (err, decoded) => {

                if (err) 
                {
                    catchCb(err);
                }

                thenCb(decoded)
            });
        })
        
    }



    /**
     * Getters and setters
     */

    set accessToken(accessToken)
    {
        this._accessToken = accessToken;

        
    }

    get accessToken()
    {
        // if (!this._accessToken)
        // {
        //     this.getAccessTokenFromFile();
        // }
        
        return this._accessToken;
    }

    get email()
    {
        if (this.userData)
        {
            return this.userData.email;
        }
    }

    get workspaces()
    {
        if (this.userData)
        {
            return this.userData.workspaces;
        }
    }


}

module.exports = new AuthService();
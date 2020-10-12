/**
 * @import Libraries
 */
const Axios = require('axios').default;

/**
 * @import Errors
 */
const AxiosError = require('../../errors/axios.error');

class RestService
{
    constructor()
    {}

    /**
     * Generic get function
     *
     * @param {*} url
     * @param {*} accessToken
     * @returns
     * @memberof RestService
     */
    async get(url, accessToken)
    {
        try
        {
            let headers = this.addAuthHeader({}, accessToken);

            let response = await Axios.get(
                url,
                {
                    headers : headers
                }
            );

            return response.data;
        }
        catch(err)
        {
            throw this.handleAxiosError(err);
        }
    }


    /**
     * Generic post function
     *
     * @param {*} url
     * @param {*} data
     * @param {*} accessToken
     * @returns
     * @memberof RestService
     */
    async post(url, data, accessToken)
    {
        try
        {
            let headers = this.addAuthHeader({}, accessToken);

            let response = await Axios.post(
                url, 
                data,
                {
                    headers : headers
                });
            
            return response.data;
        }
        catch(err)
        {
            throw this.handleAxiosError(err);
        }
    }
    


    /**
     * Takes an axios err and checks whether or not it is a response, request or unknown error.
     * This will returned a self defined AxiosError
     *
     * @param {*} err
     * @memberof RestService
     */
    handleAxiosError(err)
    {
        if (err.response)
        {
            if (err.response.data)
            {
                if (err.response.data.message)
                {
                    throw new AxiosError(err.response.data.message, err.response.status, err.response.data);
                }
                else
                {
                    throw new AxiosError("Response failed!", err.response.status, err.response.data);
                }
            }
            else
            {
                throw new AxiosError("There was an issue with the response but unable to retrieve the response data");
            }
        }
        else if (err.request)
        {
            throw new AxiosError("There was an issue with the request");
        }
        else
        {
            throw new AxiosError("There was an issue with axios")
        }
    }


    /**
     * Adds the Authourization header to the headers object
     *
     * @param {*} headers
     * @param {*} accessToken
     * @returns
     * @memberof RestService
     */
    addAuthHeader(headers, accessToken)
    {
        if (accessToken)
        {
            headers["Authorization"] = "Bearer " + accessToken;
        }

        return headers;
    }
    
}

module.exports = new RestService();
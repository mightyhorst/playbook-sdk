/**
 * Validate all sorts of data
 *
 * @class ValidationService
 */
class ValidationService
{
    /**
     * Check if the string passed in is a github URL
     *
     * @param {*} url
     * @returns {boolean}
     * @memberof ValidationService
     */
    isGithubUrl(url)
    {
        // -- Check for combinations of http, https, www or nothing
        if (url)
        {
            const regExp = /((https?):\/\/)?(www\.)?github\.com\/([^\/]+\/[^\/]+\/$|[^\/]+\/[^\/]+[a-zA-Z0-9]$)/gm

            if (url.match(regExp))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
}

module.exports = new ValidationService();
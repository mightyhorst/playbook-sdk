/**
 * Validate all sorts of data
 *
 * @class ValidationService
 */
class ValidationService
{
    semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
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

    isInt(value, throwMsg = "Value is not a number!")
    {
        const valueAsInt = parseInt(value);

        if (isNaN(valueAsInt))
        {
            throw throwMsg;
        }
    }

    /**
     * Checks if the 2 values have the same unit. Currently supports:
     * %
     * px
     *
     * @param {*} value1
     * @param {*} value2
     * @memberof ValidationService
     */
    isSameUnit(value1, value2)
    {
        return this.isPercent(value1) === this.isPercent(value2)
    }

    isPercent(value)
    {
        return value.indexOf("%") >= 0
    }


    checkAndGetSemver(string)
    {
        let regexResult = string.match(this.semverRegex);

        if (regexResult)
        {
            return {
                major : regexResult[1],
                minor : regexResult[2],
                patch : regexResult[3],
                release : regexResult[4],
                build : regexResult[5]
            }
        }
        else
        {
            return false;
        }
    }
}

module.exports = new ValidationService();

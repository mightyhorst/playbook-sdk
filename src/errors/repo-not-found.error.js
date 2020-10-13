class RepoNotFound extends Error
{
    constructor(message = "The repo could not be found. Could it be private?")
    {
        super(message);
    }
 
    toString()
    {
        return this.message;
    }
}

module.exports = RepoNotFound;
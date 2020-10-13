class NotUniqueError extends Error
{
    constructor(message = "The value is not unique")
    {
        super(message);
    }
 
    toString()
    {
        return this.message;
    }
}

module.exports = NotUniqueError;
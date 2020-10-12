class AxiosError extends Error
{
    constructor(message, status = 500, data = {})
    {
        super(message);
        this.status = status;
        this.data = data;
    }

    toString()
    {
        try
        {
            const dataAsString = JSON.stringify(this.data, undefined, 4);

            return `

                ${this.message}

                ${dataAsString}

            `
        }
        catch(err)
        {
            return `
                ${this.message}
            `
        }
    }
}


module.exports = AxiosError;
import _ from 'lodash';

/**
 * @requires Services
 */
import * as TextIndentService from '../../services/utils/TextIndentService';

/**
 * Base parent for all timeline based models. This will handle the start and duration section
 *
 * @export
 * @class PlaybookTimelineModel
 */
export class PlaybookTimelineModel
{
    start;
    duration;

    constructor(start, duration)
    {
        this.start = start;
        this.duration = duration;
    }

    /**
     * Prints the ".withTime()" portion of a timeline entry which will include the start and duration values
     *
     * @param {number} [indentSize=4]
     * @returns {string}
     * @memberof PlaybookTimelineModel
     */
    printJsContent(indentSize = 4)
    {
        const indent1 = TextIndentService.indent(indentSize);
        const indent2 = TextIndentService.indent(indentSize + 1);

        let content = indent1 + '.withTime({\n';
            content += indent2 + '"start" : ' + this.start + ',\n';
            content += indent2 + '"duration" : ' + this.duration + '\n';
            content += indent1 + "})\n";

        return content;
    }
}


export class PlaybookTimelineDescriptionModel extends PlaybookTimelineModel {
    
    filePath;

    constructor(start, duration, filePath)
    {
        super(start, duration);

        this.filePath = filePath;
    }

    /**
     * Prints the .addDescriptionFromMdFile entry to a timeline
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineDescriptionModel
     */
    printJsContent(indentSize = 4)
    {
        const indent = TextIndentService.indent(indentSize);

        let content = indent + '.addDescriptionFromMdFile(path.join(__dirname, "' + this.filePath + '"))\n';

        content += super.printJsContent(indentSize);

        return content
    }
    
}

export class PlaybookTimelineCodeModel extends PlaybookTimelineModel {
    
    templateFilePath;
    outputFilePath;
    compileData;
    partialModels = [];

    constructor(start, duration, templateFilePath, outputFilePath, compileData)
    {
        super(start, duration);

        this.templateFilePath = templateFilePath;
        this.outputFilePath = outputFilePath;
        this.compileData = compileData;
    }

    /**
     * Create a PlaybookTimelineCodePartialModel that represents ".withPartial()" in the playbook.js
     *
     * @param {*} start
     * @param {*} duration
     * @param {*} partialId
     * @param {*} templateFilePath
     * @param {*} compileData
     * @returns {PlaybookTimelineCodePartialModel}
     * @memberof PlaybookTimelineCodeModel
     */
    addPartial(start, duration, partialId, templateFilePath, compileData)
    {
        const partialModel = new PlaybookTimelineCodePartialModel(start, duration, partialId, templateFilePath, compileData);

        this.partialModels.push(partialModel);

        return partialModel;
    }

    /**
     * Prints the .addCode entry to a timeline
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineCodeModel
     */
    printJsContent(indentSize = 4)
    {
        const indent1 = TextIndentService.indent(indentSize);
        const indent2 = TextIndentService.indent(indentSize + 1);

        let content = indent1 + '.addCode("' + this.templateFilePath + '", "' + this.outputFilePath + '"';
        
        const lastHbsKey = _.findLastKey(this.compileData);

        if (this.compileData && !_.isEmpty(this.compileData))
        {
            content += ", {\n";

            for (let hbsKey in this.compileData)
            {
                let hbsData = this.compileData[hbsKey];

                if (hbsKey === lastHbsKey)
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '"\n'
                }
                else
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '",\n'
                }
            }
            
            content += indent1 + '})\n';
        }
        else
        {
            content += ")\n";
        }

        this.partialModels.forEach((partialModel) => {

            content += partialModel.printJsContent(indentSize + 1);

        })

        content += super.printJsContent(indentSize);
        

        return content;
    }
}


export class PlaybookTimelineCodePartialModel extends PlaybookTimelineModel
{
    partialId;
    templateFilePath;
    compileData;

    constructor(start, duration, partialId, templateFilePath, compileData)
    {
        super(start, duration);

        this.partialId = partialId;
        this.templateFilePath = templateFilePath;
        this.compileData = compileData;
    }

    /**
     * Prints the .withPartial entry that is a child to the .addCode entry
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineCodePartialModel
     */
    printJsContent(indentSize = 5)
    {
        const indent1 = TextIndentService.indent(indentSize);
        const indent2 = TextIndentService.indent(indentSize + 1);

        let content = indent1 + '.withPartial("' + this.partialId + '", "' + this.templateFilePath + '", ' + this.start + ", " + this.duration;

        const lastHbsKey = _.findLastKey(this.compileData);
        if (this.compileData && !_.isEmpty(this.compileData))
        {
            content += ", {\n";

            for (let hbsKey in this.compileData)
            {
                let hbsData = this.compileData[hbsKey];

                if (hbsKey === lastHbsKey)
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '"\n'
                }
                else
                {
                    content += indent2 + '"' + hbsKey + '" : ' + '"' + hbsData + '",\n'
                }
            }

            content += indent1 + '})\n';
        }
        else
        {
            content += ")\n";
        }

        return content;
    }
}



/**
 * Creates a .addCli entry in the playbook.js file. Allows the author to add executable commands to the cli panel in masterclass
 *
 * @export
 * @class PlaybookTimelineCliModel
 * @extends {PlaybookTimelineModel}
 */
export class PlaybookTimelineCliModel extends PlaybookTimelineModel {

    cliCommandModels = [];

    constructor(start, duration)
    {
        super(start, duration);
    }

    addCommand(command)
    {
        const cliCommandModel = new PlaybookTimelineCliCommandModel(command);

        this.cliCommandModels.push(cliCommandModel);

        return cliCommandModel;
    }

    /**
     * Prints the .addCli entry to a timeline
     *
     * @param {number} [indentSize=1]
     * @returns {string}
     * @memberof PlaybookTimelineCliModel
     */
    printJsContent(indentSize = 4)
    {
        const indent1 = TextIndentService.indent(indentSize);
        const indent2 = TextIndentService.indent(indentSize + 1);

        let content = indent1 + '.addCli()\n';

        this.cliCommandModels.forEach((cliCommandModel) => {

            content += cliCommandModel.printJsContent(indentSize + 1);

        })

        content += super.printJsContent(indentSize);
        
        return content;
    }
}

/**
 * Creates a .withCommand entry in the playbook.js file. This will be a command that is to be executed by the cli panel
 *
 * @export
 * @class PlaybookTimelineCliCommandModel
 */
export class PlaybookTimelineCliCommandModel {

    command;

    constructor(command)
    {
        this.command = command;
    }

    /**
     * Prints .withCommand entry as a child to the .addCli entry
     *
     * @param {number} [indentSize=5]
     * @returns
     * @memberof PlaybookTimelineCliCommandModel
     */
    printJsContent(indentSize = 5)
    {
        const indent1 = TextIndentService.indent(indentSize);
        const indent2 = TextIndentService.indent(indentSize + 1);

        let content = indent1 + '.withCommand("' + this.command + '")\n';

        return content;
    }

}
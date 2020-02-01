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

        let content = indent + '.addDescriptionFromMdFile("' + this.filePath + '")\n';

        content += super.printJsContent(indentSize);

        return content
    }
    
}

export class PlaybookTimelineCodeModel extends PlaybookTimelineModel {
    
    filePath;
    compileData;
    partialModels = [];

    constructor(start, duration, filePath, compileData)
    {
        super(start, duration);

        this.filePath = filePath;
        this.compileData = compileData;
    }

    /**
     * Create a PlaybookTimelineCodePartialModel that represents ".withPartial()" in the playbook.js
     *
     * @param {*} start
     * @param {*} duration
     * @param {*} partialId
     * @param {*} filePath
     * @param {*} compileData
     * @returns {PlaybookTimelineCodePartialModel}
     * @memberof PlaybookTimelineCodeModel
     */
    addPartial(start, duration, partialId, filePath, compileData)
    {
        const partialModel = new PlaybookTimelineCodePartialModel(start, duration, partialId, filePath, compileData);

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

        let content = indent1 + '.addCode("' + this.filePath + '"';
        
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
    filePath;
    compileData;

    constructor(start, duration, partialId, filePath, compileData)
    {
        super(start, duration);

        this.partialId = partialId;
        this.filePath = filePath;
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

        let content = indent1 + '.withPartial("' + this.partialId + '", "' + this.filePath + '"';

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

        content += super.printJsContent(indentSize);

        return content;
    }
}
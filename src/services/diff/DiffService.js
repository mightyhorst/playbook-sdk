require('colors');
var Diff = require('diff');

const variableName = () => {
    var index = 0;    
    return (part, line) => { 
        return part.added ? 'lineToAdd'+ index++ : 'lineToRemove'+index++;
    }
}


module.exports = {
    printDiff(one, other) {

        var diff = Diff.diffLines(one, other);

        var line = 0; 

        /**
         * @description for each line added, removed or no change 
         */
        diff.forEach(function (part) {

            /**
             * @description colour scheme
             */
            var color = part.added ? 'green' :
                part.removed ? 'red' : 'grey';
            
            /**
             * @if added
             */
            if(part.added){
                process.stderr.write(part.value[color]);
            }
            /**
             * @if removed
             */
            else if(part.removed){

                process.stderr.write(part.value[color]);
            }
            /**
             * @if no change 
             */
            else{
                process.stderr.write(part.value[color]);
            }
            //     console.log('added at line ['+line+']--->',  part.value)
        });

        // console.log(diff, { diff });

    },
    generateMasterTemplateAndPartials : (oldContent, newContent) => {
        let templateData = {
            masterTemplate : "",
            partials : {

            }
        }

        if (oldContent)
        {
            var diff = Diff.diffLines(oldContent, newContent);
            let partialCount = 1;
        
            diff.forEach((part) => {

                if (part.added)
                {
                    const partialName = "partial_" + partialCount++;
                    templateData.partials[partialName] = part.value;
                    templateData.masterTemplate += "{{" + partialName + "}}"
                }
                else if (part.removed)
                {

                }
                else
                {
                    templateData.masterTemplate += part.value;
                }

            })
        }
        else
        {
            templateData.masterTemplate = newContent;
        }

        return templateData;

    }
}
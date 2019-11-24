/**
 * ! not used 
 */

const COLOURS = {
    MAGENTA: 'magenta',
    GREEN: 'green',
    BLUE: 'blue',
    CYAN: 'cyan',
    PURPLE: 'magenta',
    YELLOW: 'yellow',
    WHITE: 'white',
    BLACK: 'black',
    RED: 'red',
    GREY: 'grey',
    BLACKBRIGHT: 'blackBright',
    REDBRIGHT:'redBright',
    GREENBRIGHT: 'greenBright',
    YELLOWBRIGHT: 'yellowBright',
    BLUEBRIGHT: 'blueBright',
    BRIGHT: 'magentaBright',
    BRIGHT: 'cyanBright',
    BRIGHT: 'whiteBright',
}


/**
 * Closure that returns a new line counter function to swap newlines for line numbers 
 *
 * @param {*} word
 * @returns
 */
function addNewLine(){
    var i = 1; 
    var newLine = '\n';

    return function(word){
        if(word.search('\n') > -1 ) i++;
        return word.replace(new RegExp(newLine, 'g'), `${newLine}[${pad(i)}] `);
    }
}

/**
 * Add prefix of zero for single digits 
 *
 * @param {*} num
 * @param {*} size
 * @returns
 */
function pad(num) {
    return num < 10 ? '0'+num : num;
}

/**
 * Bulk colour the content as individual words array 
 *
 * @param {string} content - large string to break into words and colour 
 * @returns {IWordColour[]} colouredWords - an array of coloured words 
 */
function bulkWordColor(content){

    const transform = (word) => word; //addNewLine();
    const words = content.split(' ');
    const colouredWords = words.map(word => {

        return {
            word: transform(word), 
            colour: wordColor(word)
        }
    });
    return colouredWords;

}

/**
 * Colours the word so it looks like intellisnese 
 *
 * @param {string} word - input word to colour 
 * @returns {IWordColour} wordColour - word and colour 
 */
function wordColor(word){

	switch(word){
        case 'import': 
        case 'export':
            return COLOURS.MAGENTA;
        case 'var':
        case 'let':
        case 'const':
            return COLOURS.BLUE;
        case 'console':
            return COLOURS.GREEN;
        case 'log':
                return COLOURS.YELLOW;
        case 'function':
        case 'class':
                return COLOURS.BLUEBRIGHT;               
        default:

            if(word.includes('playbook(')) 
                return COLOURS.YELLOW;
            else if(word.search('addCategory') > -1)
                return COLOURS.MAGENTA;                
            else if(word.search('addScene') > -1)
                return COLOURS.GREENBRIGHT;                
            else if(word.search('addDescription') > -1)
                return COLOURS.BLUE;                
            else if(word.search('write') > -1)
                return COLOURS.GREY; 
            else 
                return COLOURS.CYAN;
	}

}


module.exports = {
    bulkWordColor: bulkWordColor,
    wordColor: wordColor,
    COLOURS: COLOURS
}
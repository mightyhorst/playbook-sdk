/**
 * Slow print the text at a given speed 
 *
 * @class TypeWriterService
 */
class TypeWriterService{    
    
    /**
     * Typewriter effect slow prints the contents as it emulates a developer typing the file out. 
     * This helps with reading at a nice pace like watching a video 
     *
     * @param {string} txt - Text contents to print out 
     * @param {number} speed - how fast in milliseconds for each character to be printed 
     * @returns {Function} start - start function to begin the process 
     * @memberof Controller
     */
    typeWriter(txt, speed){
        var i = 0;
        var txt = txt || 'Lorem ipsum dummy text blabla.';
        var speed = speed || 10;


        const start = () => {
            if (i < txt.length) {
                process.stdout.write( txt.charAt(i) );
                i++;
                setTimeout(start, speed);
            }            
        }

        return {
            start
        }
            
    }
}
module.exports = new TypeWriterService();
/**
 * Slow print the text at a given speed 
 *
 * @class TypeWriterService
 */
class TypeWriterService {

    /**
     * Typewriter effect slow prints the contents as it emulates a developer typing the file out. 
     * This helps with reading at a nice pace like watching a video 
     *
     * @param {string} txt - Text contents to print out 
     * @param {number} speed - how fast in milliseconds for each character to be printed 
     * @returns {Function} start - start function to begin the process 
     * @memberof Controller
     */
    typeWriter(txt, speed) {
        var i = 0;
        var txt = txt || 'Lorem ipsum dummy text blabla.';
        var speed = speed || 10;


        const start = () => {
            if (i < txt.length) {
                process.stdout.write(txt.charAt(i));
                i++;
                setTimeout(start, speed);
            }
        }

        return {
            start
        }

    }

    /**
     * This works with async/await
     *
     * @param {*} txt
     * @param {*} speed
     * @returns
     * @memberof TypeWriterService
     * 
     * 
     * @tutorial 
        async function main(){
            await typeWriter('ONE.....');
            await typeWriter('TWO.....');
            await typeWriter('THREE.....');
        }
     */
    async awaitTypeWriter(txt, speed) {
        var i = 0;
        var txt = txt || 'Lorem ipsum dummy text blabla.';
        var speed = speed || 10;

        return new Promise(done => {
            const start = () => {


                if (i < txt.length) {
                    process.stdout.write(txt.charAt(i));
                    i++;
                    setTimeout(start, speed);
                }
                else done();

            }
            start();
        });

    }

    /**
     * Pause for a bit 
     *
     * @param {*} ms
     * @returns
     * @memberof TypeWriterService
     * 
     * 
     * @tutorial 
        (async function Main() {
            console.log("Starting...")
            await pause(5000);
            console.log("Ended!")
        })();
     */
    async pause(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("Done waiting");
                resolve(ms)
            }, ms)
        })
    }
}
module.exports = new TypeWriterService();
/**
 * Hello World says hello to the world 
 *
 * @class HelloWorld
 */
class HelloWorld{

    /**
     * name 
     *
     * @private
     * @type {string}
     * @memberof HelloWorld
     */
    private name?:string;

    /**
     * Creates an instance of HelloWorld.
     * @param {string} [name] - name of the world 
     * @memberof HelloWorld
     */
    constructor(name:string){
        this.name = name;
    }

}
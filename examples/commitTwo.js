const assert = require('assert');

class Component{

	three(){
		console.log('hello world');
	}
	
	constructor(){
		this.three();
	}
}

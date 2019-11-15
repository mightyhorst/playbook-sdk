const assert = require('assert');

class Component{

	add(one, two){
		return one + two;
	}

	test(){
		assert(this.add(10,20), 30, 'Check add works');
	}
	
	constructor(){
		this.test();
	}
}

/**
* @component Playbook SDK 
* @description create playbook json like a storybook
* @filename playbook.sdk.js
**/


/**
* @imports Files
* @description Files reading 
**/
// const path = require('path');
const fs = require('fs');


/**
* @imports JSDOM
* @description NodeJs Document Object Model
**/
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = `<html><body></body></html>`;

const document = new JSDOM(html).window.document;
global.document = document;


/**
* @imports  Showdown
* @description Markdown to HTML
**/
const showdown  = require('showdown'),
convertMdToHtml = new showdown.Converter();

/**
* @imports  MDX 
* @description MDX to HTML
**/
// const mdx = require('@mdx-js/mdx')


/**
* @method md2Html
* @description Markdown to HTML wrapper
* @param {string} markdown - markdown string
* @returns {string} html - html converted
**/    
function md2html(markdown) {
	var html = convertMdToHtml.makeHtml(markdown);
	// console.log('html -->\n', html);
	
	return html;
}


const DEFAULTS = {
	start: 'next',
	duration: 5000
}


function htmlToList(dom, parentModel){

	/*
	console.log('-------------------');
	console.log('dom', dom.nodeName);
	console.log('parentModel', parentModel);
	*/

	var models = [];

	for(var i = 0; i < dom.children.length; i++){
		
		var model = {}

		var child = dom.children[i];
		model.tag = child.nodeName.toLowerCase();
		model.txt = child.textContent;
		
		if(child.children.length > 0){
			model.kids = []; 
			
			
			htmlToList(child, model);
		}

		models.push(model);
	
	}

	if(parentModel && parentModel.kids) parentModel.kids = models;

	return parentModel || models;
}

/**
 * @name PlaybookSdk
 * @description Playbook Builder Pattern 
 *
 * @class PlaybookSdk
 */
class PlaybookSdk{

	/**
	 * Creates an instance of PlaybookSdk.
	 * @param {string} name - the title of this playbook
	 * @param {boolean} isDebug - if debug sould print verbose console logs 
	 * @memberof PlaybookSdk
	 */
	constructor(name, isDebug){
		this.DEBUG = isDebug || false;
		this.nextId = 1; 
		this.name = name;
		this.playbookJson = {};

		this.last = {
			category: null,
			scene: null,
			step: null,
			timeline: null, 

			operation: null
		}
	}

	/**
	 * (Optional) config to add to the playbook 
	 *
	 * @param {*} config 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addConfig(config){
		this.playbookJson = {
			config: config
		}
		return this;
	}

	/**
	 * Add a Category 
	 *
	 * @param {string} title - title of the Category to display in the sidebar 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addCategory(title){
		if( !this.playbookJson.hasOwnProperty('categories') ){
			this.playbookJson.categories = [];
		}

		const id = this.nextId++;

		this.playbookJson.categories.push({
			id: id, 
			title: title, 
			scenes: []
		});

		this.last.category = id; 
		
		return this;
	}

	/**
	 * Add a Scene 
	 *
	 * @param {string} title - title of the Category to display in the sidebar 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addScene(title){

		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);

		if( !category.hasOwnProperty('scenes') ){
			category.scenes = [];
		}

		const id = this.nextId++;
		
		category.scenes.push({
			id: id, 
			title: title, 
			steps: []
		});

		this.last.scene = id; 
		
		return this;
	}

	/**
	 * Add a Step 
	 *
	 * @param {string} title - title of the Category to display in the sidebar 
	 * @param {string?} gitBranch? - (optional|NotUsed) git branch to check out for the code files. this is not used 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addStep(title, gitBranch){

		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);

		if(!scene.hasOwnProperty('steps')){
			scene.steps = [];
		}

		const id = this.nextId++;

		scene.steps.push({
			id: id, 
			title : title,
			gitData : {
				branch : gitBranch
			},
			timeline: []
		});

		this.last.step = id; 

		return this;
	}
	/**
	 * Add description in Markdown syntax.
	 * This will be converted to HTML for the playbook.json output 
	 *
	 * @param {*} markdownFn
	 * @param {*} config
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addDescriptionFromMd(markdownFn, config){
		var markdown = markdownFn();
		var html = md2html(markdown);
		return this.addDescription(html, config);
	}

	/**
	 * Add a path to a MDX file to be parsed into HTML for the playbook.json description panel 
	 *
	 * @param {*} markdownFile
	 * @param {*} config
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addDescriptionFromMdFile(markdownFile, config){
		const markdown = fs.readFileSync(markdownFile, 'utf8');
		var html = md2html(markdown);
		return this.addDescription(html, config);
	}

	/**
	 * AddHTML to the description panel to be pretty printed 
	 *
	 * @param {*} fnOrStringOrDomOrReact
	 * @param {*} config
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addDescription(fnOrStringOrDomOrReact, config){

		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);


		let strHtml;

		switch(typeof(fnOrStringOrDomOrReact)){
			case 'string':
				strHtml = fnOrStringOrDomOrReact;
				break;
			case 'function':
				strHtml = fnOrStringOrDomOrReact();
				break;
			case 'object': 
				if(fnOrStringOrDomOrReact instanceof HTMLElement){
					strHtml = fnOrStringOrDomOrReact.outerHTML;
				}
				break;
		}

		// const doc = new DOMParser().parseFromString(strHtml, "text/xml");
		// const dom = doc.firstElementChild;

		const wrapper= document.createElement('div');
		wrapper.innerHTML= strHtml;

		const descriptionJson = htmlToList(wrapper);

		const id = this.nextId++;

		step.timeline.push({
			id: id, 
			"panel": "description", 
			"start": DEFAULTS.start,
			"duration": DEFAULTS.duration,
			"description": descriptionJson
		});

		this.last.timeline = id;

		return this;
	}

	addCode(templateFile, outputFile, compileData) {

		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);

		const id = this.nextId++;

		step.timeline.push({
			id: id,
			"panel": "code",
			"start": DEFAULTS.start,
			"duration": DEFAULTS.duration,
			"code" : {
				"template" : templateFile,
				"partial_sections" : [],
				"output" : outputFile
			}
		})

		this.last.timeline = id;

		return this;
	}

	withPartial(partialId, partialFile, start, duration, compileData) {
		
		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);
		const time = step.timeline.find(time => time.id === this.last.timeline);

		if (time.hasOwnProperty('code') && time.code.hasOwnProperty("partial_sections"))
		{
			time.code.partial_sections.push({
				"partial_id" : partialId,
				"start" : start,
				"duration" : duration,
				"template" : partialFile,
				"template_data" : {}
			})
		}

		return this;
	}

	/**
	 * Add timeline for granular control over how quick the printing is and when it starts 
	 *
	 * @param {*} config
	 * @returns
	 * @memberof PlaybookSdk
	 */
	withTime(config){

		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);
		const time = step.timeline.find(time => time.id === this.last.timeline);

		time.start = config.start;
		time.duration = config.duration;

		return this;
	}
	/**
	 * Debug - print to the console 
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	print(){
		console.log(this.playbookJson);

		return JSON.stringify(this.playbookJson, 0, 4);
	}
	/**
	 * Write the playbook.json to this path 
	 *
	 * @param {*} optionalFilename - full path to the playbook.json. Or else it will print in the current directory as playbook.json 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	write(optionalFilename){
		if(!optionalFilename) optionalFilename = './'+'playbook.json';
		fs.writeFileSync(optionalFilename, this.print(), 'utf8');

		if(this.DEBUG){
			const playbookFile = fs.readFileSync(optionalFilename, 'utf8');
			console.log('playbookFile:\n', playbookFile);
		}

		return this;
	}
}

module.exports = {
	playbook: (name)=>{
		return new PlaybookSdk();
	}
}


/**
* @component Playbook SDK 
* @description create playbook json like a storybook
* @filename playbook.sdk.js
**/

/**
 * @imports Services
 */
const ValidationService = require('./services/utils/ValidationService');

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

	addStepFromModel(stepSdkModel)
	{
		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);

		if(!scene.hasOwnProperty('steps')){
			scene.steps = [];
		}

		scene.steps.push(stepSdkModel.toString());

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
			windowSettings : {
				description : {
					isClosed : false,
					top : "0px",
					left : "0px",
					width : "45%",
					height : "100%",
					transitions : []
				},
				code : {
					isClosed : false,
					top : "0px",
					left : "50%",
					width : "45%",
					height : "80%",
					transitions : []
				},
				terminal : {
					isClosed : true,
					bottom : "0px",
					left : "50%",
					width : "45%",
					height : "20%",
					transitions : []
				}
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

	withPartial(partialId, partialFile, start, duration, template_data) {
		
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
				"template_data" : template_data || {}
			})
		}

		return this;
	}


	/**
	 * Add entry point for commands to be printed to the terminal panel in masterclass
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addTerminal() 
	{
		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);

		const id = this.nextId++;

		step.timeline.push({
			id: id,
			"panel": "terminal",
			"start": DEFAULTS.start,
			"duration": DEFAULTS.duration,
			"terminal" : {
				"commands" : []
			}
		})

		this.last.timeline = id;

		return this;

	}

	
	withCommand(command) 
	{
		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);
		const time = step.timeline.find(time => time.id === this.last.timeline);

		if (time.hasOwnProperty('terminal') && time.terminal.hasOwnProperty('commands'))
		{
			time.terminal.commands.push(command)
		}

		return this;
	}
	
	/**
	 * Adds a transition to the window settings of a window. This allows window movements for a given start and end time
	 *
	 * @param {*} start
	 * @param {*} end
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addTransition(start, end)
	{
		const category = this.playbookJson.categories.find(cat => cat.id === this.last.category);
		const scene = category.scenes.find(scene => scene.id === this.last.scene);
		const step = scene.steps.find(step => step.id === this.last.step);
		const time = step.timeline.find(time => time.id === this.last.timeline);

		let panelName = time.panel;

		if (panelName && step.windowSettings.hasOwnProperty(panelName))
		{
			step.windowSettings[panelName].transitions.push({
				start : start,
				end : end
			})
		}

		return this;
	}

	/**
	 * Sets the window to minimised
	 *
	 * @param {boolean} [isMin=true]
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isMin(isMin = true)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		let panelName = time.panel;

		if (panelName && step.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = step.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isMin = isMin;
				if (isMin && transition.hasOwnProperty('isMax'))
				{
					transition.isMax = false;
				}
			}
			else
			{
				windowSetting.isMin = isMin;
				if (isMin && windowSetting.hasOwnProperty('isMax'))
				{
					windowSetting.isMax = false;
				}
			}
		}

		return this;
	}

	/**
	 * Un-minimises the window
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isNotMin()
	{
		return this.isMin(false);
	}

	/**
	 * Sets the window to maximised
	 *
	 * @param {boolean} [isMax=true]
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isMax(isMax = true)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		let panelName = time.panel;

		if (panelName && step.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = step.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isMax = isMax;
				if (isMax && transition.hasOwnProperty('isMin'))
				{
					transition.isMin = false;
				}
			}
			else
			{
				windowSetting.isMax = isMax;
				if (isMax && windowSetting.hasOwnProperty('isMin'))
				{
					windowSetting.isMin = false;
				}
			}
		}

		return this;
	}

	/**
	 * Un-maximises the window
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isNotMax()
	{
		return this.isMax(false);
	}

	/**
	 * Sets the state of the window to open
	 *
	 * @memberof PlaybookSdk
	 */
	isOpen()
	{
		return this.isClosed(false);
	}

	/**
	 * Sets the state of the window to closed
	 *
	 * @memberof PlaybookSdk
	 */
	isClosed(isClosed = true)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		let panelName = time.panel;

		if (panelName && step.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = step.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isClosed = isClosed;
			}
			else
			{
				windowSetting.isClosed = isClosed;
			}
		}

		return this;
	}

	/**
	 * Take the current position of the window and move it by the left and top values provided
	 *
	 * @param {*} left
	 * @param {*} top
	 * @param {*} opts
	 * @memberof PlaybookSdk
	 */
	move(left, top, opts = { right: false, bottom: false })
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		try
		{
			let leftInt;
			let topInt;
			if (left != undefined || left != null)
			{
				ValidationService.isInt(left, "Left value is not valid! Must be a number, px, or %");
				leftInt = parseInt(left);
			}
			if (top != undefined || top != null)
			{
				ValidationService.isInt(top, "Top value is not valid! Must be a number, px, or %");
				topInt = parseInt(top);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && step.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = step.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Handle the left value
				if (leftInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousLeftValue = this._getPreviousTransitionProperty(windowSetting, "left");
					const previousLeftIsPercent = ValidationService.isPercent(previousLeftValue);

					if (ValidationService.isSameUnit(previousLeftValue, left))
					{
						objToUpdate.left = parseInt(previousLeftValue) + (opts.right ? (-1 * leftInt) : leftInt) + (previousLeftIsPercent ? "%" : "px");
					}
					else
					{
						throw "The left units do not match! Please use " + (previousLeftIsPercent ? "'%'" : "'px'") + " or modify your previous left values"
					}
				}
				if (topInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousTopValue = this._getPreviousTransitionProperty(windowSetting, "top");
					const previousTopIsPercent = ValidationService.isPercent(previousTopValue);

					if (ValidationService.isSameUnit(previousTopValue, top))
					{
						objToUpdate.top = parseInt(previousTopValue) + (opts.bottom ? -1 * topInt : topInt) + (previousTopIsPercent ? "%" : "px");
					}
					else
					{
						throw "The top units do not match! Please use " + (previousTopIsPercent ? "'%'" : "'px'") + " or modify your previous top values"
					}
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Add/subtract the left value from the previous left value
	 *
	 * @param {*} left
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveLeft(left)
	{
		return this.move(left, undefined);
	}

	/**
	 * Add/subtract the right value from the previous left value
	 *
	 * @param {*} right
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveRight(right)
	{
		return this.move(right, undefined, { right : true });
	}

	/**
	 * Add/subtract the top value from the previous top value
	 *
	 * @param {*} top
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveTop(top)
	{
		return this.move(undefined, top);
	}

	/**
	 * Add/subtract the bottom value from the previous top value
	 *
	 * @param {*} bottom
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveBottom(bottom)
	{
		return this.move(undefined, bottom, { bottom : true });
	}

	/**
	 * Sets the left and top values of the window to the values provided
	 *
	 * @param {*} left
	 * @param {*} top
	 * @memberof PlaybookSdk
	 */
	setPosition(left, top)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		try
		{
			let leftInt;
			let topInt;
			if (left != undefined || left != null)
			{
				ValidationService.isInt(left, "Left value is not valid! Must be a number, px, or %");
				leftInt = parseInt(left);
			}
			if (top != undefined || top != null)
			{
				ValidationService.isInt(top, "Top value is not valid! Must be a number, px, or %");
				topInt = parseInt(top);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && step.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = step.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Setting the left and top value
				if (leftInt != undefined)
				{
					objToUpdate.left = leftInt + (ValidationService.isPercent(left) ? "%" : "px");
				}
				if (topInt != undefined)
				{
					objToUpdate.top = topInt + (ValidationService.isPercent(top) ? "%" : "px");
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Take the current window width and height and add/subtract the width and height values provided
	 *
	 * @param {*} width
	 * @param {*} height
	 * @memberof PlaybookSdk
	 */
	changeDimension(width, height)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		try
		{
			let widthInt;
			let heightInt;
			if (width != undefined || width != null)
			{
				ValidationService.isInt(width, "Width value is not valid! Must be a number, px, or %");
				widthInt = parseInt(width);
			}
			if (height != undefined || height != null)
			{
				ValidationService.isInt(height, "Height value is not valid! Must be a number, px, or %");
				heightInt = parseInt(height);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && step.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = step.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Handle the width value
				if (widthInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousWidthValue = this._getPreviousTransitionProperty(windowSetting, "width");
					const previousWidthIsPercent = ValidationService.isPercent(previousWidthValue);

					if (ValidationService.isSameUnit(previousWidthValue, width))
					{
						objToUpdate.width = parseInt(previousWidthValue) + widthInt + (previousWidthIsPercent ? "%" : "px");
					}
					else
					{
						throw "The width units do not match! Please use " + (previousWidthIsPercent ? "'%'" : "'px'") + " or modify your previous width values"
					}
				}
				if (heightInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousHeightValue = this._getPreviousTransitionProperty(windowSetting, "height");
					const previousHeightIsPercent = ValidationService.isPercent(previousHeightValue);

					if (ValidationService.isSameUnit(previousHeightValue, height))
					{
						objToUpdate.height = parseInt(previousHeightValue) + heightInt + (previousHeightIsPercent ? "%" : "px");
					}
					else
					{
						throw "The height units do not match! Please use " + (previousHeightIsPercent ? "'%'" : "'px'") + " or modify your previous height values"
					}
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Add/subtract the width from the previous width value
	 *
	 * @param {*} width
	 * @memberof PlaybookSdk
	 */
	changeWidth(width)
	{
		return this.changeDimension(width, undefined);
	}

	/**
	 * Add/subtract the height from the previous height value
	 *
	 * @param {*} height
	 * @returns
	 * @memberof PlaybookSdk
	 */
	changeHeight(height)
	{
		return this.changeDimension(undefined, height);
	}

	/**
	 * Sets the width and height values of the window to the values provided
	 *
	 * @param {*} width
	 * @param {*} height
	 * @memberof PlaybookSdk
	 */
	setDimension(width, height)
	{
		const step = this._getStep();
		const time = this._getTimeline(step);

		try
		{
			let widthInt;
			let heightInt;
			if (width != undefined || width != null)
			{
				ValidationService.isInt(width, "Width value is not valid! Must be a number, px, or %");
				widthInt = parseInt(width);
			}
			if (height != undefined || height != null)
			{
				ValidationService.isInt(height, "Height value is not valid! Must be a number, px, or %");
				heightInt = parseInt(height);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && step.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = step.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Setting the left and top value
				if (widthInt != undefined)
				{
					objToUpdate.width = widthInt + (ValidationService.isPercent(width) ? "%" : "px");
				}
				if (heightInt != undefined)
				{
					objToUpdate.height = heightInt + (ValidationService.isPercent(height) ? "%" : "px");
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
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
		}

		return this;
	}




	/**
	 * Private helper functions
	 */
	_getCategory()
	{
		return this.playbookJson.categories.find(cat => cat.id === this.last.category);
	}
	_getScene(category)
	{
		if (!category)
		{
			category = this._getCategory();
		}
		return category.scenes.find(scene => scene.id === this.last.scene);
	}
	_getStep(scene)
	{
		if (!scene)
		{
			scene = this._getScene();
		}
		return scene.steps.find(step => step.id === this.last.step);
	}
	_getTimeline(step)
	{
		if (!step)
		{
			step =  this._getStep();
		}
		return step.timeline.find(time => time.id === this.last.timeline);
	}
	_getLastTransition(windowSetting)
	{
		if (windowSetting.transitions.length > 0)
		{
			return windowSetting.transitions[windowSetting.transitions.length - 1];
		}
		else
		{
			return null;
		}
	}
	_getPreviousTransitionProperty(windowSetting, property)
	{
		if (windowSetting.transitions.length > 0)
		{
			let value;

			for (let i = windowSetting.transitions.length - 1; i >= 0; i--)
			{
				const transition = windowSetting.transitions[i];

				// -- Check the transition to see if it has the property, if it does then return it
				if (transition.hasOwnProperty(property))
				{
					value = transition[property];
					break;
				}
			}

			// -- If the value is not found, default to the window settings default value
			if (value == undefined)
			{
				value = windowSetting[property];
			}

			return value;
		}
		else
		{
			return windowSetting[property];
		}
	}
}



















































/**
 * Define the timeline that will be played in masterclass. This will provide instructions 
 * on what to play and when to play content for all panels featured on the masterclass app
 *
 * @class StepSdk
 */
class StepSdk
{
	nextId = 1; 
	name;
	last = {
		timeline: null
	};
	stepData;

	constructor(title, gitBranch)
	{
		this.stepData = {
			title : title,
			gitData : {
				branch : gitBranch
			},
			windowSettings : {
				description : {
					isClosed : false,
					top : "0px",
					left : "0px",
					width : "45%",
					height : "100%",
					transitions : []
				},
				code : {
					isClosed : false,
					top : "0px",
					left : "50%",
					width : "45%",
					height : "80%",
					transitions : []
				},
				terminal : {
					isClosed : true,
					bottom : "0px",
					left : "50%",
					width : "45%",
					height : "20%",
					transitions : []
				}
			},
			timeline: []
		}
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

		this.stepData.timeline.push({
			id: id, 
			"panel": "description", 
			"start": DEFAULTS.start,
			"duration": DEFAULTS.duration,
			"description": descriptionJson
		});

		this.last.timeline = id;

		return this;
	}

	addCode(templateFile, outputFile, template_data) {

		const id = this.nextId++;

		this.stepData.timeline.push({
			id: id,
			"panel": "code",
			"start": DEFAULTS.start,
			"duration": DEFAULTS.duration,
			"code" : {
				"template" : templateFile,
				"template_data": template_data || {}, 
				"partial_sections" : [],
				"output" : outputFile
			}
		})

		this.last.timeline = id;

		return this;
	}

	/**
	 * adds a partial block to the code block
	 * This MUST come after an 'addCode' block
	 * 
	 * @param {string} partialId - partial ID e.g. partial_01
	 * @param {string} partialFile - path to partial file e.g. cat01/scene01/step01/partials/partial_01.hbs
	 * @param {number} start - start time in ms e.g. 200
	 * @param {number} duration - durtion in ms e.g. 2000
	 * @param { {[key:string]: string} } template_data - template data to compile into the partials file e.g. { title: 'Hello world' }
	 * @returns 
	 */
	withPartial(partialId, partialFile, start, duration, template_data) {
		
		const time = this._getTimeline();

		if (time.hasOwnProperty('code') && time.code.hasOwnProperty("partial_sections"))
		{
			time.code.partial_sections.push({
				"partial_id" : partialId,
				"start" : start,
				"duration" : duration,
				"template" : partialFile,
				"template_data" : template_data || {},
			})
		}

		return this;
	}


	/**
	 * Add entry point for commands to be printed to the terminal panel in masterclass
	 *
	 * @param {number} optionalStartMs - start in ms
	 * @param {number} optionalDurationMs - duration in ms
	 * 
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addTerminal(optionalStartMs, optionalDurationMs) 
	{
		const id = this.nextId++;

		this.stepData.timeline.push({
			id: id,
			"panel": "terminal",
			"start": optionalStartMs || DEFAULTS.start,
			"duration": optionalDurationMs || DEFAULTS.duration,
			"terminal" : {
				"commands" : []
			}
		})

		this.last.timeline = id;

		return this;

	}

	/**
	 * add a command to the terminal panel 
	 * @param {string} command - cli command
	 * @returns {PlaybookSdk} this
	 */
	withCommand(command) 
	{
		const time = this._getTimeline();

		if (time.hasOwnProperty('terminal') && time.terminal.hasOwnProperty('commands'))
		{
			time.terminal.commands.push(command);
		}

		return this;
	}
	
	/**
	 * Adds a transition to the window settings of a window. This allows window movements for a given start and end time
	 *
	 * @param {*} start
	 * @param {*} end
	 * @returns
	 * @memberof PlaybookSdk
	 */
	addTransition(start, end)
	{
		const time = this._getTimeline();

		let panelName = time.panel;

		if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
		{
			this.stepData.windowSettings[panelName].transitions.push({
				start : start,
				end : end
			});
		}

		return this;
	}

	/**
	 * Sets the window to minimised
	 *
	 * @param {boolean} [isMin=true]
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isMin(isMin = true)
	{
		const time = this._getTimeline();

		let panelName = time.panel;

		if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = this.stepData.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isMin = isMin;
				if (isMin && transition.hasOwnProperty('isMax'))
				{
					transition.isMax = false;
				}
			}
			else
			{
				windowSetting.isMin = isMin;
				if (isMin && windowSetting.hasOwnProperty('isMax'))
				{
					windowSetting.isMax = false;
				}
			}
		}

		return this;
	}

	/**
	 * Un-minimises the window
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isNotMin()
	{
		return this.isMin(false);
	}

	/**
	 * Sets the window to maximised
	 *
	 * @param {boolean} [isMax=true]
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isMax(isMax = true)
	{
		const time = this._getTimeline();

		let panelName = time.panel;

		if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = this.stepData.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isMax = isMax;
				if (isMax && transition.hasOwnProperty('isMin'))
				{
					transition.isMin = false;
				}
			}
			else
			{
				windowSetting.isMax = isMax;
				if (isMax && windowSetting.hasOwnProperty('isMin'))
				{
					windowSetting.isMin = false;
				}
			}
		}

		return this;
	}

	/**
	 * Un-maximises the window
	 *
	 * @returns
	 * @memberof PlaybookSdk
	 */
	isNotMax()
	{
		return this.isMax(false);
	}

	/**
	 * Sets the state of the window to open
	 *
	 * @memberof PlaybookSdk
	 */
	isOpen()
	{
		return this.isClosed(false);
	}

	/**
	 * Sets the state of the window to closed
	 *
	 * @memberof PlaybookSdk
	 */
	isClosed(isClosed = true)
	{
		const time = this._getTimeline();

		let panelName = time.panel;

		if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
		{
			let windowSetting = this.stepData.windowSettings[panelName];
			let transition = this._getLastTransition(windowSetting);

			if (transition)
			{
				transition.isClosed = isClosed;
			}
			else
			{
				windowSetting.isClosed = isClosed;
			}
		}

		return this;
	}

	/**
	 * Take the current position of the window and move it by the left and top values provided
	 *
	 * @param {*} left
	 * @param {*} top
	 * @param {*} opts
	 * @memberof PlaybookSdk
	 */
	move(left, top, opts = { right: false, bottom: false })
	{
		const time = this._getTimeline();

		try
		{
			let leftInt;
			let topInt;
			if (left != undefined || left != null)
			{
				ValidationService.isInt(left, "Left value is not valid! Must be a number, px, or %");
				leftInt = parseInt(left);
			}
			if (top != undefined || top != null)
			{
				ValidationService.isInt(top, "Top value is not valid! Must be a number, px, or %");
				topInt = parseInt(top);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = this.stepData.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Handle the left value
				if (leftInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousLeftValue = this._getPreviousTransitionProperty(windowSetting, "left");
					const previousLeftIsPercent = ValidationService.isPercent(previousLeftValue);

					if (ValidationService.isSameUnit(previousLeftValue, left))
					{
						objToUpdate.left = parseInt(previousLeftValue) + (opts.right ? (-1 * leftInt) : leftInt) + (previousLeftIsPercent ? "%" : "px");
					}
					else
					{
						throw "The left units do not match! Please use " + (previousLeftIsPercent ? "'%'" : "'px'") + " or modify your previous left values"
					}
				}
				if (topInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousTopValue = this._getPreviousTransitionProperty(windowSetting, "top");
					const previousTopIsPercent = ValidationService.isPercent(previousTopValue);

					if (ValidationService.isSameUnit(previousTopValue, top))
					{
						objToUpdate.top = parseInt(previousTopValue) + (opts.bottom ? -1 * topInt : topInt) + (previousTopIsPercent ? "%" : "px");
					}
					else
					{
						throw "The top units do not match! Please use " + (previousTopIsPercent ? "'%'" : "'px'") + " or modify your previous top values"
					}
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Add/subtract the left value from the previous left value
	 *
	 * @param {*} left
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveLeft(left)
	{
		return this.move(left, undefined);
	}

	/**
	 * Add/subtract the right value from the previous left value
	 *
	 * @param {*} right
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveRight(right)
	{
		return this.move(right, undefined, { right : true });
	}

	/**
	 * Add/subtract the top value from the previous top value
	 *
	 * @param {*} top
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveTop(top)
	{
		return this.move(undefined, top);
	}

	/**
	 * Add/subtract the bottom value from the previous top value
	 *
	 * @param {*} bottom
	 * @returns
	 * @memberof PlaybookSdk
	 */
	moveBottom(bottom)
	{
		return this.move(undefined, bottom, { bottom : true });
	}

	/**
	 * Sets the left and top values of the window to the values provided
	 *
	 * @param {*} left
	 * @param {*} top
	 * @memberof PlaybookSdk
	 */
	setPosition(left, top)
	{
		const time = this._getTimeline();

		try
		{
			let leftInt;
			let topInt;
			if (left != undefined || left != null)
			{
				ValidationService.isInt(left, "Left value is not valid! Must be a number, px, or %");
				leftInt = parseInt(left);
			}
			if (top != undefined || top != null)
			{
				ValidationService.isInt(top, "Top value is not valid! Must be a number, px, or %");
				topInt = parseInt(top);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = this.stepData.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Setting the left and top value
				if (leftInt != undefined)
				{
					objToUpdate.left = leftInt + (ValidationService.isPercent(left) ? "%" : "px");
				}
				if (topInt != undefined)
				{
					objToUpdate.top = topInt + (ValidationService.isPercent(top) ? "%" : "px");
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Take the current window width and height and add/subtract the width and height values provided
	 *
	 * @param {*} width
	 * @param {*} height
	 * @memberof PlaybookSdk
	 */
	changeDimension(width, height)
	{
		const time = this._getTimeline();

		try
		{
			let widthInt;
			let heightInt;
			if (width != undefined || width != null)
			{
				ValidationService.isInt(width, "Width value is not valid! Must be a number, px, or %");
				widthInt = parseInt(width);
			}
			if (height != undefined || height != null)
			{
				ValidationService.isInt(height, "Height value is not valid! Must be a number, px, or %");
				heightInt = parseInt(height);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = this.stepData.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Handle the width value
				if (widthInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousWidthValue = this._getPreviousTransitionProperty(windowSetting, "width");
					const previousWidthIsPercent = ValidationService.isPercent(previousWidthValue);

					if (ValidationService.isSameUnit(previousWidthValue, width))
					{
						objToUpdate.width = parseInt(previousWidthValue) + widthInt + (previousWidthIsPercent ? "%" : "px");
					}
					else
					{
						throw "The width units do not match! Please use " + (previousWidthIsPercent ? "'%'" : "'px'") + " or modify your previous width values"
					}
				}
				if (heightInt != undefined)
				{
					// -- First validate that the existing value has matching units
					const previousHeightValue = this._getPreviousTransitionProperty(windowSetting, "height");
					const previousHeightIsPercent = ValidationService.isPercent(previousHeightValue);

					if (ValidationService.isSameUnit(previousHeightValue, height))
					{
						objToUpdate.height = parseInt(previousHeightValue) + heightInt + (previousHeightIsPercent ? "%" : "px");
					}
					else
					{
						throw "The height units do not match! Please use " + (previousHeightIsPercent ? "'%'" : "'px'") + " or modify your previous height values"
					}
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}

	/**
	 * Add/subtract the width from the previous width value
	 *
	 * @param {*} width
	 * @memberof PlaybookSdk
	 */
	changeWidth(width)
	{
		return this.changeDimension(width, undefined);
	}

	/**
	 * Add/subtract the height from the previous height value
	 *
	 * @param {*} height
	 * @returns
	 * @memberof PlaybookSdk
	 */
	changeHeight(height)
	{
		return this.changeDimension(undefined, height);
	}

	/**
	 * Sets the width and height values of the window to the values provided
	 *
	 * @param {*} width
	 * @param {*} height
	 * @memberof PlaybookSdk
	 */
	setDimension(width, height)
	{
		const time = this._getTimeline();

		try
		{
			let widthInt;
			let heightInt;
			if (width != undefined || width != null)
			{
				ValidationService.isInt(width, "Width value is not valid! Must be a number, px, or %");
				widthInt = parseInt(width);
			}
			if (height != undefined || height != null)
			{
				ValidationService.isInt(height, "Height value is not valid! Must be a number, px, or %");
				heightInt = parseInt(height);
			}

			const panelName = time.panel;

			/*
				Here we are setting the values. We will rebuild the value string to ensure only valid characters are used
			*/
			if (panelName && this.stepData.windowSettings.hasOwnProperty(panelName))
			{
				// -- Get the transition so we can set values
				let windowSetting = this.stepData.windowSettings[panelName];
				let transition = this._getLastTransition(windowSetting);
				let objToUpdate = windowSetting;

				if (transition)
				{
					// -- A transition was found so lets set the transition as the object to update
					objToUpdate = transition;
				}

				// -- Setting the left and top value
				if (widthInt != undefined)
				{
					objToUpdate.width = widthInt + (ValidationService.isPercent(width) ? "%" : "px");
				}
				if (heightInt != undefined)
				{
					objToUpdate.height = heightInt + (ValidationService.isPercent(height) ? "%" : "px");
				}
			}
			return this;
		}
		catch(err)
		{
			throw err;
		}
	}


	/**
	 * Add timeline for granular control over how quick the printing is and when it starts 
	 *
	 * @param {*} config
	 * @returns
	 * @memberof PlaybookSdk
	 */
	withTime(config)
	{
		const time = this._getTimeline();

		time.start = config.start;
		time.duration = config.duration;

		return this;
	}


	_getTimeline()
	{
		return this.stepData.timeline.find(time => time.id === this.last.timeline);
	}
	_getLastTransition(windowSetting)
	{
		if (windowSetting.transitions.length > 0)
		{
			return windowSetting.transitions[windowSetting.transitions.length - 1];
		}
		else
		{
			return null;
		}
	}
	_getPreviousTransitionProperty(windowSetting, property)
	{
		if (windowSetting.transitions.length > 0)
		{
			let value;

			for (let i = windowSetting.transitions.length - 1; i >= 0; i--)
			{
				const transition = windowSetting.transitions[i];

				// -- Check the transition to see if it has the property, if it does then return it
				if (transition.hasOwnProperty(property))
				{
					value = transition[property];
					break;
				}
			}

			// -- If the value is not found, default to the window settings default value
			if (value == undefined)
			{
				value = windowSetting[property];
			}

			return value;
		}
		else
		{
			return windowSetting[property];
		}
	}

	toString()
	{
		return this.stepData;
	}
}

module.exports = {
	playbook: (name)=>{
		return new PlaybookSdk();
	},
	step: (name) => {
		return new StepSdk(name);
	}
}


/**
* @name InputOutput
* @description Input path and Output json 
* @param {string} INPUT_FOLDER - Path to the sample docs to read the MDX files from 
* @param {string} OUTPUT_FILE - Where to store the playbook json
**/
const path = require('path');
const INPUT_FOLDER = path.join(__dirname, './playbook/docs/');
const OUTPUT_FILE = path.join(__dirname, './react.playbook.json');


/**
* @requires global.playbook 
* @requires PlaybookSdk 
* @description create playbook json like a storybook
* @filename playbook.sdk.js
**/
// const PlaybookSdk = require('../src/playbook.sdk');
// const playbook = PlaybookSdk.playbook;

/**
* @method Playbook 
* @description Build a plybook using the builder pattern 
* @param {string} name - desc
* @returns {PlaybookSdk} playbook - playbook instance 
**/
playbook('Hello World')
	.addConfig("cli", {
		"use": "rastasheep/ubuntu-sshd:14.04",
		"as": "@ubuntu",
		"isDefault": true,
		"// @description": "default - optional to switch between different environments"
	})
	/**
	* @category React 
	* 01_hello_world
	**/
	.addCategory('React')
		.addScene('Setting up React')
			.addStep('Install your Apps', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '01_hello_world/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
			.addStep('Quick start', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '01_hello_world/02.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 02_introducing_jsx
	**/
	// .addCategory('Introducing JSX')
		.addScene('JSX Syntax')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '02_introducing_jsx/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
			.addStep('Step 2', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '02_introducing_jsx/02.mdx')
				.withTime({
					"start": 2000,
					"duration": 4000,
				})
	/**
	* 03_rendering_elements
	**/
	// .addCategory('Rendering Elements')				
		.addScene('Rendering Elements')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '03_rendering_elements/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
			.addStep('Step 2', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '03_rendering_elements/02.mdx')
				.withTime({
					"start": 4000,
					"duration": 8000,
				})
	/**
	* 04_components_and_props
	**/
	// .addCategory('Components and Properties')				
		.addScene('Components and Properties')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '04_components_and_props/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 05_state_and_lifecycle
	**/
	// .addCategory('State and Lifecycle')				
		.addScene('State and Lifecycle')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '05_state_and_lifecycle/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 06_handling_events
	**/
	// .addCategory('Handling Events')				
		.addScene('Handling Events')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '06_handling_events/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 07_conditional_rendering
	**/
	// .addCategory('Conditional Rendering')				
		.addScene('Conditional Rendering')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '07_conditional_rendering/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 08_lists_and_keys
	**/
	// .addCategory('Lists and Keys')				
		.addScene('Lists and Keys')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '08_lists_and_keys/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 09_forms
	**/
	// .addCategory('Forms')				
		.addScene('Forms')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '09_forms/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})	
	/**
	* 10_lifting_state_up
	**/
	// .addCategory('Lifting State Up')				
		.addScene('Lifting State Up')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '10_lifting_state_up/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 10_lifting_state_up
	**/
	// .addCategory('Lifting State Up')				
		.addScene('Lifting State Up')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '10_lifting_state_up/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 11_composition_vs_inheritance
	**/
	// .addCategory('Composition vs Inheritance')				
		.addScene('Composition vs Inheritance')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '11_composition_vs_inheritance/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* 12_thinking_in_react
	**/
	// .addCategory('Thinking in React') 		
		.addScene('Thinking in React')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '12_thinking_in_react/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})

	/**
	* @category Redux
	**/
	.addCategory('Redux') 		
		.addScene('Introduction to redux')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '12_thinking_in_react/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	/**
	* @category React and Redux
	**/
	.addCategory('React and Redux') 		
		.addScene('Using Redux with React')
			.addStep('Step 1', '/feature/branch')
				.addDescriptionFromMdFile(INPUT_FOLDER + '12_thinking_in_react/01.mdx')
				.withTime({
					"start": 0,
					"duration": 4000,
				})
	.write( OUTPUT_FILE );

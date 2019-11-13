# Playbook SDK
Playbook is like storybook but for the master class IDE 

### Quick start
```bash
# install globally
npm i -g masterclass-playbook

# OR install locally
yarn add -D masterclass-playbook

# init a simple hello world 
npx playbook init --helloworld
```

This will create a boilerplate `helloworld.playbook.js`

## Example Playbooks 
### Hello World Playbook 
```js
playbook('Title of the playbook')
	.addCategory('Title of the first category')
		.addScene('Title of the First scene')
			.addStep('Say Hello World!')
				.addDescription('Hello World ')
    .write('playbook.hello.json');
```





const router = require('./routes/router');
const chalk = require('chalk');

export function cli(args) {
    clear();
    console.log(`
    🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝

     _____  _              
    |  __ || |             
    | |__) | | __ _ _   _  
    |  ___/| |/ _  | | | | 
    | |    | | (_| | |_| | 
    |_|    |_|\__,_|\__, | 
                    .__/ | 
                    |___/  
        B . O . O . K

    ${chalk.gray('Publish...')}
     🍎  ${chalk.cyan('playbook init')} - create a new playbook 
     🍋  ${chalk.yellow('playbook build')} - builds the playbook.json
     🍉  ${chalk.magenta('playbook push')} - pushes the playbook.json to master-class
     🍑  ${chalk.blueBright('playbook serve')} - pushes the playbook.json and runs it 
     🥑  ${chalk.green('playbook wizard')} - you a wizard to create a playbook on the fly
     🦄  ${chalk.magentaBright('playbook magic')} - reverse engineer a playbook from a git repo
     🔍  ${chalk.cyanBright('playbook validate')} - Validate a playbook.json in a git repo
     📝  ${chalk.yellowBright("playbook draft")} - Create a draft version for a new/existing playbook. Allows the use of masterclass to preview the playbook.json
     🎖   ${chalk.greenBright("playbook publish")} - Publish a new version or existing draft. Allows the public to preview your playbook and use it to learn
     

    ${chalk.gray('Subscribe...')}
     🍇  ${chalk.magenta('playbook play')} - step by step walkthrough of a published playbook 


    ${chalk.gray('More...')}
     🍏  ${chalk.green('playbook register')} - register an existing git repo 
     🍑  ${chalk.blueBright('playbook setup')} - setup common platforms: storybook, jest, cypress and more!

    🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝 🥝
    
    `
    );

    router(args);

}


function clear(){
    const readline = require('readline')
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
}
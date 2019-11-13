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
     🍋  ${chalk.magentaBright('playbook build')} - builds the playbook.json
     🍉  ${chalk.yellow('playbook push')} - pushes the playbook.json to master-class
     🍑  ${chalk.green('playbook serve')} - pushes the playbook.json and runs it 
     🥑  ${chalk.blueBright('playbook create')} - choose your adventure

    ${chalk.gray('Subscribe...')}
     🍇  ${chalk.greenBright('playbook play')} - step by step walkthrough of a published playbook 

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
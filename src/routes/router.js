const chalk = require('chalk');

const ROUTES = {
    INTERACTIVE: 'interactive',
    INIT: 'init',
    BUILD: 'build',
    PUSH: 'push',
    REGISTER: 'register',
}
const CTRLS = {
    playbookInit: require('../ctrls/PlaybookInitCtrl'),
    playbookBuild: require('../ctrls/PlaybookBuildCtrl'),
    //todo playbookPush: require('../ctrls/PlaybookPushCtrl'),
    //todo playbookRegister: require('../ctrls/PlaybookRegisterCtrl'),
}


module.exports = async (args) => {

    const cmd = args.length > 2 ? args[2] : 'interactive';
    switch(cmd){

        case ROUTES.INTERACTIVE: 
            console.log('🥑  Interactive loading...');
            break;

        case ROUTES.INIT:
            
            console.log('🍎  Creating a new playbook for you...');
            CTRLS.playbookInit.createPlaybook(args);

            break;

        case ROUTES.BUILD:
            
            console.log('🐸  Building started ... ');
            CTRLS.playbookBuild.buildPlaybook(args);
        
            break;

        case ROUTES.PUSH:
            
            console.log('🍋  Push started ... ');
            //todo CTRLS.playbookPush.pushPlaybook(args);
        
            break;

        case ROUTES.REGISTER:

            console.log('🦊  Register the storybook started ... ');
            //todo CTRLS.playbookRegister.registerPlaybook(args);

            break;

        default:
            console.log('❌  unknown command: '+ cmd);
            break;
    }

}
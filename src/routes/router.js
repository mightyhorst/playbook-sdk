const chalk = require('chalk');

const ROUTES = {
    INTERACTIVE: 'interactive',
    LOGIN: 'login',
    LOGOUT: 'logout',
    INIT: 'init',
    BUILD: 'build',
    PUSH: 'push',
    REGISTER: 'register',
    MAGIC: 'magic',
    SERVER_MAGIC: 'smagic',
    VALIDATE: 'validate',
    DRAFT: 'draft',
    PUBLISH: 'publish'
}
const CTRLS = {
    auth : require('../ctrls/AuthController'),
    playbookInit: require('../ctrls/PlaybookInitCtrl'),
    playbookBuild: require('../ctrls/PlaybookBuildCtrl'),
    //todo playbookPush: require('../ctrls/PlaybookPushCtrl'),
    //todo playbookRegister: require('../ctrls/PlaybookRegisterCtrl'),
    playbookMagic: require('../ctrls/PlaybookMagicCtrl'),
    playbookServerMagic: require('../ctrls/PlaybookServerMagicCtrl'),
    playbookValidate: require('../ctrls/PlaybookValidateCtrl'),
    playbookVersion: require('../ctrls/PlaybookVersionCtrl')
}


const axios = require('axios').default;

module.exports = async (args) => {

    const cmd = args.length > 2 ? args[2] : 'interactive';
    switch(cmd){
        case ROUTES.INTERACTIVE: 
            console.log('🥑  Interactive loading...');
            break;
        case ROUTES.LOGIN:
            console.log('🤝  Logging in...');

            CTRLS.auth.login();

            break;
        case ROUTES.LOGOUT:
            console.log('👋  Logging out...');

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
        case ROUTES.MAGIC:

            console.log('🦄  Magic started ... ')
            CTRLS.playbookMagic.convertGit2Playbook(args);

            break;
        case ROUTES.SERVER_MAGIC:
            console.log('🦄  Server magic started ... ')
            CTRLS.playbookServerMagic.createBlueprintFromGitUrl(args);

            break;
        case ROUTES.VALIDATE:
            
            console.log('🔍  Validate a playbook.json');
            CTRLS.playbookValidate.validate(args);

            break;
        case ROUTES.DRAFT:

            console.log('📝  Create a draft version');
            CTRLS.playbookVersion.draft(args);

            break;
        case ROUTES.PUBLISH:
            
            console.log('🎖  Publish a version');
            CTRLS.playbookVersion.publish(args);

            break;
        default:
            console.log('❌  unknown command: '+ cmd);
            break;
    }

}
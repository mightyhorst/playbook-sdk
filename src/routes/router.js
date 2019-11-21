const chalk = require('chalk');

const ROUTES = {
    INTERACTIVE: 'interactive',
    INIT: 'init',
    BUILD: 'build',
}
const CTRLS = {
    playbookInit: require('../ctrls/PlaybookInitCtrl'),
    playbookBuild: require('../ctrls/PlaybookBuildCtrl'),
}


module.exports = (args) => {

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

        default:
            console.log('❌  unknown command: '+ cmd);
            break;
    }

}
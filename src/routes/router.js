const ROUTES = {
    INTERACTIVE: 'interactive',
    INIT: 'init',
}
const CTRLS = {
    sxd: require('../ctrls/sxd.ctrl')
}


module.exports = (args) => {

    const cmd = args.length > 2 ? args[2] : 'interactive';
    switch(cmd){

        case ROUTES.INTERACTIVE: 
            console.log('🥑  Interactive loading...');
            break;

        case ROUTES.INIT:
            
            console.log('🍎  Creating a new playbook for you...');
            CTRLS.sxd.createPlaybook(args);

            break;

        default:
            console.log('❌  unknown command: '+ cmd);
            break;
    }

}
const ROUTES = {
    INTERACTIVE: 'interactive',
    INIT: 'init',
}

module.exports = (args) => {

    const cmd = args.length > 2 ? args[2] : 'interactive';
    switch(cmd){
        case ROUTES.INTERACTIVE: 
            console.log('🥑 interactive loading...');
            break;
        case ROUTES.INIT:
            console.log('🍎 creating a new playbook for you...');
            break;
        default:
            console.log('❌ unknown command: '+ cmd);
            break;
    }

}
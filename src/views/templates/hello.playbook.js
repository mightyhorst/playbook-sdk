    const playbook = require('masterclass-playbook'); 
    /** 
     * or import {playbook} from 'masterclass-playbook'; 
     **/
    playbook('Title of the playbook')                   
        .addCategory('Title of the first category')     
            .addScene('Title of the First scene')       
                .addStep('Say Hello World!')            
                    .addDescription('Hello World ')     
        .write('./playbook.hello.json');                


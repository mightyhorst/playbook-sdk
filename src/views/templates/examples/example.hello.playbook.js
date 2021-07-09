    /** 
     * @requires global.playbook to be set. This is set by the cli tool 
     */
    /** 
     * or import {playbook} from 'masterclass-playbook'; 
     **/
    playbook('Title of the playbook')                   
        .addCategory('Title of the first category')     
            .addScene('Title of the First scene')       
                .addStep('Say Hello World!')            
                    .addDescription('Hello World ')     
        .write('./playbook.json');                


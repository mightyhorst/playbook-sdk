const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const glob = require('glob');

/**
 * @requires Config
 */
const {
    PLAYBOOK,
} = require('../constants');

/**
 * @requires Services
 */
const {
    PlaybookJsonService,
} = require('../services/utils');

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Services 
 */
const PlaybookApiService = require('../services/PlaybookApiService');
const FilesService = require('../services/utils/FilesService');

/**
 * @requires Views
 */
const {
    ChooseWorkingDirView,
    ChooseCategoryView,
    ChooseSceneView,
    ChooseStepView,
    CreateNewCategoryView,
    CreateNewSceneView,
    CreateNewStepView,
    ShowStepMenuView,
    CreateNewDescriptionView,
    AuditFixView,
} = require('../views');

/**
 * @requires Models
 */
const {
    PlaybookModel,
    PlaybookCategoryModel,
    PlaybookSceneModel,
    PlaybookStepModel,
    PlaybookWindowSettingsModel,
    PlaybookTimelineModel,
    PlaybookTimelineTransitionModel,
    PlaybookTimelineDescriptionModel,
    PlaybookTimelineCodeModel,
    PlaybookTimelineCodePartialModel,
    PlaybookTimelineTerminalModel,
    PlaybookTimelineTerminalCommandModel,
} = require('../models');

class PlaybookWizardCtrl extends Controller{

    constructor(){
        super();
        /**
         * @constant {PlaybookService} playbookSrv
         */
        this.playbookSrv = PlaybookApiService;
        /**
         * @constant {FilesService} filesSrv
         */
        this.filesSrv = FilesService;

        this.cwd = './';
        this.categories = [];
        this.scenes = [];
        this.steps = [];
        this.chosenCategoryId = 'cat01';
        this.chosenSceneId = 'scene01';
        this.chosenStepId = 'step01';
        // this.nextCatId = '01';
        // this.nextSceneId = '01';
        // this.nextStepId = '01';

        

    }
    // set chosenCategory(catId){
    //     this.chosenCategoryId = catId;
    // }
    // get chosenCategory(){
    //     return this.getChosenCategory();
    // }
    getChosenCategory(){
        return this.categories.find(cat => cat.id === this.chosenCategoryId);
    }
    // set chosenScene(sceneId){
    //     this.chosenSceneId = sceneId;
    // }
    // get chosenScene(){
    //     return this.getChosenScene();
    // }
    getChosenScene(){
        return this.scenes.find(scene => scene.id === this.chosenSceneId);
    }
    // set chosenStep(stepId){
    //     this.chosenStepId = stepId;
    // }
    // get chosenStep(){
    //     return this.getChosenStep();
    // }
    getChosenStep(){
        return this.steps.find(step => step.id === this.chosenStepId);
    }
    get pathToCatFolder(){
        return path.join(this.cwd, this.chosenCategoryId);
    }
    get pathToSceneFolder(){
        return path.join(this.pathToCatFolder, this.chosenSceneId);
    }
    get pathToStepFolder(){
        return path.join(this.pathToSceneFolder, this.chosenStepId);
    }

    async handle(args){

        /**
         * @step remove node, playbook, wizard from args
         */
        args.splice(0,3);
        
        if(args.length >= 1){
            switch(args[1]){
                case 'usage':
                case '--help':
                    this.printUsage();
                default:
                    this.printUnknownCommand(args[1]);
            }
        }
        else{
            try{
                this.clear();
                await this._choosePwd();
                // await this._chooseCategory();
                // await this._chooseScene();
                // await this._chooseStep();
            }
            catch(err){
                console.error(chalk.red(err.name + ` message:`), err.message);
                console.error(chalk.grey(`Stack:\n`), err.stack);
            }
        }
    }
    /**
     * choose the present working directory
     * @async
     */
    async _choosePwd(){
        /**
         * @step choose working dir
         */
        const choosePwd = new ChooseWorkingDirView();
        try{
            this.cwd = await choosePwd.show(); 

            /**
             * @step attempt to load playbook.json
             * @throws validation error
             */
            this.playbookJsonSrv = new PlaybookJsonService(this.cwd);

            /**
             * @goto audits 
             */
            this._audits();

        }catch(err){
            console.log(err.message);
            throw err;
        }
    }
    /**
     * audit the playbook.json and playbook folders
     * @async
     */
    async _audits(){
        try{
            /**
             * @step validate - this has already happened
             * @deprecated - already done
             */
            this.playbookJsonSrv.validate();
            
            /**
             * @step audit categories
             */
            const isValid = this.playbookJsonSrv.audit();
            // const isValid = this.playbookJsonSrv.auditCategories();
            
            /**
             * @goto all the validations have passed,so go to the categories menu
             */
            if(isValid){
                const playbookModel = this.playbookJsonSrv.convertToModel();
                const txtPlaybookJs = playbookModel.printJsContent();
                console.log(`txtPlaybookJs--->\n`, chalk.cyan(txtPlaybookJs));
                playbookModel.stepModels.map(step => {
                    console.log(`\n step.playbook.js \n ${step.relativePathFromPlaybookFolder} \n ${step.fullPathToFolder} \n`, chalk.green(step.printJsContent()));
                });
                process.exit();
                await this._chooseCategory();
            }
            else{
                console.log(chalk.red.bold(`\n💩 I'm sorry, but the playbook.json is not valid:`));
                console.log(chalk.italic(`Please go and fix the original playbook.json:`));
                console.log(chalk.grey.italic('📃'+this.playbookJsonSrv.pathToPlaybookJson));

                const auditView = new AuditFixView();
                const {
                    shouldIUpdatePlaybookJson,
                    shouldICreateMissingFolders,
                } = await auditView.show();

                if(shouldICreateMissingFolders){
                    this.playbookJsonSrv.createMissingFolders();
                }
                if(shouldIUpdatePlaybookJson){
                    this.playbookJsonSrv.updateMissingPlaybookJson();
                }
            }
        }
        catch(err){
            throw err;
        }
    }
    async _chooseCategory(){
        /**
         * @step choose category
         */
        const {categories, nextCatId} = this.filesSrv.findCategories(this.cwd);
        this.nextCatId = nextCatId; 

        /**
         * @view show choose a category menu 
         */
        const catView = new ChooseCategoryView(categories);
        const {
            isNew,
            isExit,
            value: folderName,
        } = await catView.show();

        if(isNew){
            await this._createNewCategory(nextCatId);
        }
        else if(isExit){
            console.log(chalk.grey(`👋 Goodbye ;-)`));
            process.exit();
        }
        else{
            this.chosenCategoryId = folderName;
            /**
             * @step find folder in playbook.json
             */
            try{
                this.chosenCategory = this.playbookJsonSrv.findCategoryByFolderName(folderName);
                console.log(chalk.italic(`You chose the category: "${this.chosenCategory.title}"\n`));
            } catch(err){
                throw err;
            }
        }

        /**
         * @goto Choose Scene
         */   
        await this._chooseScene();
    }
    async _createNewCategory(nextCatId){
        const newCatView = new CreateNewCategoryView(nextCatId);
        const {
            isValid,
            id,
            folderName,
            title,
        } = await newCatView.show();

        /**
         * @todo 
         *  - Add category model 
         *  - Change choseCategory to pointer to model getter
         *  - Change goto to go to scene from here
         *  - add back button to the menu
         *  - read from playbook.json or playbook.js
         *  - 
         */
        this.categories.push({
            id,
            folderName,
            title,
        });
        this.chosenCategoryId = id;

        /**
         * @step create the category folder (same ID and folderName)
         */
        const folderModel = this.filesSrv.createFolder(
            this.cwd,
            folderName,
        );
        return folderModel;
    }
    async _chooseScene(){
        this.clear();
        /**
         * @step choose scene
         */
        const {scenes, nextSceneId} = this.filesSrv.findScenes(this.pathToCatFolder);
        this.nextSceneId = nextSceneId; 

        /**
         * @view show choose a scene menu 
         */
        const sceneView = new ChooseSceneView(scenes);
        const {
            isNew,
            isBack,
            isExit,
            value: folderName,
        } = await sceneView.show();

        if(isNew){
            await this._createNewScene(nextSceneId);
        }
        else if(isBack){
            await this._chooseCategory();
        }
        else if(isExit){
            console.log(chalk.grey(`👋 Goodbye ;-)`));
            process.exit();
        }
        else{
            this.chosenSceneId = folderName;

            /**
             * @step find folder in playbook.json
             */
             try{
                this.chosenScene = this.playbookJsonSrv.findSceneByFolderName(folderName);
                console.log(chalk.italic(`You chose the scene: "${this.chosenScene.title}"\n`));
            } catch(err){
                throw err;
            }

            /**
             * @step audit the step 
             */
            //  this.playbookJsonSrv.auditScenes(this.pathToCatFolder);
        }

        /**
         * @goto Choose Step
         */   
         await this._chooseStep();
    }
    async _createNewScene(nextSceneId){
        const newSceneView = new CreateNewSceneView(nextSceneId);
        const {
            isValid,
            id,
            folderName,
            title,
        } = await newSceneView.show();
        /**
         * @step add scene
         * @todo change to a model 
         */
        this.scenes.push({
            id,
            folderName,
            title,
        });

        /**
         * @step choose active step 
         */
        this.chosenSceneId = id;

        /**
         * @step create a folder 
         */
        const folderModel = this.filesSrv.createFolder(
            this.pathToCatFolder,
            folderName,
        );
        return folderModel;
    }
    async _chooseStep(){
        this.clear();
        /**
         * @step add steps based on the folders 
         */
        const {steps, nextStepId} = this.filesSrv.findSteps(this.pathToSceneFolder);
        this.nextStepId = nextStepId; 

        /**
         * @view show choose a category menu 
         */
        const stepView = new ChooseStepView(steps);
        const {
            isNew,
            isBack,
            isExit,
            value: folderName,
        } = await stepView.show();

        if(isNew){
            await this._createNewStep(nextStepId);
        }
        else if(isBack){
            await this._chooseScene();
        }
        else if(isExit){
            console.log(chalk.grey(`👋 Goodbye ;-)`));
            process.exit();
        }
        else{
            this.chosenStepId = folderName;

            /**
             * @step find folder in playbook.json
             */
             try{
                this.chosenStep = this.playbookJsonSrv.findStepByFolderName(folderName);
                console.log(chalk.italic(`You chose the step: "${this.chosenStep.title}"\n`));
            } catch(err){
                throw err;
            }

            /**
             * @step audit the step 
             */
            // this.playbookJsonSrv.auditSteps(this.pathToSceneFolder);
        }

        /**
         * @goto Show step menu
         */
        await this._showStepMenu();
    }
    async _createNewStep(nextStepId){
        const newStepView = new CreateNewStepView(nextStepId);
        const {
            isValid,
            id,
            folderName,
            title,
        } = await newStepView.show();
        /**
         * @step add scene
         * @todo change to a model 
         */
         this.steps.push({
            id,
            folderName,
            title,
            timeline: [],
        });

        /**
         * @step Select the step ID
         */
        this.chosenStepId = id;

        /**
         * @step create a step folder 
         */
        const folderModel = this.filesSrv.createFolder(
            this.pathToSceneFolder,
            newStepName,
        );
        return folderModel;
    }
    async _showStepMenu(){
        const stepMenu = new ShowStepMenuView();
        const option = await stepMenu.show();
        switch(option){
            case stepMenu.BACK:
                await this._chooseStep();
                break;
            case stepMenu.EDIT_TIMELINE:
                await this._showEditTimeline();
                break;
            case stepMenu.ADD_DESCRIPTION:
                await this._showAddDescription();
                break;
            case stepMenu.ADD_CODE:
                await this._showAddCode();
                break;
            case stepMenu.ADD_TEST:
                await this._showAddTest();
                break;
            case stepMenu.ADD_CLI:
                await this._showAddCli();
                break;
            case stepMenu.ADD_AUDIO:
                await this._showAddAudio();
                break;
            case stepMenu.EXIT:
                console.log('👋 Goodbye!');
                break;
        }
    }
    async _showEditTimeline(){
        
    }
    async _showAddDescription(){

        const defaultDescription = `# ${this.getChosenStep() ? this.getChosenStep().title : this.chosenStepId}`;

        try{
            const createDescView = new CreateNewDescriptionView(
                PLAYBOOK.defaultDescriptionFilename,
                defaultDescription,
                PLAYBOOK.defaultStart,
                PLAYBOOK.defaultDuration,
            );
            const {
                isValid,
                validationErrors,
                fileName,
                description,
                start,
                duration,
            } = await createDescView.show();

            if(isValid){

                /**
                 * @check step folder exists
                 */
                const folderExists = fs.existsSync(this.pathToStepFolder);
                if(!folderExists){
                    throw new Error(chalk.red('Folder does not exist: ')+this.pathToStepFolder);
                }

                const pathToDescFile = path.resolve(this.pathToStepFolder, fileName);

                /**
                 * @step write description file 
                 */
                let fileDescription;
                try{
                    fs.writeFileSync(pathToDescFile, description, 'utf8');
                    fileDescription = fs.readFileSync(pathToDescFile, 'utf8');
                }catch(err){
                    throw new Error(chalk.red(`Problem writing the description file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                }

                /**
                 * @check description file contents matches contents
                 */
                if(description !== fileDescription){
                    throw new Error(chalk.red(`Description files do not match\n`), {description, fileDescription});
                }

                /**
                 * @step update the models 
                 */
                const step = this.getChosenStep();

                /**
                 * @check the chosen step matches the chosenStepId
                 */
                if(this.chosenStepId !== step.id){

                }

                /**
                 * @step 
                 */


                /**
                 * @debug
                 */
                console.log(
                    `TODO: write description md file\nTODO: add step model\nTODO: build playbooks.js and step.playbook.js from models tree`,
                    {
                        description,
                        fileDescription,
                        start,
                        duration,
                    }
                );

            }
            else{
                console.error(chalk.redBright(`The Description had validation errors`)+`\n\n`+chalk.grey(`Here's are the errors:`), validationErrors);
                this._showStepMenu();
            }
        }
        catch(err){
            console.error(err);
        }
    }
    async _showAddCode(){
        console.log('_showAddCode');
    }
    async _showAddTest(){
        console.log('_showAddTest');
    }
    async _showAddCli(){
        console.log('_showAddcli');
    }
    async _showAddAudio(){
        console.log('_showAddAudio');
    }

    _printUsage(){
        console.log(`If you run ${chalk.magenta('playbook wizard')} it will create category, scenes and steps via cli`);  
    }
}

module.exports = new PlaybookWizardCtrl();

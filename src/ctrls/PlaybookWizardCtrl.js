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
const PlaybookBuildCtrl = require('./PlaybookBuildCtrl');
const PlaybookInitCtrl = require('./PlaybookInitCtrl');

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
    CreateTimelineDescriptionView,
    CreateTimelineCodeView,
    CreateTimelineCodePartialView,
    EditTimelineView,
    EditTimelineDescriptionView,
    AuditFixView,
    ChoosePartialView,
    ConfirmAddPartialView,
    ShouldIInitPlaybookView,
    ChooseATitleView,
} = require('../views');

/**
 * @requires Models
 */
const {
    // PlaybookModel,
    // PlaybookCategoryModel,
    // PlaybookSceneModel,
    // PlaybookStepModel,
    // PlaybookWindowSettingsModel,
    // PlaybookTimelineModel,
    // PlaybookTimelineTransitionModel,
    // PlaybookTimelineDescriptionModel,
    // PlaybookTimelineCodeModel,
    // PlaybookTimelineCodePartialModel,
    // PlaybookTimelineTerminalModel,
    // PlaybookTimelineTerminalCommandModel,
} = require('../models');
const PlaybookModel = require('../models/playbook/PlaybookModel');
const PlaybookCategoryModel = require('../models/playbook/PlaybookCategoryModel');
const PlaybookSceneModel = require('../models/playbook/PlaybookSceneModel');
const PlaybookStepModel = require('../models/playbook/PlaybookStepModel');
const {
    PlaybookTimelineCodeModel, 
    PlaybookTimelineCodePartialModel, 
    PlaybookTimelineDescriptionModel,
} = require('../models/playbook/PlaybookTimelineModel');

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
        /**
         * @constant {PlaybookBuildCtrl} buildCtrl
         */
        this.buildCtrl = PlaybookBuildCtrl;
        /**
         * @constant {PlaybookInitCtrl} initCtrl
         */
        this.initCtrl = PlaybookInitCtrl;

        /**
         * @constant {PlaybookModel} playbookModel - playbook model of processed SDK friendly models read from the playbook.json
         * @see this._audit() 
         */
        this.playbookModel = null; 

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
    _exit(){
        console.log(chalk.grey(`👋 Goodbye ;-)`));
        process.exit();
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
    getChosenCategoryModel(){
        return this.playbookModel.categoryModels.find(cat => cat.id === this.chosenCategoryId);
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
    getChosenSceneModel(){
        const catModel = this.getChosenCategoryModel();
        if(catModel){
            return catModel.sceneModels.find(model => model.id === this.chosenSceneId);
        }
        else{
            return false;
        }
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
    getChosenStepModel(){
        const sceneModel = this.getChosenSceneModel();
        if(sceneModel){
            return sceneModel.stepModels.find(model => model.id === this.chosenStepId);
        }
        else{
            return false;
        }
    }
    
    get pathToCatFolder(){
        return path.resolve(this.cwd, this.chosenCategoryId);
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
                // this.clear();
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
    _build(){
        /**
         * @namespace playbook.js
         * @step create playbook.js
         */
        const playbookJsContents = this.playbookModel.printJsContent();
        // console.log(chalk.yellowBright.inverse(`PLAYBOOK.JS`), playbookJsContents);

        /**
         * @step write playbook.js
         */
        try{
            // const playbookJsFile = path.join(this.cwd, 'playbook.js');
            const playbookJsFile = path.resolve(this.cwd, 'playbook.js');
            fs.writeFileSync(playbookJsFile, playbookJsContents, 'utf8');
            const checkContents = fs.readFileSync(playbookJsFile, 'utf8');
            if(checkContents !== playbookJsContents){
                throw new Error(chalk.red(`💩 Contents for writing playbook.js failed`), JSON.stringify({checkContents, playbookJsContents}, null, 4));
            }
        } catch(err){
            throw err;
        }

        /**
         * @step check folders
         */
        this.playbookModel.categoryModels.map(categoryModel => {
            this._validateCategoryModel(categoryModel);
            const categoryFolder = path.resolve(this.cwd, categoryModel.folderName);

            categoryModel.sceneModels.map(sceneModel => {
                this._validateSceneModel(sceneModel);
                const sceneFolder = path.join(categoryFolder, sceneModel.folderName);

                sceneModel.stepModels.map(stepModel => {
                    this._validateStepModel(stepModel);
                    const stepFolder = path.join(sceneFolder, stepModel.folderName);
                    const stepPlaybookJsContents = stepModel.printJsContent();

                    try{
                        const stepPlaybookJsFile = path.join(stepFolder, 'step.playbook.js');
                        fs.writeFileSync(stepPlaybookJsFile, stepPlaybookJsContents, 'utf8');
                        const checkContents = fs.readFileSync(stepPlaybookJsFile, 'utf8');
                        if(checkContents !== stepPlaybookJsContents){
                            throw new Error(chalk.red(`💩 Contents for writing step.playbook.js failed`), JSON.stringify({checkContents, stepPlaybookJsContents}, null, 4));
                        }
                    } catch(err){
                        throw err;
                    }
                });
            });
        });
        
        /**
         * @namespace playbook.json
         * @step build playbook.json
         */
        this.buildCtrl.build(this.cwd);
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
             * @constant isPlaybookJsonMissing - is playbook there, before we validate/audit
             */
            const doesPlaybookJsonExist = this.playbookJsonSrv.doesPlaybookJsonExist();

            if(!doesPlaybookJsonExist){
                console.log(chalk.red.bold(`\n💩 I'm sorry, but I could not find a playbook.json at this location:`));
                console.log(chalk.italic(`Here is where I am looking for the playbook.json:`));
                console.log(chalk.grey.italic('📃'+this.playbookJsonSrv.pathToPlaybookJson));
                console.log(chalk.italic(chalk.green.italic(`\n🤖 Let's create a new one...`)));

                /**
                 * @todo Do you want to init a playbook 
                 */
                const initPlaybookView = new ShouldIInitPlaybookView();
                const doYouWantToInitPlaybook = await initPlaybookView.show();
                if(doYouWantToInitPlaybook){
                    /**
                     * @goto init 
                     */
                    await this._initPlaybook();
                    this.playbookJsonSrv.setPlaybookJson(this.cwd);
                }
                else{
                    /**
                     * @step let's jump straight to choose category menu 
                     */
                    const titleView = new ChooseATitleView();
                    const title = await titleView.show();
                    this.playbookModel = new PlaybookModel(title);
                    return await this._chooseCategory();
                }
            }

            /**
             * @goto audits 
             */
            return await this._audits();

        } catch(err){
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
             */
            this.playbookJsonSrv.validate();
            
            /**
             * @step audit categories
             */
            const isValid = this.playbookJsonSrv.audit();
            
            /**
             * @goto all the validations have passed,so go to the categories menu
             */
            if(isValid){
                this.playbookModel = this.playbookJsonSrv.convertToModel();
                
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
    async _initPlaybook(){
        return await this.initCtrl.createPlaybook();
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
        /*
        this.categories.push({
            id,
            folderName,
            title,
        });
        */

        // --------------
        /**
         * @step add category
         */
        const catModel = new PlaybookCategoryModel(
            title,
            id,
            folderName,
        );
        catModel.fullPathToFolder = path.resolve(this.cwd, folderName);

        /**
         * @step add category to playbook models
         */
        this.playbookModel.addCategoryModel(catModel);

        /**
         * @check category added to playbook
         */
        if(!this.playbookModel.categoryModels.find(m => m.id === id)){
            throw new Error(chalk.red(`💩 I could not find the category model in playbookModel`) + JSON.stringify(this.playbookModel.categoryModels, null, 4));
        }
        // --------------

        /**
         * @step Chosen Category ID
         */
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
        // this.clear();
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
         *
        this.scenes.push({
            id,
            folderName,
            title,
        });
        */

        // -------
        const playbookCategoryModel = this.getChosenCategoryModel();
        if(!playbookCategoryModel){
            console.log(chalk.red(`💩 I'm sorry, I cannot find the category model: `), playbookCategoryModel);
            process.exit();
        }

        /**
         * @step add scene
         * @todo change to a model 
         *
        this.steps.push({
            id,
            folderName,
            title,
            timeline: [],
        });
        */

        /**
         * @step build the relative playbook folder
         */
        const relativePathFromPlaybookFolder = path.join(
            playbookCategoryModel.folderName,
            folderName,
        );

        /**
         * @step add scene model
         */
         const sceneModel = new PlaybookSceneModel(
            title,
            id,
            folderName,
        );
        sceneModel.relativePathFromPlaybookFolder = relativePathFromPlaybookFolder;
        sceneModel.fullPathToFolder = path.resolve(this.cwd, relativePathFromPlaybookFolder);
        sceneModel.categoryId = playbookCategoryModel.id;

        /**
         * @step add step to playbook category model
         */
        playbookCategoryModel.addSceneModel(sceneModel);

        /**
         * @check scene added to category
         */
        if(!playbookCategoryModel.sceneModels.find(s => s.id === id)){
            throw new Error(chalk.red(`💩 I could not find the scene model in category`) + JSON.stringify(playbookCategoryModel.sceneModels, null, 4));
        }
        // -------

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
        // this.clear();
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
            this._exit();
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

        const playbookCategoryModel = this.getChosenCategoryModel();
        if(!playbookCategoryModel){
            console.log(chalk.red(`💩 I'm sorry, I cannot find the category model: `), playbookCategoryModel);
            process.exit();
        }
        const playbookSceneModel = this.getChosenSceneModel();
        if(!playbookSceneModel){
            console.log(chalk.red(`💩 I'm sorry, I cannot find the scene model: `), playbookSceneModel);
            process.exit();
        }

        /**
         * @step add scene
         * @todo change to a model 
         *
        this.steps.push({
            id,
            folderName,
            title,
            timeline: [],
        });
        */

        /**
         * @step build the relative playbook folder
         */
        const relativePathFromPlaybookFolder = path.join(
            playbookCategoryModel.folderName,
            playbookSceneModel.folderName,
            folderName,
        );

        /**
         * @step add scene
         */
         const playbookStepModel = new PlaybookStepModel(
            title,
        );
        playbookStepModel.id = id;
        // @deprecated playbookStepModel.playbookJsRequireId = id && id.split('-').join('_');
        playbookStepModel.folderName = folderName;
        playbookStepModel.relativePathFromPlaybookFolder = relativePathFromPlaybookFolder;
        playbookStepModel.fullPathToFolder = path.resolve(this.cwd, relativePathFromPlaybookFolder);
        playbookStepModel.timeline = [];
        playbookStepModel.categoryId = playbookCategoryModel.id;
        playbookStepModel.sceneId = playbookSceneModel.id;

        /**
         * @step add step to playbook models
         */
        this.playbookModel.addStepModel(playbookStepModel);
        playbookSceneModel.addStepModel(playbookStepModel);

        /**
         * @check step added to category
         */
        if(!this.playbookModel.stepModels.find(s => s.id === id)){
            throw new Error(chalk.red(`💩 I could not find the step model in playbookModels`) + JSON.stringify(this.playbookModel.stepModels, null, 4));
        }
        if(!playbookSceneModel.stepModels.find(s => s.id === id)){
            throw new Error(chalk.red(`💩 I could not find the step model in playbookSceneModel`) + JSON.stringify(this.playbookModel.stepModels, null, 4));
        }

        /**
         * @step Select the step ID
         */
        this.chosenStepId = id;

        /**
         * @step create a step folder 
         */
        const folderModel = this.filesSrv.createFolder(
            this.pathToSceneFolder,
            folderName,
        );
        
        /**
         * @check folder for step model exists 
         */
        if(!fs.existsSync(playbookStepModel.fullPathToFolder)){
            throw new Error(chalk.red(`💩 I could not find the folder for the newly created step model`) + playbookStepModel.fullPathToFolder);
        }

        /**
         * @step build
         */
        this._build();
    }
    async _showStepMenu(){
        // this.clear();
        const stepModel = this.getChosenStepModel();
        if(!stepModel){
            console.log(chalk.red(`💩 I'm sorry, I cannot find the step model for the chosen step:`), this.chosenStepId);
            process.exit();
        }
        const stepMenu = new ShowStepMenuView();
        const option = await stepMenu.show();
        switch(option){
            case stepMenu.BACK:
                await this._chooseStep();
                break;
            case stepMenu.EDIT_TIMELINE:
                await this._showEditTimeline(stepModel);
                break;
            case stepMenu.DELETE_TIMELINE:
                await this._showDeleteTimeline(stepModel);
                break;
            case stepMenu.ADD_DESCRIPTION:
                await this._createDescription(stepModel);
                break;
            case stepMenu.ADD_CODE:
                await this._showCreateCode(stepModel);
                break;
            case stepMenu.ADD_TEST:
                await this._showAddTest(stepModel);
                break;
            case stepMenu.ADD_CLI:
                await this._showAddCli(stepModel);
                break;
            case stepMenu.ADD_AUDIO:
                await this._showAddAudio(stepModel);
                break;
            case stepMenu.EXIT:
                console.log('👋 Goodbye!');
                break;
        }
    }
    /**
     * Filter the code and partial models from the timeline models
     * @param {TimelineModel[]} timelineModels - timeline models
     * @returns { {codeModels: PlaybookTimelineCodeModel[], partialModels: PlaybookTimelineCodePartialModel[]} }
     *      @return codeModels: PlaybookTimelineCodeModel[], 
     *      @return partialModels: PlaybookTimelineCodePartialModel[],
     */
    _filterCodeAndPartialFromTimelineModels(timelineModels){
        const codeModels = timelineModels.filter(timelineModel => {
            return timelineModel instanceof PlaybookTimelineCodeModel && timelineModel.hasOwnProperty('partialModels');
        });
        const partialModels = codeModels.flatMap(codeModel => {
            return codeModel.partialModels && codeModel.partialModels.map(partial => {
                partial.codeModelId = codeModel.id;
                partial.codeModelTitle = codeModel.title;
                return partial;
            });
        });
        return {
            codeModels,
            partialModels,
        }
    }
    /**
     * 
     * @param {StepModel} stepModel - step model
     */
    async _showEditTimeline(stepModel){
        try{
            const timelineModels = stepModel.getAllTimelines();
            const {
                codeModels,
                partialModels,
            } = this._filterCodeAndPartialFromTimelineModels(timelineModels);

            /**
             * @view show edit timeline menu questions
             */
            const view = new EditTimelineView(timelineModels, partialModels);
            let {
                isBack,
                isExit,
                isPartial,
                chosen,
            } = await view.show();

            if(isExit){
                this._exit();
            }
            else if(isBack){
                this._showStepMenu();
            }
            else if(isPartial){
                const partialId = chosen;
                const chosenPartialModel = partialModels.find(partialModel => partialModel.partialId === partialId);
                const chosenCodeModel = codeModels.find(codeModel => codeModel.id === chosenPartialModel.codeModelId || codeModel.title === chosenPartialModel.codeModelTitle);
                console.log(chalk.yellowBright.inverse('chosenCodeModel', chosenCodeModel));
                console.log(chalk.yellowBright.inverse('chosenPartialModel', chosenPartialModel));
                return await this._showEditPartialCode(chosenCodeModel, chosenPartialModel);
            }
            else if(chosen){
                const timelineTitle = chosen;
                const chosenTimelineModel = timelineModels.find(timeline => {
                    return timeline.title === timelineTitle;
                });
                switch(chosenTimelineModel.panel){
                    case 'description':
                        return await this._editDescription(stepModel, chosenTimelineModel);
                    case 'code':
                        return await this._editCode(stepModel, chosenTimelineModel);
                }
            }
            else{
                throw new Error(chalk.red('Edit view unknown option. It should be "back", "exit" or "chosen". '));
            }
        } catch(err){
            throw err;
        }
    }
    /**
     * Delete the selected timeline
     * @param {StepModel} stepModel - step model
     */
    async _showDeleteTimeline(stepModel){
        try{
            const timelineModels = stepModel.getAllTimelines();
            const {
                codeModels,
                partialModels,
            } = this._filterCodeAndPartialFromTimelineModels(timelineModels);
            
            /**
             * @view show edit timeline menu questions
             */
            const view = new EditTimelineView(timelineModels, partialModels);
            const {
                isBack,
                isExit,
                isPartial,
                chosen,
            } = await view.show();

            if(isExit){
                return this._exit();
            }
            else if(isBack){
                return this._chooseStep();
            }
            else if(isPartial){
                const partialId = chosen;
                const chosenPartialModel = partialModels.find(partialModel => partialModel.partialId === partialId);
                const chosenCodeModel = codeModels.find(codeModel => codeModel.id === chosenPartialModel.codeModelId || codeModel.title === chosenPartialModel.codeModelTitle);
                
                /**
                 * @check partial models before delete
                 */
                const numOfPartialsBefore = chosenCodeModel.partialModels.length;
                /**
                 * @step remove the partial
                 */
                chosenCodeModel.deletePartialModel(chosenPartialModel);
                /**
                 * @check partial models after delete
                 */
                const numOfPartialsAfter = chosenCodeModel.partialModels.length;
                if(numOfPartialsAfter !== numOfPartialsBefore-1){
                    throw new Error(chalk.red('⛑ Whoops! No partials have been removed.'));
                }
                if(chosenCodeModel.partialModels.find(p => p.partialId === chosenPartialModel.partialId)){
                    throw new Error(chalk.red('⛑ Whoops! Looks like the partial still exists.\n') + chalk.grey(JSON.stringify, null, 4));
                }

                /** 
                 * @step delete partial file
                 */
                if(!fs.existsSync(chosenPartialModel.fullPathToCodeHbsFile)){
                    throw new Error(
                        chalk.red(
                            `💩 I'm sorry, but I cannot find a file at the location. \n`
                        )+chalk.grey.italic(
                            `Here's the path I was given: \n` +
                            chosenPartialModel.fullPathToCodeHbsFile
                        )
                    );
                }
                else{
                    try{
                        fs.rmSync(chosenPartialModel.fullPathToCodeHbsFile);
                    }
                    catch(err){
                        throw new Error(
                            chalk.red(
                                `💩 I'm sorry, but I failed to delete the file. \n`
                            )+chalk.grey.italic(
                                `Here's the path I was given: \n` +
                                chosenPartialModel.fullPathToCodeHbsFile
                            )
                        );
                    }
                }

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();
            }
            else if(chosen){
                const chosenTimeline = timelineModels.find(timeline => {
                    return timeline.title === chosen;
                });
                
                stepModel.deleteTimelineModel(chosenTimeline);
                
                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();
            }
            else{
                throw new Error(chalk.red('Delete view unknown option. It should be "back", "exit" or "chosenStep". '));
            }

            /**
             * @goto show menu
             */
            return await this._showStepMenu();

        } catch(err){
            throw err;
        }
    }
    /**
     * 
     * @param {StepModel} stepModel - step model
     */
    async _createDescription(stepModel){
        try{
            this._validateStepModel(stepModel);
        }catch(err){
            console.log(err.message);
            throw err;
        }

        // const stepModel = this.getChosenStepModel();

        const defaultDescription = `# ${stepModel ? stepModel.title : this.chosenStepId}`;

        try{
            const createDescView = new CreateTimelineDescriptionView(
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
                title,
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
                 * @step write description file, then read it back for the check
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
                 * @check the chosen step matches the chosenStepId
                 */
                // if(this.chosenStepId !== step.id){

                // }

                /**
                 * @step relative path to the partial from the playbook folder, this is used for the playbook.json
                 */
                const descFilePath = path.join(stepModel.relativePathFromPlaybookFolder, fileName);
                const descModel = new PlaybookTimelineDescriptionModel(
                    start,
                    duration,
                    descFilePath,
                    title,
                );
                stepModel.addDescriptionModel(descModel);

                /**
                 * @debug
                 */
                console.log(
                    chalk.yellowBright.inverse(`TODO: build playbooks.js and step.playbook.js from models tree`),
                    {
                        descModel,
                        title,
                        description,
                        fileDescription,
                        start,
                        duration,
                    }
                );
                
                /**
                 * @step build the playbook.js and playbook.json
                 */
                this._build();
            }
            else{
                console.error(chalk.redBright(`The Description had validation errors`)+`\n\n`+chalk.grey(`Here's are the errors:`), validationErrors);
            }
        }
        catch(err){
            console.error(err);
        }
        /**
         * @back to show step menu again
         */
        this._showStepMenu();
    }
    _validateCategoryModel(catModel){
        /**
         * @validate model
         */
        if(!catModel || !(catModel instanceof PlaybookCategoryModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid category model before I can add code to it.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({catModel}, null, 4)
            );
        }
        
        if(!catModel.id){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the category model must have a "id".\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({catModel}, null, 4)
            );
        }
        if(!catModel.folderName){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the category model must have a "folderName". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({catModel}, null, 4)
            );
        }
    }
    _validateSceneModel(sceneModel){
        /**
         * @validate model
         */
        if(!sceneModel || !(sceneModel instanceof PlaybookSceneModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid scene model before I can add code to it.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({sceneModel}, null, 4)
            );
        }
        
        if(!sceneModel.id){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the scene model must have a "id".\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({sceneModel}, null, 4)
            );
        }
        if(!sceneModel.folderName){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the scene model must have a "folderName". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({sceneModel}, null, 4)
            );
        }
    }
    _validateStepModel(stepModel){
        /**
         * @validate model
         */
        if(!stepModel || !(stepModel instanceof PlaybookStepModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid step model before I can add code to it.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({stepModel}, null, 4)
            );
        }
        if(!stepModel.relativePathFromPlaybookFolder){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the step model must have a "relativePathFromPlaybookFolder". @see PlaybookJsonService.convertToModel \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({stepModel}, null, 4)
            );
        }
        if(!stepModel.fullPathToFolder){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the step model must have a "fullPathToFolder". This is needed for the @step to save code file. @see PlaybookJsonService.convertToModel \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({stepModel}, null, 4)
            );
        }
    }
    _validateDescriptionModel(descriptionModel){
        /**
         * @validate model
         */
        if(!descriptionModel || !(descriptionModel instanceof PlaybookTimelineDescriptionModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid description model.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({descriptionModel}, null, 4)
            );
        }
        
        if(!descriptionModel.filePath){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the description model must have a "filePath". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({descriptionModel}, null, 4)
            );
        }
        if(!descriptionModel.panel){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the description model must have a "panel". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({descriptionModel}, null, 4)
            );
        }
        if(!descriptionModel.start){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the description model must have a "start". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({descriptionModel}, null, 4)
            );
        }
        if(!descriptionModel.duration){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the description model must have a "duration". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({descriptionModel}, null, 4)
            );
        }
    }
    _validateCodeModel(timelineCodeModel){
        /**
         * @validate model
         */
        if(!timelineCodeModel || !(timelineCodeModel instanceof PlaybookTimelineCodeModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid code model.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
        if(!timelineCodeModel.fullPathToCodeHbsFile){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "fullPathToCodeHbsFile". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
        else if(!fs.existsSync(timelineCodeModel.fullPathToCodeHbsFile)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I cannot find a file at the location. \n`
                )+chalk.grey.italic(
                    `Here's the path I was given: \n`
                )+ JSON.stringify(timelineCodeModel.fullPathToCodeHbsFile, null, 4)
            );
        }
        if(!timelineCodeModel.templateFilePath){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "templateFilePath". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
        if(!timelineCodeModel.outputFilePath){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "outputFilePath". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
        if(!timelineCodeModel.start){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "start". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
        if(!timelineCodeModel.duration){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "duration". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({timelineCodeModel}, null, 4)
            );
        }
    }
    _validatePartialModel(partialModel){
        /**
         * @validate model
         */
        if(!partialModel || !(partialModel instanceof PlaybookTimelineCodePartialModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid code model.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({partialModel}, null, 4)
            );
        }
        if(!partialModel.templateFilePath){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "templateFilePath". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({partialModel}, null, 4)
            );
        }
        else if(!fs.existsSync(path.resolve(this.cwd, partialModel.templateFilePath))){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I cannot find a file at the location. \n`
                )+chalk.grey.italic(
                    `Here's the path I was given: \n`
                )+ JSON.stringify(partialModel.templateFilePath, null, 4)
            );
        }
       
        if(!partialModel.partialId){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "partialId". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({partialModel}, null, 4)
            );
        }
        if(!partialModel.start){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "start". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({partialModel}, null, 4)
            );
        }
        if(!partialModel.duration){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but the code model must have a "duration". \n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({partialModel}, null, 4)
            );
        }
    }
    /**
     * 
     * @param {PlaybookTimelineCodeModel} codeModel - code model to add the partial too
     * @param {string} relativePathFromPlaybookFolder - relative path to the partials folder from the playbook root directory
     * @param {string} fullPathToFolder - absolute path to the partials folder
     * @returns 
     */
    async _showShouldIAddAPartialView(codeModel, relativePathFromPlaybookFolder, fullPathToFolder){
        try{
            const view = new ConfirmAddPartialView();
            const shouldIShowAddPartial = await view.show();
            if(shouldIShowAddPartial){
                return this._showCreatePartialCode(codeModel, relativePathFromPlaybookFolder, fullPathToFolder)
            }
            else{
                return this._showStepMenu();
            }
        }
        catch(err){
            throw err;
        }
    }
    async _showCreateCode(stepModel){
        // this.clear();
        try{
            this._validateStepModel(stepModel);
        }
        catch(err){
            throw err;
        }

        /**
         * @view show the questions for the code prompts
         */
        try{
            const codeQuestions = new CreateTimelineCodeView({
                default_startMs: 100, 
                default_durationMs: 2000, 
                default_templateFilePath: 'template.hbs', 
                default_outputFilePath: 'hello/world.js', 
                default_hbsContents: `class HelloWorld{\n\tconstructor(message){\n\t\tthis.message = message;\n\t\t{{partial01}}\n\t}\n}\n`,
                default_template_data: {partial01:'partial01'},
            });
            const {
                isValid, 
                validationErrors,
                template: templateFileName,
                output: outputFilePath,
                hbsContents,
                start,
                duration,
                template_data,
            } = await codeQuestions.show();
            
            /**
             * @step templateFilePath
             */
            const templateFilePath = path.join(stepModel.relativePathFromPlaybookFolder, templateFileName);

            if(isValid){
                try{
                    JSON.parse(template_data);
                }
                catch(err){
                    const jsonErr = new Error(chalk.red('💩 "template_data" is not valid JSON:\n') + JSON.stringify({template_data}, null, 4));
                    throw jsonErr;
                }

                /**
                 * @step add code to step
                 */
                const codeModel = new PlaybookTimelineCodeModel(
                    start,
                    duration,
                    templateFilePath,
                    outputFilePath,
                    JSON.parse(template_data),
                );
                stepModel.addCodeModel(codeModel);

                /**
                 * @step save the code template file
                 * @todo I have IIFE to make this easy to refactor elsewhere
                 */
                (function saveCodeFile({
                    fullPathToFolder,
                    templateFileName,
                    hbsContents,
                }){
                    /**
                     * @check step folder exists
                     */
                    const folderExists = fs.existsSync(fullPathToFolder);
                    if(!folderExists){
                        throw new Error(chalk.red('💩 Attempting to save the code template file, but the Folder does not exist: ')+fullPathToFolder);
                    }

                    const fullPathToCodeHbsFile = path.resolve(fullPathToFolder, templateFileName);

                    /**
                     * @step write hbs template file, then read it back for the check
                     */
                    let fileContents;
                    try{
                        fs.writeFileSync(fullPathToCodeHbsFile, hbsContents, 'utf8');
                        fileContents = fs.readFileSync(fullPathToCodeHbsFile, 'utf8');
                    }catch(err){
                        throw new Error(chalk.red(`Problem writing the code template file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                    }

                    /**
                     * @check description file contents matches contents
                     */
                    if(hbsContents !== fileContents){
                        throw new Error(chalk.red(`Handlebars template file I just wrote does not match\n`), {fileContents, hbsContents});
                    }
                })({
                    fullPathToFolder: stepModel.fullPathToFolder,
                    templateFileName,
                    hbsContents,
                });

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();

                /**
                 * @goto show partials view
                 */
                // await this._showCreatePartialCode(codeModel, stepModel.relativePathFromPlaybookFolder, stepModel.fullPathToFolder);
                return await this._showShouldIAddAPartialView(codeModel, stepModel.relativePathFromPlaybookFolder, stepModel.fullPathToFolder);
            }
            else{
                console.log(chalk.red('💩 The code returned was not valid'), validationErrors);
            }
        }
        catch(err){
            console.log(err);   
        }
        /**
         * @recurse back to the show step menu - error case only
         */
        return await this._showStepMenu();
    }
    /**
     * Edit Description
     * @param {PlaybookStempModel} stepModel - step model (parent)
     * @param {PlaybookTimelineCodeModel} descriptionModel - description model (child) to update
     */
     async _editDescription(stepModel, descriptionModel){
        // this.clear();
        /**
         * @validate step model
         */
        try{
            this._validateStepModel(stepModel);
        }
        catch(err){
            throw err;
        }

        /**
         * @validate description model
         */
        try{
           this._validateDescriptionModel(descriptionModel);
        }
        catch(err){
           throw err;
        }

        /**
         * @view show the questions
         */
        try{
            const questions = new EditTimelineDescriptionView({
                defaultTitle: descriptionModel.title, 
                defaultFilePath: descriptionModel.filePath, 
                defaultDescription: descriptionModel.contents(this.cwd), 
                defaultStartMs: descriptionModel.start, 
                defaultDurationMs: descriptionModel.duration,
            });
            const {
                isValid, 
                validationErrors,
                filePath,
                description,
                title,
                start,
                duration,
            } = await questions.show();
            
            /**
             * @step templateFilePath
             */
            // const templateFilePath = path.join(stepModel.relativePathFromPlaybookFolder, templateFileName);

            if(isValid){
                /**
                 * @step update code model to step
                 */
                descriptionModel.start = start;
                descriptionModel.duration = duration;
                descriptionModel.filePath = filePath;
                descriptionModel.description = description;
                descriptionModel.title = title;

                /**
                 * @step save the code template file
                 * @todo I have IIFE to make this easy to refactor elsewhere
                 * 
                 * @param {string} fullPathToFile - path to the full path to the description
                 * @param {string} hbsContents - the file contents
                 */
                (function saveDescFile({
                    fullPathToFile,
                    contents,
                }){
                    /**
                     * @step find the full path to the folder
                     */
                    let fullPathToFolder = fullPathToFile.split('/');
                    fullPathToFolder.pop();
                    fullPathToFolder = fullPathToFolder.join('/');

                    /**
                     * @check step folder exists
                     */
                    const folderExists = fs.existsSync(fullPathToFolder);
                    if(!folderExists){
                        throw new Error(chalk.red('💩 Attempting to save the code template file, but the Folder does not exist: ')+fullPathToFolder);
                    }

                    /**
                     * @step write hbs template file, then read it back for the check
                     */
                    let fileContents;
                    try{
                        fs.writeFileSync(fullPathToFile, contents, 'utf8');
                        fileContents = fs.readFileSync(fullPathToFile, 'utf8');
                    }catch(err){
                        throw new Error(chalk.red(`💩 Sorry but I had a problem writing the code template file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                    }

                    /**
                     * @check file contents matches contents
                     */
                    if(contents !== fileContents){
                        throw new Error(chalk.red(`💩 Handlebars template file I just wrote does not match\n`), {fileContents, hbsContents: contents});
                    }
                })({
                    fullPathToFile: path.resolve(this.cwd, filePath),
                    contents: description,
                });

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();

                /**
                 * @goto show edit timeline menu
                 */
                return await this._showEditTimeline(stepModel);
            }
            else{
                console.log(chalk.red('💩 The code returned was not valid'), validationErrors);
            }
        }
        catch(err){
            console.log(err);   
        }
        /**
         * @recurse back to the show step menu
         */
        await this._showStepMenu();
    }
    /**
     * Edit Code
     * @param {PlaybookStempModel} stepModel - step model (parent)
     * @param {PlaybookTimelineCodeModel} timelineCodeModel - code model (child) to update
     */
    async _editCode(stepModel, timelineCodeModel){
        // this.clear();
        /**
         * @validate step model
         */
        try{
            this._validateStepModel(stepModel);
        }
        catch(err){
            throw err;
        }

        /**
         * @validate code model
         */
        try{
           this._validateCodeModel(timelineCodeModel);
        }
        catch(err){
           throw err;
        }

        /**
         * @view show the questions for the code prompts
         */
        try{
            const codeQuestions = new CreateTimelineCodeView({
                default_startMs: timelineCodeModel.start, 
                default_durationMs: timelineCodeModel.duration, 
                default_templateFilePath: timelineCodeModel.templateFilePath, 
                default_outputFilePath: timelineCodeModel.outputFilePath, 
                default_hbsContents: timelineCodeModel.hbsContents(),
                default_template_data: timelineCodeModel.template_data,
            });
            const {
                isValid, 
                validationErrors,
                template: templateFilePath,
                output: outputFilePath,
                hbsContents,
                start,
                duration,
                template_data,
            } = await codeQuestions.show();
            
            /**
             * @step templateFilePath
             */
            // const templateFilePath = path.join(stepModel.relativePathFromPlaybookFolder, templateFileName);

            if(isValid){
                try{
                    JSON.parse(template_data);
                }
                catch(err){
                    const jsonErr = new Error(chalk.red('💩 "template_data" is not valid JSON') + JSON.stringify({template_data}, null, 4));
                    throw jsonErr;
                }

                /**
                 * @step update code model to step
                 */
                timelineCodeModel.start = start;
                timelineCodeModel.duration = duration;
                timelineCodeModel.templateFilePath = templateFilePath;
                timelineCodeModel.outputFilePath = outputFilePath;
                timelineCodeModel.template_data = JSON.parse(template_data);

                /**
                 * @step save the code template file
                 * @todo I have IIFE to make this easy to refactor elsewhere
                 * 
                 * @param {string} fullPathToCodeHbsFile - path to the full path to the code handlebars file
                 * @param {string} hbsContents - the file contents
                 */
                (function saveCodeFile({
                    fullPathToCodeHbsFile,
                    hbsContents,
                }){
                    /**
                     * @step find the full path to the folder
                     */
                    let fullPathToFolder = fullPathToCodeHbsFile.split('/');
                    fullPathToFolder.pop();
                    fullPathToFolder = fullPathToFolder.join('/');

                    /**
                     * @check step folder exists
                     */
                    const folderExists = fs.existsSync(fullPathToFolder);
                    if(!folderExists){
                        throw new Error(chalk.red('💩 Attempting to save the code template file, but the Folder does not exist: ')+fullPathToFolder);
                    }

                    /**
                     * @step write hbs template file, then read it back for the check
                     */
                    let fileContents;
                    try{
                        fs.writeFileSync(fullPathToCodeHbsFile, hbsContents, 'utf8');
                        fileContents = fs.readFileSync(fullPathToCodeHbsFile, 'utf8');
                    }catch(err){
                        throw new Error(chalk.red(`💩 Sorry but I had a problem writing the code template file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                    }

                    /**
                     * @check hbsContents file contents matches contents
                     */
                    if(hbsContents !== fileContents){
                        throw new Error(chalk.red(`💩 Handlebars template file I just wrote does not match\n`), {fileContents, hbsContents});
                    }
                })({
                    fullPathToCodeHbsFile: timelineCodeModel.fullPathToCodeHbsFile,
                    hbsContents,
                });

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();

                /**
                 * @goto show partials view
                 */
                // TODO --> await this._showEditPartialCode(timelineCodeModel, stepModel.relativePathFromPlaybookFolder, stepModel.fullPathToFolder);
                return await this._choosePartialsView(timelineCodeModel);
            }
            else{
                console.log(chalk.red('💩 The code returned was not valid'), validationErrors);
            }
        }
        catch(err){
            console.log(err);   
        }
        /**
         * @recurse back to the show step menu
         */
        await this._showStepMenu();
    }
    async _showCreatePartialCode(codeModel, relativePathFromPlaybookFolder, fullPathToFolder){
        /**
         * @validate model
         */
        if(!codeModel || !(codeModel instanceof PlaybookTimelineCodeModel)){
            throw new Error(
                chalk.red(
                    `💩 I'm sorry, but I need a valid code model before I can add a partial to it.\n`
                )+chalk.grey.italic(
                    `Here's what I received: \n`
                )+ JSON.stringify({codeModel}, null, 4)
            );
        }
        
        /**
         * @view show the questions for the code prompts
         */
        try{
            const partialQuestions = new CreateTimelineCodePartialView({
                default_startMs: 100, 
                default_durationMs: 2000, 
                default_templateFilePath: 'partial01.hbs', 
                default_partialId: 'partial01', 
                default_hbsContents: `const hello = 'world';`,
                default_template_data: {},
            });
            const {
                isValid, 
                validationErrors,
                template: partialFileName,
                partialId,
                hbsContents,
                start,
                duration,
                template_data: partial_data,
            } = await partialQuestions.show();
            
            /**
             * @step relative path to the partial from the playbook folder, this is used for the playbook.json
             */
            const partialFilePath = path.join(relativePathFromPlaybookFolder, 'partials', partialFileName);

            if(isValid){
                try{
                    JSON.parse(partial_data);
                }
                catch(err){
                    const jsonErr = new Error(chalk.red('💩 "partial_data" is not valid JSON') + JSON.stringify({partial_data}, null, 4));
                    throw jsonErr;
                }

                /**
                 * @constant fullPathToCodeHbsFile - full path to the partial hbs file
                 */
                const fullPathToCodeHbsFile = path.resolve(this.cwd, partialFilePath);

                /**
                 * @step add code to step
                 */
                const partialModel = new PlaybookTimelineCodePartialModel(
                    start,
                    duration,
                    partialId,
                    partialFilePath,
                    partial_data ? JSON.parse(partial_data): {},
                    fullPathToCodeHbsFile,
                );
                codeModel.addPartialModel(partialModel);

                /**
                 * @step save the code template file
                 * @todo I have IIFE to make this easy to refactor elsewhere
                 */
                (function savePartialFile({
                    fullPathToFolder,
                    templateFileName,
                    hbsContents,
                }){
                    /**
                     * @check step folder exists
                     */
                    const folderExists = fs.existsSync(fullPathToFolder);
                    if(!folderExists){
                        throw new Error(chalk.red('💩 Attempting to save the partials folder, but the step folder does not exist: ')+fullPathToFolder);
                    }

                    /**
                     * @step create a partials folder if one doesn't already exist
                     */
                    const fullPathToPartialsFolder = path.join(fullPathToFolder, 'partials');
                    if(!fs.existsSync(fullPathToPartialsFolder)){
                        fs.mkdirSync(fullPathToPartialsFolder);
                    }
                    const partialsFolderExists = fs.existsSync(fullPathToPartialsFolder);
                    if(!partialsFolderExists){
                        throw new Error(chalk.red('💩 Attempting to save the partials file, but the partials folder does not exist: ')+fullPathToPartialsFolder);
                    }


                    const pathToPartialHbsFile = path.resolve(fullPathToPartialsFolder, templateFileName);

                    /**
                     * @step write hbs template file, then read it back for the check
                     */
                    let fileContents;
                    try{
                        fs.writeFileSync(pathToPartialHbsFile, hbsContents, 'utf8');
                        fileContents = fs.readFileSync(pathToPartialHbsFile, 'utf8');
                    }catch(err){
                        throw new Error(chalk.red(`Problem writing the partial file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                    }

                    /**
                     * @check description file contents matches contents
                     */
                    if(hbsContents !== fileContents){
                        throw new Error(chalk.red(`Handlebars template file I just wrote does not match\n`), {hbsContents, fileContents});
                    }
                })({
                    fullPathToFolder,
                    templateFileName: partialFileName,
                    hbsContents,
                });

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();
            }
            else{
                console.log(chalk.red('💩 The partial data from the questions was not valid'), validationErrors);
            }
        }
        catch(err){
            console.log(err);   
        }
        /**
         * @recurse back to the should I add a partial view
         */
        return await this._showShouldIAddAPartialView(codeModel, relativePathFromPlaybookFolder, fullPathToFolder);
    }
    async _showEditPartialCode(codeModel, partialModel){
        /**
         * @validate model
         */
        this._validateCodeModel(codeModel);
        this._validatePartialModel(partialModel);
        /**
         * @view show the questions for the code prompts
         */
        try{
            const partialQuestions = new CreateTimelineCodePartialView({
                default_startMs: partialModel.start, 
                default_durationMs: partialModel.duration, 
                default_templateFilePath: partialModel.templateFilePath, 
                default_partialId: partialModel.partialId, 
                default_hbsContents: partialModel.hbsContents(),
                default_template_data: partialModel.template_data || {},
            });
            const {
                isValid, 
                validationErrors,
                template: partialFilePath,
                partialId,
                hbsContents,
                start,
                duration,
                template_data: partial_data,
            } = await partialQuestions.show();
         
            if(isValid){
                try{
                    JSON.parse(partial_data);
                }
                catch(err){
                    const jsonErr = new Error(chalk.red('💩 "partial_data" is not valid JSON') + JSON.stringify({partial_data}, null, 4));
                    throw jsonErr;
                }

                /**
                 * @constant fullPathToCodeHbsFile - full path to the partial hbs file
                 */
                // --> const fullPathToCodeHbsFile = path.resolve(this.cwd, partialFilePath);

                /**
                 * @step add code to step
                 */
                partialModel.start = start;
                partialModel.duration = duration;
                partialModel.partialId = partialId;
                partialModel.partialFilePath = partialFilePath,
                partialModel.partial_data = JSON.parse(partial_data) || {};
                                
                /**
                 * @step save the code template file
                 * @todo I have IIFE to make this easy to refactor elsewhere
                 */
                (function savePartialFile({
                    fullPathToCodeHbsFile,
                    hbsContents,
                }){

                    /**
                     * @step write hbs template file, then read it back for the check
                     */
                    let fileContents;
                    try{
                        fs.writeFileSync(fullPathToCodeHbsFile, hbsContents, 'utf8');
                        fileContents = fs.readFileSync(fullPathToCodeHbsFile, 'utf8');
                    }catch(err){
                        throw new Error(chalk.red(`Problem writing the partial file\n`)+ chalk.grey(`Here's what I received:\n`), err.message);
                    }
console.log(chalk.yellowBright.inverse('fileContents'), {fileContents});

                    /**
                     * @check description file contents matches contents
                     */
                    if(hbsContents !== fileContents){
                        throw new Error(chalk.red(`Handlebars template file I just wrote does not match\n`), {fileContents, hbsContents});
                    }
                })({
                    fullPathToCodeHbsFile: partialModel.fullPathToCodeHbsFile,
                    hbsContents,
                });

                /**
                 * @step rebuild the playbook.js and playbook.json
                 */
                this._build();
            }
            else{
                throw new Error(chalk.red('💩 The partial data from the questions was not valid.\n') + chalk.grey.italic(`Here are the validation errors:\n` + JSON.stringify(validationErrors, null, 4)));
            }
        }
        catch(err){
            throw (err);   
        }
        /**
         * @recurse back to the show step menu
         */
        return await this._showEditTimeline();
    }
    /**
     * 
     * @param {PlaybookTimelineCodeModel} codeModel - code model
     */
    async _choosePartialsView(codeModel){
        try{
            const partialView = new ChoosePartialView(codeModel.partialModels);
            const {
                isBack,
                isExit,
                chosenStep,
            } = await partialView.show();
            if(isExit){
                this.exit();
            }
            else if(isBack){
                await this._showEditTimeline();
            }
            else if(chosenStep){
                const partialModel = codeModel.partialModels.find(partialModel => {
                    return partialModel.partialId === chosenStep;
                });
                if(!partialModel){
                    throw new Error(chalk.red(`💩 Sorry, but I couldn't find the partial ID you were looking for.\n`)+chalk.grey(`Here is what I received: `)+JSON.stringify({partialModel, chosenStep}, null, 4));
                }
                return this._showEditPartialCode(codeModel, partialModel);
            }
        } catch(err){
            throw err;
        }
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

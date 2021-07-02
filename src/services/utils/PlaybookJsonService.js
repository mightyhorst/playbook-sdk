/**
 * @requires lodash
 */
const lodash = require('lodash');

/**
 * @requires chalk
 */
const chalk = require('chalk');

/**
 * @requires fs
 */
const path = require('path');
const fs = require('fs');

/**
 * @requires Services
 */
const filesSrv = require('./FilesService');
const {removeAllSpecialChars} = require('./replaceAll');

/**
 * @requires Models
 */
const PlaybookModel = require('../../models/playbook/PlaybookModel');
const PlaybookCategoryModel = require('../../models/playbook/PlaybookCategoryModel');
const PlaybookSceneModel = require('../../models/playbook/PlaybookSceneModel');
const PlaybookStepModel = require('../../models/playbook/PlaybookStepModel');
const {
    PlaybookWindowSettingsModel,
    PlaybookTimelineModel,
    PlaybookTimelineTransitionModel,
    PlaybookTimelineDescriptionModel,
    PlaybookTimelineCodeModel,
    PlaybookTimelineCodePartialModel,
    PlaybookTimelineTerminalModel,
    PlaybookTimelineTerminalCommandModel,
} = require('../../models/playbook/PlaybookTimelineModel');

/**
 * @requires Config
 */
const {
    PLAYBOOK,
} = require('../../constants');

class PlaybookJsonService{
    constructor(playbookFolder, optPlaybookJsonFileName){
        this.setPlaybookJson(playbookFolder, optPlaybookJsonFileName);

        this.playbookCategoryModels = [];
        this.playbookSceneModels = [];
        this.playbookStepModels = [];
    }
    setPlaybookJson(playbookFolder, optPlaybookJsonFileName){
        this.playbookFolder = playbookFolder;
        this.playbookJsonFileName = optPlaybookJsonFileName || 'playbook.json'
        this.pathToPlaybookJson = path.resolve(playbookFolder, this.playbookJsonFileName);

        return this.validate();
    }
    /**
     * @description validate the folder and playbook exists
     * @returns {boolean} isValid
     */
    validate(){
        let isValid = false;

        /**
         * @check folder exists
         */
        const doesFolderExist = fs.existsSync(this.playbookFolder);
        if(!doesFolderExist){
            throw new Error(chalk.red('Folder does not exist'));
        }

        /**
         * @check playbook.json exists
         */
        const doesPlaybookJsonExist = fs.existsSync(this.pathToPlaybookJson);
        if(!doesPlaybookJsonExist){
            throw new Error(chalk.red('Path to playbook.json does not exist'));
        }

        /**
         * @check playbook.json is valid
         */
        const {isValid: playbookIsValid} = this.readPlaybookJson();

        isValid = doesFolderExist && doesPlaybookJsonExist && playbookIsValid;
        return isValid;
    }
    readPlaybookJson(){
        let isValid = false;
        try{
            this.playbookJsonFileContents = fs.readFileSync(this.pathToPlaybookJson, 'utf8');
        }
        catch(err){
            throw new Error(chalk.red('Error reading the playbook.json\n')+chalk.grey(`Here's the Error I received:\n`), err.message);
        }

        try{
            this.playbookJson = JSON.parse(this.playbookJsonFileContents);
            this.playbookName = this.playbookJson.name;
        }
        catch(err){
            throw new Error(chalk.red('Error parsing the playbook.json\n')+chalk.grey(`Here's the Error I received:\n`), err.message);
        }

        /**
         * @check categories
         */
        const hasCategories = this.playbookJson.hasOwnProperty('categories');
        const areCatsValid = Array.isArray(this.playbookJson.categories);
        isValid = hasCategories && areCatsValid;

        return {
            isValid,
            playbookJson: this.playbookJson
        };
    }
    /**
     * 
     * @param {'cat'|'scene'|'step'} type - cat, scene or step
     * @param {string} title - title of the cat, scene or step
     * @param {number} index - index of the cat, scene or step
     * @returns {string} transformedId - e.g. 'cat01-hello-world'
     */
    _transformTitleToFolderId(type, title, index){
        const num = (index < 10 ? `0${index}` : index);
        const transformedIndex = `${type}${num}`;
        const transformedTitle = title.toLowerCase().split(' ').join('-');
        const transformedId = removeAllSpecialChars(`${transformedIndex}-${transformedTitle}`);
        return transformedId;
    }
    /**
     * Get categories from playbook.json
     * @returns {Categories[]} categories
     */
    getCategories(){
        if(!this.playbookJson.hasOwnProperty('categories')){
            throw new Error(chalk.red('playbookJson is missing categories \n')+chalk.grey(`Here's what I have for the playbook.json:\n`)+JSON.stringify(Object.keys(this.playbookJson), null, 4));
        }

        /**
         * @step find next ID from folders
         */
        let {
            nextCatId,
            categories: categoriesFromFolders,
        } = filesSrv.findCategories(this.playbookFolder);

        /**
         * @deprecated we use this to look into the playbook folder, find the cats and find the next id based on the number e.g. "cat02-intro" then the next id will be "03"
         * @bug this created bugs where we kept adding folders for the same cat. e.g. "cat00-intro" "cat01-intro" ect, everytime it was run
         */
        nextCatId = nextCatId || 0;
        

        const categories = this.playbookJson.categories.map((category, index) => {
            if(!category.title){
                throw new Error(chalk.red('category is missing title \n')+chalk.grey(`Here's what I have for the category:\n`)+JSON.stringify(Object.keys(category), null, 4));
            }
            if(!category.name){
                category.name = category.title;
            }
            if(!category.folderName){
                /**
                 * @see nextCatId was added to index here, but it was removed
                 */
                const id = this._transformTitleToFolderId('cat', category.title, index);
                category.id = id;
                category.folderName = id;
                category.isFolderAndIdGenerated = true;
            }
            /**
             * @step add full path to category
             */
             category.relativePathFromPlaybookFolder = path.join(
                category.folderName,
            );
            // category.fullPathToFolder = path.resolve(this.playbookFolder, category.folderName);
            category.fullPathToFolder = path.resolve(this.playbookFolder, category.relativePathFromPlaybookFolder);

            /**
             * @returns {Category} category
             */
            return category;
        });
        return categories;
    } 
        findCategoryBy(key, val){
            const categories = this.getCategories();
            const category = categories.find(cat => {
                return cat[key] === val;
            });
            if(category){
                return category;
            }
            else {
                throw new Error(chalk.red(`The category "${val}" is missing from the playbook.json`));
            }
        }
        findCategoryById(id){
            return this.findCategoryBy('id', id);
        }
        findCategoryByFolderName(folderName){
            const cat = this.findCategoryBy('folderName', folderName);
            return cat;
        }
    getScenes(){
        const categories = this.getCategories();
        let scenes = [];

        /**
         * @step flatten steps
         */
        categories.forEach(category => {

            let catMetaData = {...category};

            /**
             * @deprecated we use this to look into the cat folder, find the scenes and find the next id based on the number e.g. "scene02-intro" then the next id will be "03"
             * @bug this created bugs where we kept adding folders for the same scene. e.g. "scene00-intro" "scene01-intro" ect, everytime it was run
             */
            let nextSceneIdForCat = 0;

            /**
             * @step find the next scene ID from the folders in this category
             */
            if(category.folderName){
                const fullCategoryPath = path.resolve(this.playbookFolder, category.folderName);
                if(fs.existsSync(fullCategoryPath)){
                    const {nextSceneId} = filesSrv.findScenes(fullCategoryPath);
                    if(!isNaN(nextSceneId)){
                        nextSceneIdForCat = nextSceneId;
                    }
                }
            }
            
            if(category.scenes){
                delete catMetaData.scenes;
                const catScenes = category.scenes.map((scene, index) => {
                    /**
                     * @transform add category metadata 
                     */
                    scene.category = catMetaData;

                    /**
                     * @transform scenes to include folderName
                     */
                    if(scene.name && !scene.title){
                        scene.title = scene.name;
                    }
                    if(!scene.title){
                        throw new Error(chalk.red.italic('scene is missing title \n')+chalk.grey(`Here's what I have for the scene:\n`)+JSON.stringify(Object.keys(scene), null, 4));
                    }
                    if(!scene.name){
                        category.name = category.title;
                    }
                    if(!scene.folderName){
                        /**
                         * @see nextCatId was added to index here, but it was removed
                         */
                        const id = this._transformTitleToFolderId('scene', scene.title, index);
                        scene.id = id;
                        scene.folderName = id;
                        scene.isFolderAndIdGenerated = true;
                    }

                    /**
                     * @step add full path to category
                     */
                    scene.relativePathFromPlaybookFolder = path.join(
                        scene.category.folderName, 
                        scene.folderName,
                    );
                    // scene.fullPathToFolder = path.resolve(this.playbookFolder, scene.category.folderName, scene.folderName);
                    scene.fullPathToFolder = path.resolve(this.playbookFolder, scene.relativePathFromPlaybookFolder);

                    /**
                     * @returns {Scene} scene
                     */
                    return scene;
                });

                /**
                 * @save add catScenes to scenes
                 */
                scenes = [
                    ...scenes,
                    ...catScenes,
                ];
            }
        });

        /**
         * @returns scenes
         */
        return scenes;
    }
        findSceneBy(key, val){
            const scenes = this.getScenes();
            const scene = scenes.find(scene => {
                return scene[key] === val;
            });
            if(scene){
                return scene;
            }
            else {
                throw new Error(chalk.red(`The scene "${val}" is missing from the playbook.json`));
            }
        }
        findSceneById(id){
            return this.findSceneBy('id', id);
        }
        findSceneByFolderName(folderName){
            const cat = this.findSceneBy('folderName', folderName);
            return cat;
        }
    getSteps(){
        const scenes = this.getScenes();
        let steps = [];

        const sceneSteps = scenes.map(scene => {

            const sceneMetaData = {...scene};
            const catMetaData = sceneMetaData.category;

            /**
             * @deprecated we use this to look into the scene folder, find the steps and find the next id based on the number e.g. "step02-intro" then the next id will be "03"
             * @bug this created bugs where we kept adding folders for the same step. e.g. "step00-intro" "step01-intro" ect, everytime it was run
             */
            let nextStepIdForScene = 0;

            /**
             * @step find the next step ID from the folders in this category
             */
            if(scene.folderName){
                const fullScenePath = path.resolve(this.playbookFolder, scene.category.folderName, scene.folderName);
                if(fs.existsSync(fullScenePath)){
                    const {nextStepId} = filesSrv.findSteps(fullScenePath);
                    if(!isNaN(nextStepId)){
                        nextStepIdForScene = nextStepId;
                    }
                }
            }
           
            if(scene.steps){              
                delete sceneMetaData.steps;
                delete sceneMetaData.category;
                const stepsFromScene = scene.steps.map((step, stepIndex)=>{
                    /**
                     * @transform add cat + scene metadata 
                     */
                    step.category = catMetaData;
                    step.scene = sceneMetaData;

                    /**
                     * @transform steps to include folderName
                     */
                     if(!step.title){
                        throw new Error(chalk.red.italic('step is missing title \n')+chalk.grey(`Here's what I have for the step:\n`)+JSON.stringify(Object.keys(step), null, 4));
                    }
                    if(!step.name){
                        step.name = step.title;
                    }
                    if(!step.folderName){
                        /**
                         * @see nextCatId was added to index here, but it was removed
                         */
                        const id = this._transformTitleToFolderId('step', step.title, stepIndex);
                        step.id = id;
                        step.folderName = id;
                        step.isFolderAndIdGenerated = true;
                    }

                    /**
                     * @step add relative and full path to category
                     */
                    step.relativePathFromPlaybookFolder = path.join(
                        step.category.folderName,
                        step.scene.folderName,
                        step.folderName,
                    );
                    // step.fullPathToFolder = path.resolve(this.playbookFolder, step.category.folderName, step.scene.folderName, step.folderName);
                    step.fullPathToFolder = path.resolve(this.playbookFolder, step.relativePathFromPlaybookFolder);

                    /**
                     * @returns {Step} step
                     */                    
                    return step;
                });

                /**
                 * @data add the steps from this scene to the steps
                 */
                steps = [
                    ...steps,
                    ...stepsFromScene,
                ];
            }        
        });

        /**
         * @returns flattened steps
         */
        return steps;
    }
        findStepBy(key, val){
            const steps = this.getSteps();
            const step = steps.find(step => {
                return step[key] === val;
            });
            if(step){
                return step;
            }
            else {
                throw new Error(chalk.red(`The step ${key} "${val}" is missing from the playbook.json`));
            }
        }
        findStepById(id){
            return this.findStepBy('id', id);
        }
        findStepByFolderName(folderName){
            try{
                const step = this.findStepBy('folderName', folderName);
                return step;
            } catch(err){
                return false;
            }
        }
    getUpdatedCategoriesAsTree(){
        let cats = this.getCategories();
        let scenes = this.getScenes();
        let steps = this.getSteps();

        return cats.map(cat => {

            cat.scenes = cat.scenes.map(scene => {
                let updatedScene = scenes.find(s => s.id === scene.id);
                updatedScene = {
                    ...scene,
                    ...updatedScene,
                }

                updatedScene.steps = updatedScene.steps.map(step => {
                    let updatedStep = steps.find(s => s.id === step.id);
                    updatedStep = {
                        ...step,
                        ...updatedStep,
                    };

                    return updatedStep;
                });
                return updatedScene;
            });

            return cat;
        });
    }
    /**
     * audit the playbook.json
     *   • missing ids
     *   • missing folderNames
     *   • missing folders
     */
    audit(){
        console.log(chalk.bold('\n🔎 Audit Categories:'));
        console.log(chalk.dim('--------------------'));
        const isCatValid = this.auditCategories();

        /** 
         * @todo - turn back on
         */
        console.log(chalk.bold('\n🔎 Audit Scenes:'));
        console.log(chalk.dim('----------------'));
        const isSceneValid = this.auditScenes();

        /** 
         * @todo - turn back on
         */
        console.log(chalk.bold('\n🔎 Audit Steps:'));
        console.log(chalk.dim('---------------'));
        const isStepValid = this.auditSteps();

        console.log('\n');
        return isCatValid && isSceneValid && isStepValid;
    }
        auditCategories(){
            const categories = this.getCategories();
            const metaData           = this.auditCategoriesMetaData(categories, true);
            const catsWithoutFolders = this.auditCategoriesWithoutFolders(categories, true);
            const foldersWithoutCats = this.auditFoldersWithoutCategories(categories, true);

            return metaData.isValid && 
                catsWithoutFolders.isValid && 
                foldersWithoutCats.isValid;
        }
            /**
             * Check the categories in the playbook.json (or .getCategories) to check they have all the required meta data
             * 
             * @param {Category[]} categories - categories from playbook.json or from @see this.getCategories
             * @param {boolean} printLogs - pretty print to the console logs
             * @returns 
             */
            auditCategoriesMetaData(categories, printLogs){
                let isValid = false;
                const categoriesMissingMeta = categories
                    .filter((cat)=>{
                        /**
                         * @step if the folder is autogenerated we've missed meta data
                         */
                        if(cat.isFolderAndIdGenerated){
                            return cat.isFolderAndIdGenerated;
                        }
                        else{
                            const hasId = cat.hasOwnProperty('id');
                            const hasTitle = cat.hasOwnProperty('title');
                            const hasFolderName = cat.hasOwnProperty('folderName');
                            const isValid = hasId && hasTitle && hasFolderName;
                            const isMissing = !isValid;
                            return isMissing;
                        }
                    })
                    .map(cat => {
                        return {
                            id: cat.id,
                            title: cat.title,
                            folderName: cat.folderName,
                            fullPathToFolder: cat.fullPathToFolder,
                        }
                    })
                    .map(cat => {

                        let checks = [];

                        /**
                         * @check ID
                         */
                        let checkId = `✅`;
                        if(typeof(cat.id)==='number' || !isNaN(parseInt(cat.id))){
                            checkId = `🙀 Our API has changed. ID needs to be a string that matches the folder`;
                        }
                        checks.push({key: 'id', check: checkId});

                        /**
                         * @check folderName
                         */
                        let checkFolderName = `✅`;
                        if(!cat.folderName){
                            checkFolderName = `❌ Folder name has not been provided`;
                        }
                        checks.push({key: 'folderName', check: checkFolderName});

                        /**
                         * @check fullPathToFolder
                         */
                        if(checkFolderName === `✅`){
                            let checkFullPathToFolder = `✅`;
                            if(!fs.existsSync(cat.fullPathToFolder)){
                                checkFullPathToFolder = `❌ folder does not exist`;
                            }
                            checks.push({key:'fullPathToFolder', check:checkFullPathToFolder});
                        }

                        return {
                            ...cat,
                            checks,
                        }
                    });
                
                /**
                 * @step is valid
                 */
                isValid = !(categoriesMissingMeta.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('👉 Checking categories for meta data:'));
                    if(!isValid){
                        let toPrint = categoriesMissingMeta
                            .map(cat=>chalk.blue(` ${cat.title}:\n`)+cat.checks.map(c=>`   • ${c.key}: ${c.check}`).join('\n')).join('\n');
                        console.log(chalk.red.italic(`⛑ I have checked the playbook.json, and these categories metadata:`))
                        console.log(toPrint);
                    }
                    else{
                        console.log(chalk.green(`\t✅ All the categories have the metadata`));
                    }
                }
                return {
                    isValid,
                    categoriesMissingMeta,
                };
            }

            /**
             * Check the categories have corresponding folders 
             * 
             * @param {Category[]} categories - categories from playbook.json
             * @param {boolean} printLogs - optional - print the logs (prints by default)
             * @returns 
             */
            auditCategoriesWithoutFolders(categories, printLogs){
                let isValid = false;
                const categoriesMissingFolders = categories
                    .filter((cat)=>{
                        const doesCatFolderExist = fs.existsSync(cat.fullPathToFolder);
                        const isMissing = !doesCatFolderExist;
                        return isMissing;
                    })
                    .map(cat => {
                        return {
                            id: cat.id,
                            title: cat.title,
                            folderName: cat.folderName,
                            fullPathToFolder: cat.fullPathToFolder,
                        }
                    });

                /**
                 * @step is valid
                 */
                isValid = !(categoriesMissingFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking for categories without folders:'));
                    if(!isValid){
                    // if(categoriesMissingFolders.length > 0){
                        console.log(chalk.red.italic(`⛑ I have checked the playbook folder, and these categories are missing folders:`));
                        console.log(categoriesMissingFolders.map(cat=>chalk.bold('• 🦄 '+cat.title)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`\t✅ All the categories have the folders`));
                    }
                }

                /**
                 * @returns {Category[]} categories with no folders
                 */
                return {
                    isValid,
                    categoriesMissingFolders,
                };
            }

            /**
             * Audit - find folders with no matching category in playbook.json
             * This looks for all folders starting with "cat" in the playbook folder 
             * 
             * @param {Category[]} categories - categories from this.getCategories or playbook.json
             * @param {boolean} printLogs - optional - pretty print to console
             * @returns 
             */
            auditFoldersWithoutCategories(categories, printLogs){
                let isValid = false;
                const {
                    nextCatId,
                    categories: folders,
                } = filesSrv.findCategories(this.playbookFolder);

                const orphandedFolders = [];
                const foldersFromPlaybook = categories.map(cat => cat.folderName);

                folders.forEach(folder => {
                    const folderExistsInPlaybook = foldersFromPlaybook.includes(folder);
                    if(!folderExistsInPlaybook){
                        orphandedFolders.push(folder);
                    }
                });

                /**
                 * @step is valid
                 */
                isValid = !(orphandedFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                 if(printLogs){
                     console.log(chalk.italic('\n👉 Checking for folders without categories:'));
                    if(!isValid){
                        console.log(chalk.italic.red(`⛑ I have checked the playbook folder, and these folders don't match any categories in the playbook.json:`))
                        console.log(chalk.bold(`🗂 ${this.playbookFolder}`));
                        console.log(orphandedFolders.map(folder=>chalk.bold(`• 🗂 /${folder}`)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`\t✅ All the folders match categories in the playbook.json`));
                    }
                }

                return {
                    isValid,
                    orphandedFolders,
                };
            }
        auditScenes(){
            /**
             * @todo turn back on
             */
            console.log(chalk.yellowBright('@todo - turn on audit scenes'));
            return true;

            const scenes = this.getScenes();   
            const metaData              = this.auditScenesMetaData(scenes, true);
            const scenesWithoutFolders  = this.auditScenesWithoutFolders(scenes, true);
            const foldersWithoutScenes  = this.auditFoldersWithoutScenes(scenes, true);
            return metaData.isValid && 
                scenesWithoutFolders.isValid && 
                foldersWithoutScenes.isValid;
        }
            auditScenesMetaData(scenes, printLogs){
                let isValid = false;
                const scenesMissingMeta = scenes
                    .filter((scene)=>{
                        /**
                         * @step if the folder is autogenerated we've missed meta data
                         */
                        if(scene.isFolderAndIdGenerated){
                            return scene.isFolderAndIdGenerated;
                        }
                        else{
                            const hasId = scene.hasOwnProperty('id');
                            const hasTitle = scene.hasOwnProperty('title');
                            const hasFolderName = scene.hasOwnProperty('folderName');
                            const isValid = hasId && hasTitle && hasFolderName;
                            const isMissing = !isValid;
                            return isMissing;
                        }
                    })
                    .map(scene => {
                        return {
                            id: scene.id,
                            title: scene.title,
                            folderName: scene.folderName,
                            fullPathToFolder: scene.fullPathToFolder,
                        }
                    })
                    .map(scene => {

                        let checks = [];

                        /**
                         * @check ID
                         */
                        let checkId = `✅`;
                        if(typeof(scene.id)==='number' || !isNaN(parseInt(scene.id))){
                            checkId = `🙀 Our API has changed. ID needs to be a string that matches the folder`;
                        }
                        checks.push({key: 'id', check: checkId});

                        /**
                         * @check folderName
                         */
                        let checkFolderName = `✅`;
                        if(!scene.folderName){
                            checkFolderName = `❌ Folder name has not been provided`;
                        }
                        checks.push({key: 'folderName', check: checkFolderName});

                        /**
                         * @check fullPathToFolder
                         */
                        if(checkFolderName === `✅`){
                            let checkFullPathToFolder = `✅`;
                            if(!fs.existsSync(scene.fullPathToFolder)){
                                checkFullPathToFolder = `❌ folder does not exist`;
                            }
                            checks.push({key:'fullPathToFolder', check:checkFullPathToFolder});
                        }

                        return {
                            ...scene,
                            checks,
                        }
                    });
                
                /**
                 * @step is valid
                 */
                isValid = !(scenesMissingMeta.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking categories for meta data:'));
                    if(!isValid){
                        let toPrint = scenesMissingMeta
                            .map(cat=>chalk.blue(` ${cat.title}:\n`)+cat.checks.map(c=>`   • ${c.key}: ${c.check}`).join('\n')).join('\n');
                        console.log(chalk.red.italic(`⛑ I have checked the playbook.json, and these categories metadata:`))
                        console.log(toPrint);
                    }
                    else{
                        console.log(chalk.green(`✅ All the categories have the metadata`));
                    }
                }
                return {
                    isValid,
                    scenesMissingMeta,
                };
            }
            auditScenesWithoutFolders(scenes, printLogs){
                let isValid = false;
                const scenesMissingFolders = scenes
                    .filter((scene)=>{
                        const doesSceneFolderExist = fs.existsSync(scene.fullPathToFolder);
                        const isMissing = !doesSceneFolderExist;
                        return isMissing;
                    })
                    .map(scene => {
                        return {
                            id: scene.id,
                            title: scene.title,
                            folderName: scene.folderName,
                            fullPathToFolder: scene.fullPathToFolder,
                        }
                    });

                /**
                 * @step is valid
                 */
                isValid = !(scenesMissingFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking for scenes without folders:'));
                    if(!isValid){
                        console.log(chalk.red.italic(`⛑ I have checked the playbook folder, and these scenes are missing folders:`));
                        console.log(scenesMissingFolders.map(scene=>chalk.bold('• 🦄 '+scene.title)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`✅ All the scenes have the folders`));
                    }
                }

                /**
                 * @returns {Scene[]} scenes with no folders
                 */
                return {
                    isValid,
                    scenesMissingFolders,
                };
            }
            auditFoldersWithoutScenes(pathToSceneFolder, scenes, printLogs){
                let isValid = false;
                let folders = [];
                try{
                    const {
                        nextSceneId,
                        scenes: sceneFolders,
                    } = filesSrv.findScenes(pathToSceneFolder);
                    folders = sceneFolders;
                }catch(err){
                    isValid = false;
                }

                const orphandedFolders = [];
                const foldersFromPlaybook = scenes.map(scene => scene.folderName);

                folders.forEach(folder => {
                    const folderExistsInPlaybook = foldersFromPlaybook.includes(folder);
                    if(!folderExistsInPlaybook){
                        orphandedFolders.push(folder);
                    }
                });

                /**
                 * @step is valid
                 */
                isValid = !(orphandedFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                 if(printLogs){
                     console.log(chalk.italic('\n👉 Checking for folders without scenes:'));
                    if(!isValid){
                        console.log(chalk.italic.red(`⛑ I have checked the playbook folder, and these folders don't match any scenes in the playbook.json:`))
                        console.log(chalk.bold(`🗂 ${this.playbookFolder}`));
                        console.log(orphandedFolders.map(folder=>chalk.bold(`• 🗂 /${folder}`)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`✅ All the folders match scenes in the playbook.json`));
                    }
                }

                return {
                    isValid,
                    orphandedFolders,
                };
            }
        auditSteps(){
            /**
             * @todo turn back on
             */
             console.log(chalk.yellowBright('@todo - turn on audit steps'));
             return true;

            const steps = this.getSteps();   
            const metaData              = this.auditStepsMetaData(steps, true);
            const stepsWithoutFolders   = this.auditStepsWithoutFolders(steps, true);
            const foldersWithoutSteps   = this.auditFoldersWithoutSteps(steps, true);
            return metaData.isValid && 
                stepsWithoutFolders.isValid && 
                foldersWithoutSteps.isValid;
        }
            auditStepsMetaData(steps, printLogs){
                let isValid = false;
                const stepsMissingMeta = steps
                    .filter((step)=>{
                        /**
                         * @step if the folder is autogenerated we've missed meta data
                         */
                        if(step.isFolderAndIdGenerated){
                            return step.isFolderAndIdGenerated;
                        }
                        else{
                            const hasId = step.hasOwnProperty('id');
                            const hasTitle = step.hasOwnProperty('title');
                            const hasFolderName = step.hasOwnProperty('folderName');
                            const isValid = hasId && hasTitle && hasFolderName;
                            const isMissing = !isValid;
                            return isMissing;
                        }
                    })
                    .map(step => {
                        return {
                            id: step.id,
                            title: step.title,
                            folderName: step.folderName,
                            fullPathToFolder: step.fullPathToFolder,
                        }
                    })
                    .map(step => {

                        let checks = [];

                        /**
                         * @check ID
                         */
                        let checkId = `✅`;
                        if(typeof(step.id)==='number' || !isNaN(parseInt(step.id))){
                            checkId = `🙀 Our API has changed. ID needs to be a string that matches the folder`;
                        }
                        checks.push({key: 'id', check: checkId});

                        /**
                         * @check folderName
                         */
                        let checkFolderName = `✅`;
                        if(!step.folderName){
                            checkFolderName = `❌ Folder name has not been provided`;
                        }
                        checks.push({key: 'folderName', check: checkFolderName});

                        /**
                         * @check fullPathToFolder
                         */
                        if(checkFolderName === `✅`){
                            let checkFullPathToFolder = `✅`;
                            if(!fs.existsSync(step.fullPathToFolder)){
                                checkFullPathToFolder = `❌ folder does not exist`;
                            }
                            checks.push({key:'fullPathToFolder', check:checkFullPathToFolder});
                        }

                        return {
                            ...step,
                            checks,
                        }
                    });
                
                /**
                 * @step is valid
                 */
                isValid = !(stepsMissingMeta.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking steps for meta data:'));
                    if(!isValid){
                        let toPrint = stepsMissingMeta
                            .map(step=>chalk.blue(` ${step.title}:\n`)+step.checks.map(check=>`   • ${check.key}: ${check.check}`).join('\n')).join('\n');
                        console.log(chalk.red.italic(`⛑ I have checked the playbook.json, and these steps metadata:`))
                        console.log(toPrint);
                    }
                    else{
                        console.log(chalk.green(`✅ All the categories have the metadata`));
                    }
                }
                return {
                    isValid,
                    stepsMissingMeta,
                };
            }
            auditStepsWithoutFolders(steps, printLogs){
                let isValid = false;
                const stepsMissingFolders = steps
                    .filter((step)=>{
                        const doesStepFolderExist = fs.existsSync(step.fullPathToFolder);
                        const isMissing = !doesStepFolderExist;
                        return isMissing;
                    })
                    .map(step => {
                        return {
                            id: step.id,
                            title: step.title,
                            folderName: step.folderName,
                            fullPathToFolder: step.fullPathToFolder,
                        }
                    });

                /**
                 * @step is valid
                 */
                isValid = !(stepsMissingFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking for steps without folders:'));
                    if(!isValid){
                        console.log(chalk.red.italic(`⛑ I have checked the playbook folder, and these steps are missing folders:`));
                        console.log(stepsMissingFolders.map(step=>chalk.italic.grey(`• 🦄 ${step.id}:\n`)+chalk.bold(`\t${step.title}`)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`✅ All the steps have the folders`));
                    }
                }

                /**
                 * @returns {Step[]} steps with no folders
                 */
                return {
                    isValid,
                    stepsMissingFolders,
                };
            }
            auditFoldersWithoutSteps(steps, printLogs){
                let isValid = false;
                let folders = [];
                try{
                    const {
                        nextStepId,
                        steps: stepFolders,
                    } = filesSrv.findSteps(pathToStepFolder);
                    folders = stepFolders;
                }catch(err){
                    isValid = false;
                }

                const orphandedFolders = [];
                const foldersFromPlaybook = steps.map(step => step.folderName);

                folders.forEach(folder => {
                    const folderExistsInPlaybook = foldersFromPlaybook.includes(folder);
                    if(!folderExistsInPlaybook){
                        orphandedFolders.push(folder);
                    }
                });

                /**
                 * @step is valid
                 */
                isValid = !(orphandedFolders.length > 0);

                /**
                 * @log print to the console (unless suppressed)
                 */
                if(printLogs){
                    console.log(chalk.italic('\n👉 Checking for folders without steps:'));
                    if(!isValid){
                        console.log(chalk.italic.red(`⛑ I have checked the playbook folder, and these folders don't match any steps in the playbook.json:`))
                        console.log(chalk.bold(`🗂 ${this.playbookFolder}`));
                        console.log(orphandedFolders.map(folder=>chalk.bold(`• 🗂 /${folder}`)).join('\n'));
                    }
                    else{
                        console.log(chalk.green(`✅ All the folders match steps in the playbook.json`));
                    }
                }

                return {
                    isValid,
                    orphandedFolders,
                };
            }
    createMissingFolders(){
        const categories = this.getCategories();
        const {
            categoriesMissingFolders,
        } = this.auditCategoriesWithoutFolders(categories);

        categoriesMissingFolders.map(cat => {
            if(!fs.existsSync(cat.fullPathToFolder)){
                fs.mkdirSync(cat.fullPathToFolder);
            }
        });
        
        const scenes = this.getScenes();
        const {
            scenesMissingFolders,
        } = this.auditScenesWithoutFolders(scenes);
        scenesMissingFolders.map(scene => {
            if(!fs.existsSync(scene.fullPathToFolder)){
                fs.mkdirSync(scene.fullPathToFolder);
            }
        });

        const steps = this.getSteps();
        const {
            stepsMissingFolders,
        } = this.auditStepsWithoutFolders(steps);
        stepsMissingFolders.map(step => {
            if(!fs.existsSync(step.fullPathToFolder)){
                fs.mkdirSync(step.fullPathToFolder);
            }
        });
    }
    updateMissingPlaybookJson(){
        let categories = lodash.cloneDeep(this.getCategories());
        categories = categories.map(cat => {
            delete cat.isFolderAndIdGenerated;
            delete cat.fullPathToFolder;

            cat.scenes = cat.scenes.map(scene => {
                delete scene.isFolderAndIdGenerated;
                delete scene.fullPathToFolder;
                delete scene.category;

                scene.steps = scene.steps.map(step => {
                    delete step.isFolderAndIdGenerated;
                    delete step.fullPathToFolder;
                    delete step.category;
                    delete step.scene;

                    return step;
                });

                return scene;
            });

            return cat;
        });
        fs.writeFileSync('./playbook.json', JSON.stringify({categories}, null, 4), 'utf8');            
    }
    /**
     * 
     * @returns {PlaybookModel} playbookModel
     */
    convertToModel(){
        this.playbookModel = new PlaybookModel(this.playbookName, this.playbookJsonFileName);

        this.getUpdatedCategoriesAsTree().map(cat => {
            
            const playbookCategoryModel = new PlaybookCategoryModel(
                cat.title || cat.name,
                cat.id,
                cat.folderName,
            );

            // cat.sceneModels = cat.scenes.map(scene => {
            cat.scenes.map(scene => {
                
                const playbookSceneModel = new PlaybookSceneModel(
                    scene.title,
                    scene.id,
                    scene.folderName,
                );
                playbookSceneModel.categoryId = playbookCategoryModel.id;

                scene.steps.map(step => {
                    
                    const playbookStepModel = new PlaybookStepModel(
                        step.name,
                    );
                    playbookStepModel.id = step.id;
                    playbookStepModel.playbookJsRequireId = step.id && step.id.split('-').join('_');
                    playbookStepModel.relativePathFromPlaybookFolder = step.relativePathFromPlaybookFolder;
                    playbookStepModel.fullPathToFolder = step.fullPathToFolder;
                    playbookStepModel.timeline = step.timeline;
                    playbookStepModel.categoryId = playbookCategoryModel.id;
                    playbookStepModel.sceneId = playbookSceneModel.id;

                    /**
                     * @step helper - to stash Step Models directly on the PlaybookModel so we can print out the steps without nesting too deep
                     */
                    this.playbookModel.addStepModel(playbookStepModel);

                    /**
                     * @step add step to the scene model
                     */
                    playbookSceneModel.addStepModel(playbookStepModel);
                    
                    if(step.timeline){
                        step.timeline.map(timeline => {

                            if(!timeline.panel){
                                throw new Error(chalk.red(`Timeline is missing a "panel": \n`) + chalk.cyan(JSON.stringify(Object.keys(timeline), null, 4)));
                            }
                            if(!timeline.hasOwnProperty('start')){
                                throw new Error(chalk.red(`Timeline is missing a "start" time: \n`) + chalk.cyan(JSON.stringify(Object.keys(timeline), null, 4)));
                            }
                            if(!timeline.hasOwnProperty('duration')){
                                throw new Error(chalk.red(`Timeline is missing a "duration" time: \n`) + chalk.cyan(JSON.stringify(Object.keys(timeline), null, 4)));
                            }

                            switch(timeline.panel){
                                case 'description':
                                    /**
                                     * @example e.g.
                                    {
                                        "id": 1,
                                        "panel": "description",
                                        "start": 0,
                                        "duration": 5000,
                                        "description": [
                                            {
                                                "tag": "h1",
                                                "txt": "💅 Defining a Grid"
                                            },
                                        ]
                                    }
                                     */ 
                                    if(!timeline.description){
                                        throw new Error(chalk.red(`The description panel is missing a "description": \n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));
                                    }
                                    else{
                                        const timelineDescriptionModel = new PlaybookTimelineDescriptionModel(
                                            timeline.start,
                                            timeline.duration,
                                            PLAYBOOK.defaultDescriptionFilename || 'description.md',
                                        );
                                        playbookStepModel.addDescriptionModel(timelineDescriptionModel);
                                    }
                                    
                                    break;
                                case 'code':
                                    /**
                                     * @example e.g.
                                    "code": {
                                        "template": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/template.hbs",
                                        "template_data": {
                                            "title": "CSS Example 02",
                                            "partial_1": "{{partial_1}}",
                                            "partial_2": "{{partial_2}}"
                                        },
                                        "partial_sections": [
                                            {
                                                "partial_id": "partial_1",
                                                "start": 200,
                                                "duration": 2000,
                                                "template": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/partials/partial01.hbs",
                                                "template_data": {}
                                            },
                                            {
                                                "partial_id": "partial_2",
                                                "start": 2000,
                                                "duration": 3000,
                                                "template": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/partials/partial02.hbs",
                                                "template_data": {}
                                            }
                                        ],
                                        "output": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/css-grid.html"
                                    }
                                    */
                                    if(timeline.code){
                                        /**
                                         * @validate code block
                                         */
                                        if(!timeline.code.template)
                                            throw new Error(chalk.red(`Timeline code panel is missing a "template": \n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));
                                        if(!timeline.code.output)
                                            throw new Error(chalk.red(`Timeline code panel is missing an "output": \n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));

                                        /**
                                         * @step add code model
                                         */
                                        const timelineCodeModel = new PlaybookTimelineCodeModel(
                                            timeline.start,
                                            timeline.duration,
                                            timeline.code.template,
                                            timeline.code.output,
                                            timeline.code.template_data || {},
                                        );
                                        playbookStepModel.addCodeModel(timelineCodeModel);

                                        /**
                                         * @step add partial models
                                         */
                                        if(timeline.code.partial_sections){
                                            /**
                                             * @see e.g. 
                                                "partial_sections": [
                                                    {
                                                        "partial_id": "partial_1",
                                                        "start": 200,
                                                        "duration": 2000,
                                                        "template": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/partials/partial01.hbs",
                                                        "template_data": {}
                                                    },
                                                    {
                                                        "partial_id": "partial_2",
                                                        "start": 2000,
                                                        "duration": 3000,
                                                        "template": "cat02-grid-by-example/scene01-examples/step02-defining-a-grid/partials/partial02.hbs",
                                                        "template_data": {}
                                                    }
                                                ]
                                             */
                                            timeline.code.partial_sections.map(partial => {
                                                if(!partial.hasOwnProperty('start'))
                                                    throw new Error(chalk.red(`Partial is missing a "start" time: \n`) + chalk.magenta(JSON.stringify(partial, null, 4)));
                                                if(!partial.hasOwnProperty('duration'))
                                                    throw new Error(chalk.red(`Partial is missing a "duration" time: \n`) + chalk.magenta(JSON.stringify(partial, null, 4)));
                                                if(!partial.hasOwnProperty('template'))
                                                    throw new Error(chalk.red(`Partial is missing a "template" path: \n`) + chalk.magenta(JSON.stringify(partial, null, 4)));
                                                if(!partial.hasOwnProperty('partial_id'))
                                                    throw new Error(chalk.red(`Partial is missing a "partial_id": \n`) + chalk.magenta(JSON.stringify(partial, null, 4)));

                                                const partialModel = new PlaybookTimelineCodePartialModel(
                                                    partial.start,
                                                    partial.duration,
                                                    partial.partial_id,
                                                    partial.template,
                                                    partial.template_data || {},
                                                );
                                                timelineCodeModel.addPartialModel(partialModel);
                                            });
                                        }   

                                    }
                                    else{
                                        throw new Error(chalk.red(`Timeline panel is marked as "code" is missing the "code" block\n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));
                                    }
                                break;
                                case 'terminal':
                                    /**
                                     * @see e.g. 
                                     * 
                                        {
                                            "id": "id",
                                            "panel": "terminal",
                                            "start": 100,
                                            "duration": 1000,
                                            "terminal" : {
                                                "commands" : []
                                            }
                                        }
                                     */
                                    if(!timeline.terminal){
                                        throw new Error(chalk.red(`Terminal/CLI panel is missing "terminal" block.\nIt needs to include: \n`)+chalk.blueBright(`{ terminal: { commands: [] } } \n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));
                                    }
                                    else if(!timeline.terminal.commands){
                                        throw new Error(chalk.red(`Terminal/CLI panel is missing "commands" block.\nIt needs to include: \n`)+chalk.blueBright(`{ terminal: { commands: [] } } \n`) + chalk.magenta(JSON.stringify({timeline}, null, 4)));
                                    }
                                    else{
                                        const terminalModel = new PlaybookTimelineTerminalModel(
                                            timeline.start,
                                            timeline.duration
                                        );
                                        timeline.terminal.commands.map(command =>{
                                            terminalModel.addCommand(command);
                                        });
                                        playbookStepModel.addTerminalModel(terminalModel);
                                    }
                                    break;
                                case 'audio':
                                    break;
                                case 'video':
                                    break;
                                case 'test':
                                    break;
                                case 'spreadsheet':
                                    break;
                                case 'browser':
                                    break;
                            }
                        });
                    }

                    console.log(playbookStepModel.printJsContent());
                    fs.writeFileSync('./logs.txt', playbookStepModel.printJsContent(), 'utf8');
                    process.exit();

                    return playbookStepModel;
                });

                /**
                 * @step add scene to the playbookCategoryModel after the steps have been added
                 */
                playbookCategoryModel.addSceneModel(playbookSceneModel);

                return playbookSceneModel;
            });

            /**
             * @step add category to the playbook model
             */
            this.playbookModel.addCategoryModel(playbookCategoryModel);

            return playbookCategoryModel;
        });

        return this.playbookModel;
    }
}

module.exports = PlaybookJsonService;

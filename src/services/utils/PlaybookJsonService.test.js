/**
 * @requires fs
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
/**
 * @requires Service
 */
const PlaybookJsonService = require('./PlaybookJsonService');

/**
 * @requires mock
 */
const PATH_TO_PLAYBOOK = path.resolve(os.homedir(), `Code/MASTERCLASS/microservices/microservice_storage/storage/projects/masterclass/blueprints/css-grid-playbook/1.0.0/`);
// const playbookJson = require('../../views/templates/examples/playbook.json');
const playbookJson = require(path.resolve(PATH_TO_PLAYBOOK, 'playbook.json'));

describe('PlaybookJsonService', ()=>{

    const playbookFolder = PATH_TO_PLAYBOOK; //path.resolve(__dirname, '../../views/templates/examples/');
    const playbookJsonSrv = new PlaybookJsonService(playbookFolder);

    it(`#setPlaybookJson should exist`, ()=>{
        const isValid = playbookJsonSrv.setPlaybookJson(playbookFolder);
        expect(isValid).toBe(true);

    });
    it(`#validate should be valid`, ()=>{
        const isValid = playbookJsonSrv.validate();
        expect(isValid).toBe(true);
    });
    it(`#readPlaybookJson should read the playbook json`, ()=>{
        const {isValid, playbookJson} = playbookJsonSrv.readPlaybookJson();
        expect(isValid).toBe(true);
    });
    it(`#_transformTitleToFolderId should transform`, ()=>{
        const type = 'cat';
        const title = 'Hello World'; 
        const index = 1;
        const id = playbookJsonSrv._transformTitleToFolderId(type, title, index);
        expect(id).toEqual(`cat01-hello-world`);
    });
    it(`#getCategories should read the categories`, ()=>{
        const cats = playbookJsonSrv.getCategories();
        expect(Array.isArray(cats)).toBe(true);
        expect(cats.length).toEqual(2);
        // console.log(`\n\n\n CATS ----> \n\n\n`, cats.map(cat=>`${cat.title}`));

    });
    it(`#getScenes should read the scenes`, ()=>{
        const scenes = playbookJsonSrv.getScenes();
        expect(Array.isArray(scenes)).toBe(true);
        expect(scenes.length).toEqual(4);
        // console.log(`\n\n\n STEPS ----> \n\n\n`, scenes.map(scene=>`${scene.category.id}/${scene.id}`));

    });
    it(`#getSteps should read the steps`, ()=>{
        const steps = playbookJsonSrv.getSteps();
        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(12);

        // console.log(`\n\n\n STEPS ----> \n\n\n`, steps.map(step=>`${step.category.id}/${step.scene.id}/${step.id}`));
    });
    describe('audits', ()=>{
        describe('auditFoldersWithoutCategories', ()=>{
            it('#auditFoldersWithoutCategories one orphan', ()=>{
                const mockCatsFromPlaybook = [
                    {
                        folderName: 'cat01<---FOLDERWONTEXIST',
                    },
                    {
                        folderName: 'cat02-grid-by-example',
                    }
                ];
                const {
                    isValid,
                    orphandedFolders,
                } = playbookJsonSrv.auditFoldersWithoutCategories(mockCatsFromPlaybook);
                expect(isValid).toBe(true);
                expect(orphandedFolders).toEqual([
                    "cat01-css-grid"
                ]);
            });
            it('#auditFoldersWithoutCategories should be valid with no orphans ', ()=>{
                const mockPlaybook = {
                    categories: [
                        {
                            folderName: 'cat01',
                        },
                        {
                            folderName: 'cat02-grid-by-example',
                        }
                    ],
                };
                const {
                    isValid,
                    orphandedFolders,
                } = playbookJsonSrv.auditFoldersWithoutCategories(mockPlaybook.categories);
                expect(isValid).toBe(true);
                expect(orphandedFolders).toEqual([
                    "cat01-css-grid",
                ]);
            });
            it('#auditFoldersWithoutCategories should have 2 orphaned folders', ()=>{
                const mockPlaybook = {
                    categories: [
                        "cat01-css-grid",
                    ],
                };
                const {
                    isValid,
                    orphandedFolders,
                } = playbookJsonSrv.auditFoldersWithoutCategories(mockPlaybook.categories);
                expect(isValid).toBe(true);
                expect(orphandedFolders).toEqual([
                    'cat01-css-grid', 
                    'cat02-grid-by-example',
                ]);
            });
            it('#auditFoldersWithoutCategories from css-grid-by-example playbook should be valid and have 2 orphaned folders', ()=>{
                const {
                    isValid,
                    orphandedFolders,
                } = playbookJsonSrv.auditFoldersWithoutCategories(playbookJson.categories);
                expect(isValid).toBe(false);
                expect(orphandedFolders).toEqual([]);
            });
            it('#auditFoldersWithoutCategories from css-grid-by-example playbook should be valid and have no orphaned folders', ()=>{
                const categories = playbookJsonSrv.getCategories();

                const {
                    isValid,
                    orphandedFolders,
                } = playbookJsonSrv.auditFoldersWithoutCategories(categories, true);
                expect(isValid).toBe(false);
                expect(orphandedFolders).toEqual([]);
            });
        });
        describe('auditCategoriesWithoutFolders', ()=>{
            it('#auditCategoriesWithoutFolders from playbook.json should have 2 categories without folders', ()=>{
                const categories = playbookJsonSrv.getCategories();

                const {
                    isValid,
                    categoriesMissingFolders: catsMissingFolders,
                } = playbookJsonSrv.auditCategoriesWithoutFolders(categories, true);
                expect(isValid).toBe(true);
                expect(catsMissingFolders.map(c=>c.id)).toEqual([
                    // 'cat03-css-grid', 
                    // 'cat04-grid-by-example',
                ]);
            });
        });
        describe('auditCategoriesMetaData', ()=>{
            it('#auditCategoriesMetaData raw playbook.json should be missing meta data for 2 cats ', ()=>{
                const {
                    isValid,
                    categoriesMissingMeta,
                } = playbookJsonSrv.auditCategoriesMetaData(playbookJson.categories);
                expect(isValid).toBe(true);
                expect(categoriesMissingMeta.map(c=>c.title)).toEqual([
                    // 'CSS Grid',
                    // 'Grid by Example',
                ]);
            });
            it('#auditCategoriesMetaData categories from service should be missing meta data for 2 cats ', ()=>{
                const categories = playbookJsonSrv.getCategories();

                const {
                    isValid,
                    categoriesMissingMeta,
                } = playbookJsonSrv.auditCategoriesMetaData(categories, true);
                expect(isValid).toBe(true);
                expect(categoriesMissingMeta.map(c=>c.title)).toEqual([
                    // 'CSS Grid',
                    // 'Grid by Example',
                ]);
            });
        });
        describe('findCategoryByFolderName', ()=>{
            it('#findCategoryByFolderName should find "cat01-css-grid"', ()=>{
                const folderName = `cat01-css-grid`;
                const category = playbookJsonSrv.findCategoryByFolderName(folderName);
                expect(category.folderName).toEqual(folderName);
            });
            it('#findCategoryByFolderName should find "cat02-grid-by-example"', ()=>{
                const folderName = `cat02-grid-by-example`;
                const category = playbookJsonSrv.findCategoryByFolderName(folderName);
                expect(category.folderName).toEqual(folderName);
            });
        });
    });
});
const fs = require('fs');
const rmDir = require('rimraf');
const fetchCheerioObject = require('fetch-cheerio-object');


const ROOT_FOLDER = './mozilla-javascript-guide';


async function getToc(tocContract){

	const $ = await fetchCheerioObject(tocContract.url);

	
	$('summary').each((i, el) => {

		const summaryText = $(el).html().trim();

		// console.log('\n•summaryText', summaryText);

		if(summaryText === 'JavaScript Guide'){

			console.log('\n•summaryText', summaryText);
			console.log(true);

			const links = $(el).parent().find('details ol li a').map((_i, a) => {

				// console.log('-----')
				// console.log('a', a);

				return {
					href: $(a).attr('href'),
					tag: $(a).html()
				}
			}).get();
			// console.log('links', links);

			links.forEach(async a => {
				await getPage(tocContract.rootUrl +'/'+ a.href);
			})

		}

	})
	
}

async function getPage(url){

	const $ = await fetchCheerioObject(url);

	const id = 'article#wikiArticle';

	const wikiArticle = $(id);


	var nextId = 0,
		h2Id = 0, 
		h3Id = 0,
		h2 = [{
			_id: 0, 
			tag: 'h2',
			text: 'intro',
			html: '',
			kids: []
		}],
		h3 = [{
			_id: 0, 
			tag: 'h3',
			text: 'intro',
			html: '',
			kids: []
		}];

	var models = [];

	wikiArticle.children().map((i, el)=>{

		var model = {
			_id: ++nextId, 
			tag: el.name,
			text: $(el).text(),
			html: $(el).html(),
			kids: []
		}

		// console.log('model.tag', model.tag)

		if(model.tag === 'h2'){
			h2Id++;
			h2.push(model);
		}
			else{
				h2[h2.length - 1].kids.push(model);
			}
		if(model.tag === 'h3'){
			h3Id++;
			h3.push(model);
		}
			else{
				h3[h3.length - 1].kids.push(model);
			}
		if(model.tag === 'pre'){

		}
		if(model.tag === 'p'){
			
		}

		model.h2Id = h2Id;
		model.h2_folder = `${h2Id}_${h2[h2Id].text.toLowerCase().replace("...",'-').replace(/ /g,'-')}` ;
		model.h3Id = h3Id;
		model.h3_folder = `${h3Id}_${h3[h3Id].text.toLowerCase().replace("...",'-').replace(/ /g,'-')}` ;

		
		models.push(model);
		//return model;
		
	})

	console.log('\n--- create h2 ---');
	h2.forEach(h => {
		createFolder(ROOT_FOLDER, h.h2_folder );

		
		const contents = h.kids.reduce((total, kid, i) => {

			// console.log(' • h2 kid', {total:total, kid:kid, i:i});
			/*
			if(kid.tag === 'pre'){
				total += kid.text;
			}
			else {
				total += kid.html;
			}
			*/
			total = (i === 1 ? '' : total );

			total += `
				<!-- ~~~~~ ${kid._id} ~~~~~ --> 
				<${kid.tag}>
					${kid.html}
				</${kid.tag}>

			`;

			return total;
		})
		console.log('\n--- h2 kids contents ---\n', contents);

	});

	console.log('\n--- create h3 ---');
	h3.forEach(h => {
		h.h2_folder = h.h2_folder || '';
		var rootFolder = (h.h2_folder ?  ROOT_FOLDER : `${ROOT_FOLDER}/${h.h2_folder}`);
		createFolder(rootFolder, h.h3_folder );

		console.log('\n--- h3 kids ---');
		/*
		h.kids.forEach(kid => {
			console.log(' • h3 kid', {
				folderPath: `${rootFolder}/${h.h3_folder}`,
				h2_folder: kid.h2_folder,
				h3_folder: kid.h3_folder,
				tag: kid.tag
			});
		})
		*/
		const contents = h.kids.reduce((total, kid, i) => {
			// console.log(' • h2 kid', {kid:kid});
			/*
			if(kid.tag === 'pre'){
				total += kid.text;
			}
			else {
				total += kid.html;
			}
			*/
			total = (i === 1 ? '' : total );
			total += `
				
				<!-- ~~~~~ ${kid._id} ~~~~~ --> 
				<${kid.tag}>
					${kid.html}
				</${kid.tag}>

			`;

			return total;
		})
		console.log('\n--- h3 kids contents ---\n', contents);

	});

	console.log('\n--- create models ---');
	models.forEach(m => {

	});
}

function createFolder(path, folderName) {
	
	// folderName = folderName || '';
	const fullPath = (folderName ? `${path}/${folderName}` : path );

	console.log('createFolder', {path:path, folderName: folderName, fullPath: fullPath}); 
	return;

	// -- remove original
	if (fs.existsSync(fullPath)){
	    rmDir.sync(fullPath);
	}

	// -- create new dir 
	fs.mkdirSync(fullPath);
}

function createMarkdown(path, fileName, contents) {
	
	const fullPath = `${path}/${fileName}`;

	fs.writeFileSync(fullPath, contents);

}


function main(){

	createFolder('', ROOT_FOLDER);

	getToc({
		rootUrl: 'https://developer.mozilla.org',
		url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types'
	});
}
main();
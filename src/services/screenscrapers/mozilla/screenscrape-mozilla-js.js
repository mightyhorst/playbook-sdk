const fetchCheerioObject = require('fetch-cheerio-object');

class ScreenscrapeService{

	constructor() {
        /*
        return (async () => {

            this.$ = await fetchCheerioObject('https://example.org/');

            return this; 
        })();
        */
    }

    _getElementsByText(strFind, tag) {
    	return this.$(tag).filter(el => el.textContent.trim() === strFind.trim());
    }
    _getElementByText(str, tag) {
    	return this.$(tag).find(el => el.textContent.trim() === strFind.trim());
    }

	async getToc(tocContract){

		const $ = await fetchCheerioObject(tocContract.url);

		$('summary').each((i, el) => {

			const summaryText = $(el).html().trim();

			console.log('\n•summaryText', summaryText);

			if(summaryText === 'JavaScript Guide'){

				console.log(true);

				const links = $(el).parent().find('li a');
				console.log('links', links);

			}

		})

		
	}

}


const screenScrape = new ScreenscrapeService();

screenScrape.getToc({
	url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types'
});
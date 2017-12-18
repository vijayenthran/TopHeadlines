

'use strict';

const Categories =['business', 'gaming', 'health-and-medical', 'music', 'sport', 'technology'];
const Sources =['espn', 'espn-cric-info', 'bbc-news', 'cnn', 'the-times-of-india', 'techcrunch', 'nbc-news', 'abc-news', 'al-jazeera-english', 'the-new-york-times', 'the-wall-street-journal', 'usa-today'];


let headlines = (function () {
	const config = {
		url: 'https://newsapi.org/v2/top-headlines',
		data : {
			apikey : '93c6b412948740479094f9ace7c8aa27'
			// format:"jsonp",
			// callback:"jsonp_callback"
		},
		method: 'GET'
		// dataType: "jsonp",
		// jsonpCallback: 'jsonp_callback',
		// contentType: 'application/json',
	};

	function removeBBCSportNews(toFilterBBC) {
		let manipulatedOutput = toFilterBBC.articles.filter(article => {
			if(article.source.id !== 'bbc-sport'){
				return article;
			}
		}).filter(article => {
			if(article.urlToImage){
				return article;
			}
		})
		.filter((item, index) => (index<=40));
		return manipulatedOutput;
	}

	function handleLargeSuccessOutput(successOutput, optionalParam) {
		if(optionalParam.data.category === 'sport'){
			return removeBBCSportNews(successOutput);
		}
		let output = successOutput;
		let manipulatedOutput;
		if(output.totalResults > 40) {
			manipulatedOutput=output.articles
			.filter(article => {
				if(article.urlToImage){
					return article;
				}
			})
			.filter((item, index) => (index<=40));
		}
		else
		{
			manipulatedOutput=output.articles
			.filter(article => {
				if(article.urlToImage){
					return article;
				}
			});
		}
		return manipulatedOutput;
	}

	// function handleRetrivingInfo(retriveImgObj) {
	// 	let imageURL = return retriveImgObj.filter(obj => obj.urlToImage);
	// 	let linkURL = return retriveImgObj.filter(obj => obj.url);
	// 	let title   = return retriveImgObj.filter(obj => obj.title);
	// 	let description =  return retriveImgObj.filter(obj => obj.description);
	// 	return {
	// 		_imgURL  : imageURL,
	// 		_linkURL : linkURL,
	// 		_title : title,
	// 		_description : description
	// 	}
	// }

	function handleThumbnailDispaly (thumbnailObj) {
		let element = thumbnailObj.map(obj => 
			// ` <p class="thubmnails-description" style="display:none">
			//  
			`
			<div class='thumbnailWrapper'>
			<img src="${obj.urlToImage}" alt="${obj.title}" class= "thumbnails img_img">
			<p class="img_description">
			${obj.description}
			</p>
			</div>
			`
			);
		$('.displayNews').append(element);
	}

	
	function handleSuccess(successObj, optionalParam) {
		let output = handleLargeSuccessOutput(successObj, optionalParam);
		console.log(output);
		handleThumbnailDispaly(output);
		return;
	}

	function handleFailure (errObj) {
		console.log('There was an error on the Ajax Call');
		console.log(errObj);
		return;
	}

	function manipulateConfig(userOption){
		let copyconfig = Object.assign({}, config);
		delete copyconfig.data.q;
		delete copyconfig.data.category;
		delete copyconfig.data.sources
		if(userOption.type === 'Search Box'){
			copyconfig.data.q = userOption.value;
		} else if(userOption.type === 'category'){
			copyconfig.data.category = userOption.value;
		}else if(userOption.type === 'sources'){
			copyconfig.data.sources = userOption.value;
		}
		getHeadlines(copyconfig);
		return;
	}

	function clearThumbnails(){
		$('.displayNews').find('.thumbnailWrapper').remove();
		return;
	}

	let getHeadlines = function(manipulatedconfig) {
		clearThumbnails();
		return $.ajax(manipulatedconfig)
		.then(function(res){
			handleSuccess(res, manipulatedconfig);
			return;
		})
		.catch(function(err){
			handleFailure(err);
		})
	};
	return {
		sendConfig : manipulateConfig,
	}
})();

function getNewsBySearch() {
	$('.search-form').submit(function(event){
		console.log('I am being called');
		event.preventDefault();
		let inputVal = $('.search-form-text').val();
		let value = {
			type : 'Search Box',
			value : inputVal
		};
		headlines.sendConfig(value);
	}); 
	return;
}

function getNewsByCategories() {
	$('.search-Category-ul').on('click', '.search-Category-button', function(event) {
		event.preventDefault();
		let endPoint = $('.search-Category').data('category');
		let inputValue = $(this).text();
		let categoryObj = {
			type : endPoint,
			value : inputValue
		}
		headlines.sendConfig(categoryObj);
	});
	return;
}

function getNewsFromDropDown(){
	$('.list-options').change(function(event) {
		let inputValue = $( ".list-options option:selected" ).text();
		let endPoint = $( ".list-options option:selected" );
		let endPointdata;
		if(endPoint.closest('.group2-sources').data('sites') === 'sources'){
			endPointdata = 'sources'
		}else{
			endPointdata = 'category'
		}
		let endpointObj = {
			type : endPointdata,
			value : inputValue
		}
		headlines.sendConfig(endpointObj);
	});
	return;
}

function getNewsBySources(){
	$('.search-sites-ul').on('click', '.search-sites-button', function(event) {
		event.preventDefault();
		let endPoint = $('.search-sites').data('sites');
		let inputValue = $(this).text();
		let sourceObj = {
			type : endPoint,
			value : inputValue
		}
		headlines.sendConfig(sourceObj);
	});
	return;
}

function generateCategories(){
	let counter=0;
	let element= Categories.map(category => {
		counter = counter +1;
		return `<li>
		<a href="#" name="Category-${counter}" class="search-Category-button">${category}</a>
		</li>`});
	let elementList= Categories.map(category => {
		return `<option class="group1-category-option">${category}</option>`});
	$('.search-Category-ul').append(element);
	$('.group1-category').append(elementList);
	counter =0;
}

function generateSources(){
	let counter=0;
	let element= Sources.map(source => {
		counter = counter +1;
		return `<li>
		<a href="#" name="Source-${counter}" class="search-sites-button">${source}</a>
		</li>`
	});
	let elementList= Sources.map(source => {
		return `<option class="group2-sources-option">${source}</option>`});
	$('.search-sites-ul').append(element);
	$('.group2-sources').append(elementList);
	counter =0;
}

function readNewsClick() {
	$('.Read-news').on('click', function(){
		$(this).closest('.newspaperImage').slideUp();
		$('.grid-section').removeClass('remove-display')
	});
}

function main() {
	readNewsClick();
	generateCategories();
	generateSources();
	getNewsBySearch();
	getNewsByCategories();
	getNewsBySources();
	getNewsFromDropDown();
	return;
}

$(main())
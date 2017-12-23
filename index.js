'use strict';

const Categories = ['business', 'gaming', 'health-and-medical', 'music', 'sport', 'technology'];
const Sources = ['espn', 'espn-cric-info', 'bbc-news', 'cnn', 'the-times-of-india', 'techcrunch', 'nbc-news', 'abc-news', 'al-jazeera-english', 'the-new-york-times', 'the-wall-street-journal', 'usa-today', 'crypto-coins-news', 'football-italia', 'four-four-two', 'hacker-news', 'msnbc', 'nhl-news', 'reuters', 'the-economist', 'polygon', 'national-geographic', 'mtv-news'];
const noDescriptionText = `Sorry, There is no Description For this News Article, Click on Thumbnail Image" in Thumbnail view, Or "Click to View From Source Button" in List View`;
const filterTopNewsNum = 100;

let headlines = (function () {
	const config = {
		url: 'https://newsapi.org/v2/top-headlines',
		data: {
			apikey: '93c6b412948740479094f9ace7c8aa27'
		},
		method: 'GET'
	};

    // Filter BBC because it does not allow to download images during Search
    function removeBBCSportNews(toFilterBBC) {
    	let manipulatedOutput = toFilterBBC.articles.filter(article => {
    		if (article.source.id !== 'bbc-sport') {
    			return article;
    		}
    	}).filter(article => {
    		if (article.urlToImage) {
    			return article;
    		}
    	})
    	.filter((item, index) => (index <= filterTopNewsNum));
    	return manipulatedOutput;
    }

    function handleNoResults(){
    	$('.no_headlines').removeClass('remove-display');
    	return;
    }

    function handleLargeSuccessOutput(successOutput, optionalParam) {
    	if (optionalParam.data.category === 'sport') {
    		return removeBBCSportNews(successOutput);
    	}
    	let output = successOutput;
    	if(output.totalResults === 0){
    		handleNoResults();
    	}
    	let manipulatedOutput;
    	if (output.totalResults > 40) {
    		manipulatedOutput = output.articles
    		.filter(article => {
    			if (article.urlToImage) {
    				if(!article.description){
    					article.description = noDescriptionText;
    					return article;
    				}
    				return article;
    			}
    		})
    		.filter((item, index) => (index <= 40));
    	}
    	else {
    		manipulatedOutput = output.articles
    		.filter(article => {
    			if (article.urlToImage) {
    				if(!article.description){
    					article.description =  noDescriptionText;
    					return article;
    				}
    				return article;
    			}
    		});
    	}
    	return manipulatedOutput;
    }

    function handleListDisplay(thumbnailObj) {
    	let element = thumbnailObj.map(obj =>
    		`
    		<div class="list_wrapper">
    		<img src="${obj.urlToImage}" alt="${obj.title}" class= "list_view_image" />
    		<p class="list_img_description">
    		'${obj.description}'
    		</p>
    		<a target="_blank" href="${obj.url}">
    		<input type="button"  name="View_detail_news" value="CLick to View From Source" class="view_detail" />
    		</a>
    		</div>
    		`
    		);
    	$('.displayNewsList').append(element);
    }

    function handleThumbnailDispaly(thumbnailObj) {
    	let element = thumbnailObj.map(obj =>
    		`
    		<div class="thumbnailWrapper">
    		<img src="${obj.urlToImage}" alt="${obj.title}" class= "thumbnails img_img" data-source="${obj.url}">
    		<p class="img_description">
    		${obj.description}
    		</p>
    		</div>
    		`
    		);
    	$('.displayNewsGrid').append(element);
    	return;
    }

    function handleSuccess(successObj, optionalParam) {
    	let output = handleLargeSuccessOutput(successObj, optionalParam);
    	handleThumbnailDispaly(output);
    	handleListDisplay(output);
    	return;
    }

    function handleFailure(errObj) {
    	console.log('There was an error on the Ajax Call');
    	console.log(errObj);
    	throw 'errObj';
    }

    function manipulateConfig(userOption) {
    	let copyconfig = Object.assign({}, config);
    	delete copyconfig.data.q;
    	delete copyconfig.data.category;
    	delete copyconfig.data.sources;
    	if (userOption.type === 'Search Box') {
    		copyconfig.data.q = userOption.value;
    	} else if (userOption.type === 'category') {
    		copyconfig.data.category = userOption.value;
    	} else if (userOption.type === 'sources') {
    		copyconfig.data.sources = userOption.value;
    	} else if(userOption.type === 'default'){
    		copyconfig.data.q = userOption.value;
    	}
    	getHeadlines(copyconfig);
    	return;
    }

    function cleanUp() {
    	$('.displayNewsGrid').find('.thumbnailWrapper').remove();
    	$('.displayNewsList').find('.list_wrapper').remove();
    	$('.no_headlines').addClass('remove-display');
    	return;
    }

    let getHeadlines = function (manipulatedconfig) {
    	cleanUp();
    	return $.ajax(manipulatedconfig)
    	.then(function (res) {
    		handleSuccess(res, manipulatedconfig);
    		return;
    	})
    	.catch(function (err) {
    		handleFailure(err);
    	})
    };
    return {
    	sendConfig: manipulateConfig,
    }
})();

function changeCurrentView(val){
	if(!val){
		throw new Error('val not found');
	}else if(val === '1'){
		$('.displayNewsGrid').addClass('remove-display');
		$('.displayNewsList').removeClass('remove-display');
		$('.default_view').val(`List-View Click to change`);
		$('.view_Grid').addClass('remove-display');
		$('.view_List').addClass('remove-display');
		return;
	}else if(val === '2'){
		$('.displayNewsGrid').removeClass('remove-display');
		$('.displayNewsList').addClass('remove-display');
		$('.default_view').val(`Thumbnail-View Click to change`);
		$('.view_Grid').addClass('remove-display');
		$('.view_List').addClass('remove-display');
		return;
	}else if(val === '3'){
		$('.displayNewsGrid').addClass('remove-display');
		$('.displayNewsList').removeClass('remove-display');
		$('.view_Grid').removeClass('remove-display');
		$('.view_List').addClass('remove-display');
		$('.default_view').val('ChooseDefaultView');
		handleToggleView();
		return;
	}
}

function setLocalStorage(localStorageVal){
	let toggleSwitchVal;
	if(!localStorageVal){
		throw new Error('localStorageVal not found');
	}
	if(localStorageVal === 'List'){
		toggleSwitchVal = 1;
	} else if(localStorageVal === 'Thumbnail'){
		toggleSwitchVal = 2;
	} else if(localStorageVal === 'Default'){
		toggleSwitchVal = 3;
	}
	localStorage.setItem('View', toggleSwitchVal);
	$('.view_Grid').addClass('remove-display');
	let getLocalStorageVal= getLocalStorage('View');
	changeCurrentView(getLocalStorageVal);
	return;
}

function getLocalStorage(storageKey){
	if(!storageKey){
		throw new Error('storageKey not found');
	}
	return localStorage.getItem(storageKey);
}

function removeLocalStorage(localStorageVal){
	if(!localStorageVal){
		throw new Error('localStorageVal not found');
	}
	localStorage.removeItem('View');
	return;
}

function handleShowDefault(){
	$('.pop_up_form').submit(function(event){
		event.preventDefault();
		let selectedRadio = $('input[name="view"]:checked').val();
		if(selectedRadio === 'List' || selectedRadio === 'Thumbnail'){
			setLocalStorage(selectedRadio);
		}
		else{
			let defaultToggleSwitch = '3';
			removeLocalStorage(selectedRadio);
			changeCurrentView(defaultToggleSwitch);
		}
		$('.outer_Overlay').addClass('remove-display')
	});
	return;
}

function closePopUp(){
	$('.close_popup').on('click', function(){
		$('.outer_Overlay').addClass('remove-display');
	});
	return;
}

function chooseDefaultView(){
	$('.default_view').on('click', function(){
		$('.outer_Overlay').removeClass('remove-display');
	});
	closePopUp();
	handleShowDefault();
	return;
}


function openLinkNewTab(){
	$('.displayNewsGrid').on('click', '.img_description', function(event){
		event.preventDefault();
		event.stopPropagation();
		let url = $(this).closest('.displayNewsGrid').find('.img_img').data('source');
		window.open(url, '_blank');
	});
}


function handleToggleView() {
	if(!getLocalStorage('View')) {
		$('.toggle-Display').on('click', '.view_Grid', function () {
			$('.displayNewsGrid').removeClass('remove-display');
			$('.displayNewsList').addClass('remove-display');
			$(this).addClass('remove-display');
			$(this).closest('.toggle-Display').find('.view_List').removeClass('remove-display');
		});
		$('.toggle-Display').on('click', '.view_List', function (event) {
			$('.displayNewsGrid').addClass('remove-display');
			$('.displayNewsList').removeClass('remove-display');
			$(this).addClass('remove-display');
			$(this).closest('.toggle-Display').find('.view_Grid').removeClass('remove-display');
		});
		return;
	}else{
		$('.view_Grid').addClass('remove-display');
		let getLocalStorageVal= getLocalStorage('View');
		changeCurrentView(getLocalStorageVal);
		return;
	}
}

function getNewsBySearch() {
	$('.search-form').submit(function (event) {
		event.preventDefault();
		let inputVal = $('.search-form-text').val();
		let value = {
			type: 'Search Box',
			value: inputVal
		};
		headlines.sendConfig(value);
	});
	return;
}

function getNewsByCategories() {
	$('.categories_ul').on('click', '.search-Category-link', function (event) {
		event.preventDefault();
		let endPoint = $('.categories_ul').data('category');
		let inputValue = $(this).text();
		let categoryObj = {
			type: endPoint,
			value: inputValue
		};
		headlines.sendConfig(categoryObj);
	});
	return;
}

function getNewsFromDropDown() {
	$('.list-options').change(function (event) {
		let inputValue = $(".list-options option:selected").text();
		let endPoint = $(".list-options option:selected");
		let endPointdata;
		if (endPoint.closest('.group2-sources').data('sites') === 'sources') {
			endPointdata = 'sources'
		} else {
			endPointdata = 'category'
		}
		let endpointObj = {
			type: endPointdata,
			value: inputValue
		};
		headlines.sendConfig(endpointObj);
	});
	return;
}

function getNewsBySources() {
	$('.source_ul').on('click', '.search-sites-link', function (event) {
		event.preventDefault();
		let endPoint = $('.source_ul').data('sites');
		let inputValue = $(this).text();
		let sourceObj = {
			type: endPoint,
			value: inputValue
		};
		headlines.sendConfig(sourceObj);
	});
	return;
}

function generateCategories() {
	let counter = 0;
	let element = Categories.map(category => {
		counter = counter + 1;
		return `<li>
		<a href="#" name="Category-${counter}" class="search-Category-link">${category}</a>
		</li>`
	});
	let elementList = Categories.map(category => {
		return `<option class="group1-category-option">${category}</option>`
	});
	$('.categories_ul').append(element);
	$('.group1-category').append(elementList);
	counter = 0;
	return;
}

function generateSources() {
	let counter = 0;
	let element = Sources.map(source => {
		counter = counter + 1;
		return `<li>
		<a href="#" name="Source-${counter}" class="search-sites-link">${source}</a>
		</li>`
	});
	let elementList = Sources.map(source => {
		return `<option class="group2-sources-option">${source}</option>`
	});
	$('.source_ul').append(element);
	$('.group2-sources').append(elementList);
	counter = 0;
	return;
}

function readNewsClick() {
	const defaultNewsObj= {
		type : 'default',
		value: 'trump'
	}
	$('.read-news').on('click', function () {
		$(this).closest('.newspaperImage').slideUp();
		$('.grid-section').removeClass('remove-display');
		headlines.sendConfig(defaultNewsObj);
	});
	return;
}

function handleShowUl(){
	$('.menu_categories_title').on('click', function(){
		$('.categories_ul').slideToggle('fast');
	});
	$('.menu_Sources_title').on('click', function(){
		$('.source_ul').slideToggle('fast');
	});
	return;
}

function main() {
	readNewsClick();
	generateCategories();
	generateSources();
	getNewsBySearch();
	getNewsByCategories();
	getNewsBySources();
	getNewsFromDropDown();
	handleToggleView();
	openLinkNewTab();
	chooseDefaultView();
	handleShowUl();
	return;
}

$(main());
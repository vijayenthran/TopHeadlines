'use strict';

const Categories = ['business', 'gaming', 'health-and-medical', 'music', 'sport', 'technology'];
const Sources = ['espn', 'espn-cric-info', 'bbc-news', 'cnn', 'the-times-of-india', 'techcrunch', 'nbc-news', 'abc-news', 'al-jazeera-english', 'the-new-york-times', 'the-wall-street-journal', 'usa-today', 'crypto-coins-news', 'football-italia', 'four-four-two', 'hacker-news', 'msnbc', 'nhl-news', 'reuters', 'the-economist', 'polygon', 'national-geographic', 'mtv-news'];
const noDescriptionText = `Sorry, There is no Description For this News Article, Click on Thumbnail Image" in Thumbnail view, Or "Click to View From Source Button" in List View`;
const filterTopNewsNum = 100;
const _localStorage = window.localStorage;
const defaultSearch = 'trump';


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
    
    // handle if there are no search results
    function handleNoResults(){
    	$('.no_headlines').removeClass('remove-display');
    	return;
    }

    // handle the succes json
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

    // handle to display the results in list formate
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
    	$('.js_displayNewsList').append(element);
    }

	// handle to display the results in Thumbnail format
	function handleThumbnailDispaly(thumbnailObj) {
		let element = thumbnailObj.map(obj =>
			`
			<div class="thumbnailWrapper">
			<img src="${obj.urlToImage}" alt="${obj.title}" class= "thumbnails img_img" data-source="${obj.url}">
			<p class="img_description js_img_description">
			${obj.description}
			</p>
			</div>
			`
			);
		$('.js_displayNewsGrid').append(element);
		return;
	}

    // handle success of Ajax Call
    function handleSuccess(successObj, optionalParam) {
    	let output = handleLargeSuccessOutput(successObj, optionalParam);
    	handleThumbnailDispaly(output);
    	handleListDisplay(output);
    	return;
    }

    // handle Failure of Ajax Call
    function handleFailure(errObj) {
    	console.log('There was an error on the Ajax Call');
    	throw new Error('errObj');
    }

    // manipulate the endpoint based on user options.
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

    // Util function do do some clean up.
    function cleanUp() {
    	$('.js_displayNewsGrid').find('.thumbnailWrapper').remove();
    	$('.js_displayNewsList').find('.list_wrapper').remove();
    	$('.no_headlines').addClass('remove-display');
    	return;
    }

    // handle the ajax call
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

// handle the local storage, To save users option(Either the Thumbnail or List View)
let localStorage = (function(localStorage){
	function _changeCurrentView(val){
		if(!val){
			throw new Error('val not found');
		}else if(val === '1'){
			$('.js_displayNewsGrid').addClass('remove-display');
			$('.js_displayNewsList').removeClass('remove-display');
			$('.js_default_view').val(`List-View Click to change`);
			$('.js_view_Grid').addClass('remove-display');
			$('.js_view_List').addClass('remove-display');
			return;
		}else if(val === '2'){
			$('.js_displayNewsGrid').removeClass('remove-display');
			$('.js_displayNewsList').addClass('remove-display');
			$('.js_default_view').val(`Thumbnail-View Click to change`);
			$('.js_view_Grid').addClass('remove-display');
			$('.js_view_List').addClass('remove-display');
			return;
		}else if(val === '3'){
			$('.js_displayNewsGrid').addClass('remove-display');
			$('.js_displayNewsList').removeClass('remove-display');
			$('.js_view_Grid').removeClass('remove-display');
			$('.js_view_List').addClass('remove-display');
			$('.js_default_view').val('ChooseDefaultView');
			handleToggleView();
			return;
		}
	}

    // Set local storage
    function _setLocalStorage(localStorageVal){
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
    	$('.js_view_Grid').addClass('remove-display');
    	let getLocalStorageVal= _getLocalStorage('View');
    	_changeCurrentView(getLocalStorageVal);
    	return;
    }

    // get local storage val
    function _getLocalStorage(storageKey){
    	if(!storageKey){
    		throw new Error('storageKey not found');
    	}
    	return localStorage.getItem(storageKey);
    }
    
    // remove local storage val
    function _removeLocalStorage(localStorageVal){
    	if(!localStorageVal){
    		throw new Error('localStorageVal not found');
    	}
    	localStorage.removeItem('View');
    	return;
    }
    return{
    	changeCurrentView : _changeCurrentView,
    	setLocalStorage : _setLocalStorage,
    	getLocalStorage : _getLocalStorage,
    	removeLocalStorage : _removeLocalStorage
    }
})(_localStorage);

// handle, Selecting the default view user likes, through a form
function handleShowDefault(){
	$('.js_pop_up_form').submit(function(event){
		event.preventDefault();
		let selectedRadio = $('input[name="view"]:checked').val();
		if(selectedRadio === 'List' || selectedRadio === 'Thumbnail'){
			localStorage.setLocalStorage(selectedRadio);
		}
		else{
			let defaultToggleSwitch = '3';
			localStorage.removeLocalStorage(selectedRadio);
			localStorage.changeCurrentView(defaultToggleSwitch);
		}
		$('.js_outer_Overlay').addClass('remove-display')
	});
	return;
}

// Close the pop up after selecting the default view.
function closePopUp(){
	$('.js_close_popup').on('click', function(){
		$('.js_outer_Overlay').addClass('remove-display');
	});
	return;
}

// Choose the default view using the popup.
function chooseDefaultView(){
	$('.js_default_view').on('click', function(){
		$('.js_outer_Overlay').removeClass('remove-display');
	});
	closePopUp();
	handleShowDefault();
	return;
}

// Open the links of the original news in a new tab
function openLinkNewTab(){
	$('.js_displayNewsGrid').on('click', '.js_img_description', function(event){
		event.preventDefault();
		event.stopPropagation();
		let url = $(this).closest('.js_displayNewsGrid').find('.img_img').data('source');
		window.open(url, '_blank');
	});
}

// handle the toggle between the list and the Thumbnail View.
function handleToggleView() {
	if(!localStorage.getLocalStorage('View')) {
		$('.js-toggle-Display').on('click', '.js_view_Grid', function () {
			$('.js_displayNewsGrid').removeClass('remove-display');
			$('.js_displayNewsList').addClass('remove-display');
			$(this).addClass('remove-display');
			$(this).closest('.js-toggle-Display').find('.js_view_List').removeClass('remove-display');
		});
		$('.js-toggle-Display').on('click', '.js_view_List', function () {
			$('.js_displayNewsGrid').addClass('remove-display');
			$('.js_displayNewsList').removeClass('remove-display');
			$(this).addClass('remove-display');
			$(this).closest('.js-toggle-Display').find('.js_view_Grid').removeClass('remove-display');
		});
		return;
	}else{
		$('.js_view_Grid').addClass('remove-display');
		let getLocalStorageVal= localStorage.getLocalStorage('View');
		localStorage.changeCurrentView(getLocalStorageVal);
		return;
	}
}

// handle get news results through search
function getNewsBySearch() {
	$('.js-search-form').submit(function (event) {
		event.preventDefault();
		let inputVal = $('.js-search-form-text').val();
		let value = {
			type: 'Search Box',
			value: inputVal
		};
		headlines.sendConfig(value);
	});
	return;
}

// handle, get news results based on selecting category
function getNewsByCategories() {
	$('.js_categories_ul').on('click', '.js-search-Category-link', function (event) {
		event.preventDefault();
		let endPoint = $('.js_categories_ul').data('category');
		let inputValue = $(this).text();
		let categoryObj = {
			type: endPoint,
			value: inputValue
		};
		headlines.sendConfig(categoryObj);
	});
	return;
}

// handle, get news results from the drop down(when Menu changes to dropdown)
function getNewsFromDropDown() {
	$('.js-list-options').change(function (event) {
		let inputValue = $(".js-list-options option:selected").text();
		let endPoint = $(".js-list-options option:selected");
		let endPointdata;
		if (endPoint.closest('.js-group2-sources').data('sites') === 'sources') {
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

// hand;e get news by selecting the source.
function getNewsBySources() {
	$('.js_source_ul').on('click', '.js-search-sites-link', function (event) {
		event.preventDefault();
		let endPoint = $('.js_source_ul').data('sites');
		let inputValue = $(this).text();
		let sourceObj = {
			type: endPoint,
			value: inputValue
		};
		headlines.sendConfig(sourceObj);
	});
	return;
}

// handle generating the categories.
function generateCategories() {
	let counter = 0;
	let element = Categories.map(category => {
		counter = counter + 1;
		return `<li>
		<a href="#" name="Category-${counter}" class="search-Category-link js-search-Category-link">${category}</a>
		</li>`
	});
	let elementList = Categories.map(category => {
		return `<option class="group1-category-option">${category}</option>`
	});
	$('.js_categories_ul').append(element);
	$('.js-group1-category').append(elementList);
	counter = 0;
	return;
}

// handle generating the sources.
function generateSources() {
	let counter = 0;
	let element = Sources.map(source => {
		counter = counter + 1;
		return `<li>
		<a href="#" name="Source-${counter}" class="search-sites-link js-search-sites-link">${source}</a>
		</li>`
	});
	let elementList = Sources.map(source => {
		return `<option class="group2-sources-option">${source}</option>`
	});
	$('.js_source_ul').append(element);
	$('.js-group2-sources').append(elementList);
	counter = 0;
	return;
}

// View News by clicking the read news button.
function readNewsClick() {
	const defaultNewsObj= {
		type : 'default',
		value: defaultSearch
	}
	$('.js_read_news').on('click', function () {
		$(this).closest('.js_newspaperImage').slideUp('fast');
		$('.js-grid-section').removeClass('remove-display');
		headlines.sendConfig(defaultNewsObj);
	});
	return;
}

// handle, showing the categories and sources options in the menu
function handleShowUl(){
	$('.js_menu_categories_title').on('click', function(){
		$('.js_categories_ul').slideToggle('fast');
		$('.js_sign_categories').toggleClass('spin');
	});
	$('.js_menu_Sources_title').on('click', function(){
		$('.js_source_ul').slideToggle('fast');
		$('.js_sign_source').toggleClass('spin');
	});
	return;
}

// Main entry point
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
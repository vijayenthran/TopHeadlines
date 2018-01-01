'use strict';

const Categories = ['business', 'gaming', 'health-and-medical', 'music', 'sport', 'technology'];
const noDescriptionText = `Sorry, There is no Description For this News Article, Click on Thumbnail Image" in Thumbnail view, Or "Click to View From Source Button" in List View`;
const Sources = ['espn', 'espn-cric-info', 'bbc-news', 'cnn', 'the-times-of-india', 'techcrunch', 'nbc-news', 'abc-news', 'al-jazeera-english', 'the-new-york-times', 'the-wall-street-journal', 'usa-today', 'crypto-coins-news', 'football-italia', 'four-four-two', 'hacker-news', 'msnbc', 'nhl-news', 'reuters', 'the-economist', 'polygon', 'national-geographic', 'mtv-news'];
const filterTopNewsNum = 100;
const _localStorage = window.localStorage;
const defaultSearch = 'trump';
const loaderTime = 1200;
const apiKey = '93c6b412948740479094f9ace7c8aa27';
let handleStorage;
let localStorageHelp;
let sourceArrObj = [];

// check if browser window has local Storage enabled
if(_localStorage){
// handle Storage
  handleStorage = (function(_localStorage){
    function _Storage(localStorage = _localStorage){
      this.type = localStorage;
    }

    _Storage.prototype.set =function(key, val, type){
      if(!key && !val && !type){
        throw new Error('key or val or type is not defined');
      }
      if(type === 'num'){
        this.type.setItem(key, val);
        return;
      }
      if(type === 'obj'){
        this.type.setItem(key, JSON.stringify(val));
        return;
      }
      this.type.setItem(key, val);
      return;
    };

    // get is always returning an integer have to make sure, what is happening.
    _Storage.prototype.get =function(key, type){
      if(!key && !type){
        throw new Error('key and type is not defined in Storage get fn');
      }
      if(type === 'num'){
        return Number(this.type.getItem(key));
      }else if(type === 'obj'){
        return JSON.parse(this.type.getItem(key));
      }else{
        return this.type.getItem(key);
      }
    };

    _Storage.prototype.remove =function(key){
      if(!key){
        throw new Error('key is not defined in Storage remove fn');
      }
      this.type.removeItem(key);
      return;
    };

    return new _Storage();

  })(_localStorage);
}



// handle Source Sites
let sourceSites = (function(){
  const config = {
    url: 'https://newsapi.org/v2/sources',
    data: {
      apikey: apiKey
    },
    method: 'GET'
  };

  // sourceArrObj =[];
  function handleSuccessRes(success){
      success.sources.filter(source => {
        if(Sources.indexOf(source.id) >= 0){
      sourceArrObj.push({
         id : source.id,
         name: source.name
        });
      }
      });
    // check if browser window has local Storage enabled
      if(_localStorage){
        handleStorage.set('Source', sourceArrObj, 'obj');
        generateSources();
      }else{
        generateSources();
      }
    return;
  }

  function handleFailureRes(err){
    console.log('Err from Getting Source Sites Api');
    throw err;
  }


  let _getSource = function() {
    $.ajax(config).then(function(successres){
      handleSuccessRes(successres)
    }).catch(function(err){
      handleFailureRes(err)
    });
  };

  return {
    getSource : _getSource()
  }
})();


let headlines = (function () {
	const config = {
		url: 'https://newsapi.org/v2/top-headlines',
		data: {
			apikey: apiKey
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
      $('.js_loader').addClass('visiblity_hidden');
    	return;
    }

  // handle if there are no search results
  function handleErrorState(){
    $('.no_Output').removeClass('remove-display');
    $('.js_loader').addClass('visiblity_hidden');
    return;
  }

    // handle the succes json
    function handleLargeSuccessOutput(successOutput, optionalParam) {
    	if (optionalParam.data.category === 'sport') {
    		return removeBBCSportNews(successOutput);
    	}
    	let output = successOutput;
    	if(!output){
        handleErrorState();
        return;
      }
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
    		.filter((item, index) => (index <= filterTopNewsNum));
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
    		<img src="" alt="${obj.title}" class= "list_view_image listbackground" tabindex="0" data-srcimg="${obj.urlToImage}"/>
    		<p class="list_img_description">
    		<a target="_blank" href="${obj.url}" rel="noreferrer">
    		'${obj.description}'
    		</p>
    		</a>
    		</div>
    		`
    		);
    	$('.js_displayNewsList').append(element);
      handleLazyLoadList();
    }

	// handle to display the results in Thumbnail format
	function handleThumbnailDispaly(thumbnailObj) {
		let element = thumbnailObj.map(obj =>
			`
			<div class="thumbnailWrapper thumbnailbackground" tabindex="0" aria-label="${obj.title}">
			<img src="" alt="${obj.title}" class= "thumbnails img_img" data-source="${obj.url}" data-srcimg="${obj.urlToImage}">
			<p class="img_description js_img_description">
			${obj.description}
			</p>
			</div>
			`
			);
		$('.js_displayNewsGrid').append(element);
    handleLazyLoadThumbnail();
    return;
  }

  function handleLazyLoadThumbnail(){
    $('.thumbnails').each(function(){
      $(this).attr('src',  $(this).attr('data-srcimg'));
      $(this).on('load', function(){
       $('.js_displayNewsGrid').find('.thumbnailWrapper').removeClass('thumbnailbackground');
     });
    });

  }

  function handleLazyLoadList(){
    $('.js_displayNewsList').find('.list_view_image').each(function(){
      $(this).attr('src',  $(this).attr('data-srcimg'));
      $(this).on('load', function(){
        $('.js_displayNewsList').find('.list_view_image').removeClass('listbackground');
      });
    });

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
      $('.no_Output').addClass('remove-display');
      return;
    }

    function showLoader() {
      $('.js_loader').removeClass('visiblity_hidden');
      return;
    }

    function hideLoader() {
      $('.js_loader').addClass('visiblity_hidden');
      return;
    }

    // handle the ajax call
    let getHeadlines = function (manipulatedconfig) {
    	cleanUp();
    	return $.ajax(manipulatedconfig)
     .then(function(successres){
      showLoader();
      return successres;
    })
     .then(function (res) {
      handleSuccess(res, manipulatedconfig);
      return;
    })
     .then(function(){
       return new Promise(function(resolve){
         setTimeout(function(){
           resolve(hideLoader());
         }, loaderTime)
       });
     })
     .catch(function (err) {
       handleErrorState();
      handleFailure(err);
    })
   };
   return {
     sendConfig: manipulateConfig,
   }
 })();

// check if browser window has local Storage enabled
if(_localStorage) {
  // handle the local storage, To save users option(Either the Thumbnail or List View)
  localStorageHelp = (function () {
    function _changeCurrentView(val) {
      if (!val) {
        throw new Error('val not found');
      } else if (val === 1) {
        $('.js_displayNewsGrid').addClass('remove-display');
        $('.js_displayNewsList').removeClass('remove-display');
        $('.js_default_view').val(`List-View Click to change`);
        $('.js_view_Grid').addClass('remove-display');
        $('.js_view_List').addClass('remove-display');
        return;
      } else if (val === 2) {
        $('.js_displayNewsGrid').removeClass('remove-display');
        $('.js_displayNewsList').addClass('remove-display');
        $('.js_default_view').val(`Thumbnail-View Click to change`);
        $('.js_view_Grid').addClass('remove-display');
        $('.js_view_List').addClass('remove-display');
        return;
      } else if (val === 3) {
        $('.js_displayNewsGrid').addClass('remove-display');
        $('.js_displayNewsList').removeClass('remove-display');
        $('.js_view_Grid').removeClass('remove-display');
        $('.js_view_List').addClass('remove-display');
        $('.js_default_view').val('ChooseDefaultView');
        handleToggleView();
        return;
      }
    }

    function gettoggleValue(localStorageVal) {
      if (!localStorageVal) {
        throw new Error('Local Storage Val not Found in gettoggleValue fn');
      }
      let toggleSwitchVal;
      const storageType = {
        List: 1,
        Thumbnail: 2,
        Default: 3
      };
      toggleSwitchVal = storageType[localStorageVal];
      return toggleSwitchVal;
    }

    function _helpsetLocalStorage(storageKey, localStorageVal, type) {
      if (!localStorageVal) {
        throw new Error('localStorageVal not found');
      }
      let toggleSwitchVal = gettoggleValue(localStorageVal);
      handleStorage.set(storageKey, toggleSwitchVal, type);
      $('.js_view_Grid').addClass('remove-display');
      let getLocalStorageVal = handleStorage.get(storageKey, type);
      _changeCurrentView(getLocalStorageVal);
      return;
    }

    return {
      changeCurrentView: _changeCurrentView,
      helpSetLocalStorage: _helpsetLocalStorage
    }
  })();
}

// handle, Selecting the default view user likes, through a form
function handleShowDefault(){
	$('.js_pop_up_form').submit(function(event){
		event.preventDefault();
		let selectedRadio = $('input[name="view"]:checked').val();
		if(selectedRadio === 'List' || selectedRadio === 'Thumbnail'){
      localStorageHelp.helpSetLocalStorage('View', selectedRadio, 'num');
		}
		else{
			let defaultToggleSwitch = 3;
      handleStorage.remove('View');
      localStorageHelp.changeCurrentView(defaultToggleSwitch);
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
    window.open(url,'_blank','noopener')
  });
}

// handle the toggle between the list and the Thumbnail View.
function handleToggleView() {
  let helpertogg;
  if(_localStorage){
    helpertogg = !handleStorage.get('View' , 'num');
  }else{
    helpertogg = true;
  }
	if(helpertogg) {
		$('.js-toggle-Display').on('click', '.js_view_Grid', function () {
			$('.js_displayNewsGrid').removeClass('remove-display');
			$('.js_displayNewsList').addClass('remove-display');
			$(this).addClass('remove-display');
      $('.tool_tip_grid_text').addClass('remove-display');
      $('.tool_tip_list_text').removeClass('remove-display');
      $(this).closest('.js-toggle-Display').find('.js_view_List').removeClass('remove-display');
    });
		$('.js-toggle-Display').on('click', '.js_view_List', function () {
			$('.js_displayNewsGrid').addClass('remove-display');
			$('.js_displayNewsList').removeClass('remove-display');
			$(this).addClass('remove-display');
      $('.tool_tip_list_text').addClass('remove-display');
      $('.tool_tip_grid_text').removeClass('remove-display');
      $(this).closest('.js-toggle-Display').find('.js_view_Grid').removeClass('remove-display');
    });
		return;
	}else{
	  if(_localStorage){
      let getLocalStorageVal= handleStorage.get('View', 'num');
      $('.js_view_Grid').addClass('remove-display');
      localStorageHelp.changeCurrentView(getLocalStorageVal);
      return;
    }
    else{
	    return;
    }
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
    $('.js-search-form-text').val('');
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
		let inputValue;
		let endPoint = $(".js-list-options option:selected");
		let endPointdata;
		if (endPoint.closest('.js-group2-sources').data('sites') === 'sources') {
			endPointdata = 'sources';
        inputValue = $(".js-list-options option:selected").data('srcid');
		} else {
			endPointdata = 'category';
      inputValue = $(".js-list-options option:selected").text();
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
		let inputValue = $(this).data('srcid');
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
	let element;
	let elementList;
	if(_localStorage){
    if(handleStorage.get('Source', 'obj')) {
      element = handleStorage.get('Source', 'obj').map(source => {
        counter = counter + 1;
      return `<li>
		<a href="#" name="Source-${counter}" class="search-sites-link js-search-sites-link" data-srcid="${source.id}">${source.name}</a>
		</li>`
    });
      elementList =  handleStorage.get('Source', 'obj').map(source => {
        return `<option class="group2-sources-option" data-srcid="${source.id}">${source.name}</option>`
      });
    }else {
      return;
    }
  }else{
    element = sourceArrObj.map(source => {
      counter = counter + 1;
      return `<li>
		  <a href="#" name="Source-${counter}" class="search-sites-link js-search-sites-link" data-srcid="${source.id}">${source.name}</a>
		  </li>`
    });
    elementList = sourceArrObj.map(source => {
      return `<option class="group2-sources-option" data-srcid="${source.id}">${source.name}</option>`
    });
  }
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

// Check if local storage is available and execute the dependent functions or hide the feature.
function handlelocalStorageAvailability(){
  if(_localStorage){
    chooseDefaultView();
    return;
  }else{
    $('.js_default_view').addClass('remove-display');
    return;
  }

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
  handlelocalStorageAvailability();
	handleShowUl();
	return;
}

$(main());

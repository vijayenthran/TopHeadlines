'use strict';

const Categories = ['business', 'gaming', 'health-and-medical', 'music', 'sport', 'technology'];
const Sources = ['espn', 'espn-cric-info', 'bbc-news', 'cnn', 'the-times-of-india', 'techcrunch', 'nbc-news', 'abc-news', 'al-jazeera-english', 'the-new-york-times', 'the-wall-street-journal', 'usa-today'];
const noDescriptionText = `Sorry, There is no Description For this News Article, Click on Thumbnail Image" in Thumbnail view, Or "Click to View Source Button" in List View`;

let headlines = (function () {
    const config = {
        url: 'https://newsapi.org/v2/top-headlines',
        data: {
            apikey: '93c6b412948740479094f9ace7c8aa27'
            // format:"jsonp",
            // callback:"jsonp_callback"
        },
        method: 'GET'
        // dataType: "jsonp",
        // jsonpCallback: 'jsonp_callback',
        // contentType: 'application/json',
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
            .filter((item, index) => (index <= 40));
        return manipulatedOutput;
    }

    function handleLargeSuccessOutput(successOutput, optionalParam) {
        if (optionalParam.data.category === 'sport') {
            return removeBBCSportNews(successOutput);
        }
        let output = successOutput;
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

// the Hr in this can be replaced using border bottom of list wrapper, Hint
// You just have to give give margin bottom some value for the image class
// This created a space in the bottom.
    function handleListDisplay(thumbnailObj) {
        let element = thumbnailObj.map(obj =>
            `
		<div class="list_wrapper">
		<img src="${obj.urlToImage}" alt="${obj.title}" class= "list_view_image">
		<p class="list_img_description">
		${obj.description}
		</p>
		<a target="_blank" href="${obj.url}">
		<input type="button"  name="View_detail_news" value="CLick to View From Source" class="view_detail">
		</a>
		</div>
		`
        );
        $('.displayNewsList').append(element);
    }

    function handleThumbnailDispaly(thumbnailObj) {
        let element = thumbnailObj.map(obj =>
            // ` <p class="thubmnails-description" style="display:none">
            //			<a target="_blank" href="${obj.url}"><input type="button"  name="View_detail_news" value="Source-Site" class="view_detail"></a>

            `
			<div class="thumbnailWrapper">
			<img src="${obj.urlToImage}" alt="${obj.title}" class= "thumbnails img_img" width="320px" height="180px" data-source="${obj.url}">
			<p class="img_description">
			${obj.description}
			</p>
			</div>
			`
        );
        $('.displayNewsGrid').append(element);
    }

    function handleSuccess(successObj, optionalParam) {
        let output = handleLargeSuccessOutput(successObj, optionalParam);
        console.log(output);
        handleThumbnailDispaly(output);
        handleListDisplay(output);
        return;
    }

    function handleFailure(errObj) {
        console.log('There was an error on the Ajax Call');
        console.log(errObj);
        return;
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
        }
        getHeadlines(copyconfig);
        return;
    }

    function clearThumbnails() {
        $('.displayNewsGrid').find('.thumbnailWrapper').remove();
        $('.displayNewsList').find('.list_wrapper').remove();
        return;
    }

    let getHeadlines = function (manipulatedconfig) {
        clearThumbnails();
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

function openLinkNewTab(){
    $('.displayNewsGrid').on('click', '.img_description', function(event){
        event.preventDefault();
        event.stopPropagation();
        let url = $(this).closest('.displayNewsGrid').find('.img_img').data('source');
        console.log('I am url' + url);
        window.open(url, '_blank');
    });
}


function handleToggleView() {
    $('.toggle-Display').on('click', '.view_Grid', function (event) {
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
}

function getNewsBySearch() {
    $('.search-form').submit(function (event) {
        console.log('I am being called');
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
    $('.search-Category-ul').on('click', '.search-Category-link', function (event) {
        event.preventDefault();
        let endPoint = $('.search-Category').data('category');
        let inputValue = $(this).text();
        let categoryObj = {
            type: endPoint,
            value: inputValue
        }
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
        }
        headlines.sendConfig(endpointObj);
    });
    return;
}

function getNewsBySources() {
    $('.search-sites-ul').on('click', '.search-sites-link', function (event) {
        event.preventDefault();
        let endPoint = $('.search-sites').data('sites');
        let inputValue = $(this).text();
        let sourceObj = {
            type: endPoint,
            value: inputValue
        }
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
    $('.search-Category-ul').append(element);
    $('.group1-category').append(elementList);
    counter = 0;
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
    $('.search-sites-ul').append(element);
    $('.group2-sources').append(elementList);
    counter = 0;
}

function readNewsClick() {
    $('.read-news').on('click', function () {
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
    handleToggleView();
    openLinkNewTab();
    return;
}

$(main());
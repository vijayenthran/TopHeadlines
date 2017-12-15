function callMusicMatchApi(){
	const config = {
		url: 'http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=84231430',
		data : {
			apikey : 'c83752d2d017b1f4da9617679a093839'
		},
		method: 'GET'
		// dataType: 'jsonp',
	};
	let ajaxCall = function() {
		$.ajax(config).then(function(res){
			console.log('I am the success');
			console.log(res);
		}).catch(function(err){
			console.log('I am the error');
			console.log(err);
		})
	};
	ajaxCall();
}

$(callMusicMatchApi());
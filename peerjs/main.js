$(function(){
	try{
		var peer = new Peer({key: 'lwjd5qra8257b9'});
		peer.on('open', function(id) {
		  $('.JSpeerid').html(id);
		});
	} catch (e){
		$('.JSpeerid').html('loading error');
	}
});
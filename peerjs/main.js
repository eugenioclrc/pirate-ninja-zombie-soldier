/* global $ */
/* global Peer */
/* global console */

'use strict';
var peer;
$(function () {
	try{
		peer=new Peer({host: 'localhost', port: 9000, path: '/'});
		// = new Peer({debug: true});
		peer.on('open', function(id) {
		  $('.JSpeerid').html(id);
		});

		peer.on('connection', function(conn) {
			conn.on('data', function(data) {
				console.log('Received', data);
			});
		});
	} catch (e) {
		$('.JSpeerid').html('loading error');
	}


	$('.JSconnectButton').click(function(){
		var conn = peer.connect($('.JSpeerid').html());
		conn.on('open', function() {
			// Receive messages
			conn.on('data', function(data) {
				console.log('Received', data);
			});

			// Send messages
			conn.send('Hello!');
		});
	});
	
});
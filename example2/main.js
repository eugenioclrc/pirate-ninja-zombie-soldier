var iceServers = {
    iceServers: [{
        url: 'stun:stun.l.google.com:19302'
    }]
};

var optionalRtpDataChannels = {
    optional: [{
        RtpDataChannels: true
    }]
};

var offerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels),
    answerer, answererDataChannel, channel;

var offererDataChannel = offerer.createDataChannel('RTCDataChannel', {
    reliable: false
});


var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, // Hmm!!
        OfferToReceiveVideo: false // Hmm!!
    }
};

var iceCandidate=null;


function createAnswer(offerSDP) {
    answerer = new webkitRTCPeerConnection(iceServers, optionalRtpDataChannels);
    answererDataChannel = answerer.createDataChannel('RTCDataChannel', {
        reliable: false
    });

    setChannelEvents(answererDataChannel, 'answerer');

    answerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        offerer && offerer.addIceCandidate(event.candidate);
        
    };

    answerer.setRemoteDescription(offerSDP);
    answerer.createAnswer(function (sessionDescription) {
        answerer.setLocalDescription(sessionDescription);
        offerer.setRemoteDescription(sessionDescription);
    }, null, mediaConstraints);
}

function setChannelEvents(_channel, channelNameForConsoleOutput) {
    channel=_channel;
    _channel.onmessage = function (event) {
        console.debug(channelNameForConsoleOutput, 'received a message:', event.data);
    };

    _channel.onopen = function () {
        channel.send('first text message over RTP data ports');
    };
    _channel.onclose = function (e) {
        console.error(e);
    };
    _channel.onerror = function (e) {
        console.error(e);
    };
}

function init(){
    setChannelEvents(offererDataChannel, 'offerer');

    offerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
    };

    offerer.createOffer(function (sessionDescription) {
        $('.JSsd').val(JSON.stringify(sessionDescription).replace(/\\/g,"\\\\"));
        offerer.setLocalDescription(sessionDescription);
        createAnswer(new RTCSessionDescription(JSON.parse(JSON.stringify(sessionDescription))));
        //createAnswer(sessionDescription);
    }, null, mediaConstraints);
};

$(document).ready(function(){
    init();

    $('.JSconnectButton').click(function(){
        try{   
            debugger;
            createAnswer(new RTCSessionDescription(JSON.parse($('.JSsdConnection').val())));
            
        }catch(e){}
    });
});

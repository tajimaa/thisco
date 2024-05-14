var rtcConfString = "video audio";

// streaming both video and audio
var rtcConfJson = {
    audio : true,
    video : true
};

var _ = {};

$.peerConn = _;

var serverIp = '172.19.7.203';
var serverPort = '8080';
var serverAddress = 'ws://'+serverIp+':'+serverPort+'/ThisCord/PeerCommunicationServer';
var stunServerAddress = 'server.stun.address=stun:stun.l.google.com:19302';

// holds all the peers which are connected to this room on the client
var peerConnections = new Array();

// roomId is the unique room id i gave each room to support multiple rooms
var socket = new WebSocket(serverAddress + "/" + roomId);

socket.onmessage = onPeerMessageRecieved;
 _.closeConnection = function() {
    socket.onclose = function () {}; // disable onclose handler first
    socket.close();
};

var localStream = null;

var peerAddedCallback = null;

var peerDisconnectedCallback = null;

var mediaConstraints = {'mandatory': {'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true}};

// save all the peers which are connected to this user and shares their video
var peerConnections = new Array(); 
 
navigator.getMedia = ( navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia);

// starts the webcam
_.startWebCam = function(successWebCamCallback) {
    try {
        navigator.getMedia(rtcConfJson, successCallback, errorCallback);
    } catch (e) {
       navigator.getMedia(rtcConfString, successCallback, errorCallback);
    }
}

function successCallback(stream) {
    localStream = stream;
    successWebCamCallback(stream);
}

function errorCallback(error) {
    console.log("Error starting webcam");
    // redirect somewhere
    window.location.href = "/";
}

// start the connection of peer
_.connectPeer = function(configuration) {
    if (localStream) {
        // set all needed callbacks
        peerAddedCallback = configuration.peerAddedCallback;
        peerDisconnectedCallback = configuration.peerDisconnectedCallback;
        // when peer is viewer keep local stream null
       if (configuration.isPeerViewer) {
            localStream = null;
        }
        // make the call to all peers when socket is ready
        if (socket.readyState == 0) {
            socket.onopen = function (evt) {
                socket.onopen = null;
                doCall(); 
            };
        }
        else {
            doCall(); 
       }
    } else {
        alert("Cammera is not active");
    }
};

// create the peer connection object
function createPeerConnection(registerEvent) {
    var pc = null;
    try {
        // creating peer connection
        pc = new webkitRTCPeerConnection({ iceServers: [ {url:stunServerAddress} ] });
 
    if(registerEvent) {
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onRemoteStreamAdded;
    }
    } catch (e) {
        _.logg("Failed to create PeerConnection, exception: " + e.message);
    }
    return pc;
}

// when PeerConn is created, send setup data to peer via WebSocket
function onIceCandidate(event) {
    _.logg("Sending setup signal");
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate});
    } else {
           console.log("End of candidates.");
   }
}

// when remote adds a stream, hand it on to the local video element
function onRemoteStreamAdded(event) {
    _.logg("stream added " );
    peerAddedCallback(event.srcElement.uniqueId, event.stream);
}

// initate the call
function doCall() {
    _.logg("Send offer to peer");
    var pc = createPeerConnection(false);
    if (localStream){
        pc.addStream(localStream);
    }
    pc.createOffer(sendOfferMessage, null, mediaConstraints);
}
 
function sendOfferMessage(sessionDescription) {
    currentOffer = sessionDescription;
    sessionDescription.uniqueId = _.uniqueId;
    sessionDescription.broadcast = "All";
    sendMessage(sessionDescription);
}

// send message to server
function sendMessage(msg) {
    socket.send(JSON.stringify(msg)); 
}

// when a message recieved from server
function onPeerMessageRecieved(evt) {
    var msg = JSON.parse(evt.data);
    _.logg("RECIEVED MSG: " + msg.type);
    // if someone wants to join the room
    if (msg.type === 'offer') {
        var pc = createPeerConnection(true);
        pc.uniqueId = msg.uniqueId;
        peerConnections[msg.uniqueId] = pc;
        if (localStream){
            pc.addStream(localStream); 
        }
        pc.setRemoteDescription(new RTCSessionDescription(msg));
        doAnswer(pc, msg.uniqueId);
    } 
    else if (msg.type === 'answer') {
        var pc = createPeerConnection(true);
        pc.uniqueId = msg.uniqueId;
        peerConnections[msg.uniqueId] = pc;
        if (localStream) {
            pc.addStream(localStream); 
        }
        pc.setLocalDescription(currentOffer);
        pc.setRemoteDescription(new RTCSessionDescription(msg));
    } 
    else if (msg.type === 'candidate') {
      var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label, candidate:msg.candidate});
      var pc = peerConnections[msg.uniqueId];
      pc.addIceCandidate(candidate);
    } 
    else if (msg.type === 'bye') {
        disconnectPeer(msg.uniqueId);
    }
}

// initate the answer
function doAnswer(pc, sendTo) {
    console.log("Send answer to peer");
    pc.createAnswer(setLocalAndSendAnswerMessage, null, mediaConstraints);
 
    function setLocalAndSendAnswerMessage(sessionDescription) {
        var pc = peerConnections[sendTo];
        pc.setLocalDescription(sessionDescription);
        sessionDescription.uniqueId = _.uniqueId;
        sessionDescription.broadcast = sendTo;
        sendMessage(sessionDescription);
    }
}

// disconnect peer
function disconnectPeer(pcId) {
    _.logg("Hang up " + pcId);
    delete peerConnections[pcId];
    peerDisconnectedCallback(pcId);
}
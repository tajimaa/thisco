

let localVideo = document.getElementById('local_video');
let localStream = null;
let roomname = null;

let peerConnections = [];
let remoteVideos = [];
const MAX_CONNECTION_COUNT = 10;


//WebRTCで通信をするためのシグナリングをするWebSocket
const WSip = constIp;
const WSport = constPort;
let websocket = null;

// リモートのビデオを表示するコンテナ（HTML）
let container = document.getElementById('video-play-field');

// --- WebRTCを使うためのプリフィックス -----
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia || navigator.msGetUserMedia;
RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

function webSocketManager() {
	websocket = new WebSocket(`ws://${WSip}:${WSport}/ThisCord/signaling_room/${roomname}`);
	websocket.onopen = (event) => {
		console.log("WebSocket connection opened:", event);
	};

	//WebSocketのサーバーからのブロードキャスト
	websocket.onmessage = (event) => {
		let message = JSON.parse(event.data);
		let fromId = message.from;
		console.log('message:', message);

		if (message.type === 'offer') {
			// -- オファーを受けっとった ---
			console.log('オファーを受けっとった');
			let offer = new RTCSessionDescription(message);
			setOffer(fromId, offer);
		}
		else if (message.type === 'answer') {
			// --- アンサーを受け取った---
			console.log('アンサーを受け取った');
			let answer = new RTCSessionDescription(message);
			setAnswer(fromId, answer);
		}
		else if (message.type === 'candidate') {
			// --- ICDをうけとった ---
			console.log('ICDをうけとったよ');
			let candidate = new RTCIceCandidate(message.ice);
			console.log(candidate);
			addIceCandidate(fromId, candidate);
		}
		else if (message.type === 'call me') {
			if (!isReadyToConnect()) {
				console.log('メディアなどの準備ができてない');
				return;
			}
			else if (!canConnectMore()) {
				console.warn('満席');
			}

			if (isConnectedWith(fromId)) {
				console.log('すでにつながってる');
			}
			else {
				makeOffer(fromId);
			}
		}
		else if (message.type === 'bye') {
			if (isConnectedWith(fromId)) {
				stopConnection(fromId);
			}
		}
	};

	websocket.onclose = (event) => {
		console.log("WebSocket切断", event);
	};
}


//同じチャンネルにいる人に送る
function emitRoom(msg) {
	let message = JSON.stringify(msg);
	websocket.send(message);

}

//特定の人に送る
function emitTo(id, msg) {
	msg.sendto = id;
	let message = JSON.stringify(msg);
	websocket.send(message);
}


// room名を取得
function getRoomName() { // URLでルームを指定する?roomname
	let url = document.location.href;
	let args = url.split('?');
	if (args.length > 1) {
		let room = args[1];
		if (room != '') {
			return room;
		}
	}
	return '_testroom';
}

//すでにWebRTCのコネクションがあるかどうか
function isReadyToConnect() {
	if (localStream) {
		return true;
	}
	else {
		return false;
	}
}

//----------------------- RTCPeerConnections[]に対しての操作関数たち----------------------- 
function getConnectionCount() {
	return peerConnections.length;
}

function canConnectMore() {
	//return (getConnectionCount() < MAX_CONNECTION_COUNT);
	return true;
}

function isConnectedWith(id) {
	console.log("isConnectedWith :" + id);
	if (peerConnections[id]) {
		return true;
	}
	else {
		return false;
	}
}

function addConnection(id, peer) {
	peerConnections[id] = peer;
}

function getConnection(id) {
	let peer = peerConnections[id];
	return peer;
}

function deleteConnection(id) {
	delete peerConnections[id];
}

function stopConnection(id) {
	detachVideo(id);

	if (isConnectedWith(id)) {
		let peer = getConnection(id);
		peer.close();
		deleteConnection(id);
	}
}

function stopAllConnection() {
	for (let id in peerConnections) {
		stopConnection(id);
	}
}


// ---------------------- メディアハンドリングの関数たち ----------------------- 

function startVideo() {
	getDeviceStream({ video: true, audio: true })
		.then(function(stream) {
			localStream = stream;
			playVideo(localVideo, stream);
		}).catch(function(error) {
			console.error('getUserMedia error:', error);
			return;
		});
}

// ローカルのビデオを止める
function stopVideo() {
	pauseVideo(localVideo);
	stopLocalStream(localStream);
	localStream = null;
}

function stopLocalStream(stream) {
	let tracks = stream.getTracks();
	if (!tracks) {
		console.warn('NO tracks');
		return;
	}

	for (let track of tracks) {
		track.stop();
	}
}

function getDeviceStream(option) {
	if ('getUserMedia' in navigator.mediaDevices) {
		console.log('navigator.mediaDevices.getUserMadia');
		return navigator.mediaDevices.getUserMedia(option);
	}
	else {
		console.log('wrap navigator.getUserMadia with Promise');
		return new Promise(function(resolve, reject) {
			navigator.getUserMedia(option,
				resolve,
				reject
			);
		});
	}
}

//カメラの動画を再生する
function playVideo(element, stream) {
	if ('srcObject' in element) {
		element.srcObject = stream;
	}
	else {
		element.src = window.URL.createObjectURL(stream);
	}
	element.play();
	element.volume = 0;
}

//動画を止める（相手が切断したときなど）
function pauseVideo(element) {
	element.pause();
	if ('srcObject' in element) {
		element.srcObject = null;
	}
	else {
		if (element.src && (element.src !== '')) {
			window.URL.revokeObjectURL(element.src);
		}
		element.src = '';
	}
}


//---ビデオのelementsに対しての関数たち---
function attachVideo(id, stream) {
	let video = addRemoteVideoElement(id);
	playVideo(video, stream);
	video.volume = 1.0;
}

function detachVideo(id) {
	let video = getRemoteVideoElement(id);
	pauseVideo(video);
	deleteRemoteVideoElement(id);
}

function isRemoteVideoAttached(id) {
	if (remoteVideos[id]) {
		return true;
	}
	else {
		return false;
	}
}

function addRemoteVideoElement(id) {
	let video = createVideoElement('remote_video_' + id);
	remoteVideos[id] = video;
	return video;
}

function getRemoteVideoElement(id) {
	let video = remoteVideos[id];
	return video;
}

function deleteRemoteVideoElement(id) {
	removeVideoElement('remote_video_' + id);
	delete remoteVideos[id];
}

function createVideoElement(elementId) {
	let video_element = document.querySelectorAll('.video-element');
    let video = document.createElement('video');
    video.width = '584';
    video.height = '321.500';
    video.id = elementId;

    video.classList.add('video-element');
    video.autoplay = true;
    container.appendChild(video);
    return video;
}



function removeVideoElement(elementId) {
	let video = document.getElementById(elementId);

	container.removeChild(video);
	return video;
}

// ---------------------- コネクションハンドリング -----------------------
function prepareNewConnection(id) {
	let pc_config = { "iceServers": [] };
	let peer = new RTCPeerConnection(pc_config);

	//リモートのストリーム
	if ('ontrack' in peer) {
		peer.ontrack = function(event) {
			let stream = event.streams[0];
			console.log('-- peer.ontrack() stream.id=' + stream.id);
			if (isRemoteVideoAttached(id)) {
				console.log('stream already attached, so ignore');
			}
			else {
				attachVideo(id, stream);
			}
		};
	}
	else {
		peer.onaddstream = function(event) {
			let stream = event.stream;
			console.log('-- peer.onaddstream() stream.id=' + stream.id);
			attachVideo(id, stream);
		};
	}

	// ローカルのICE
	peer.onicecandidate = function(evt) {
		if (evt.candidate) {
			console.log(evt.candidate);

			sendIceCandidate(id, evt.candidate);

		} else {
			console.log('empty ice event');

		}
	};

	peer.onnegotiationneeded = function(evt) {
		console.log('-- onnegotiationneeded() ---');
	};

	peer.onicecandidateerror = function(evt) {
		console.error('ICE candidate ERROR:', evt);
	};

	peer.onsignalingstatechange = function() {
		console.log('== signaling status=' + peer.signalingState);
	};

	peer.oniceconnectionstatechange = function() {
		console.log('== ice connection status=' + peer.iceConnectionState);
		if (peer.iceConnectionState === 'disconnected') {
			console.log('-- disconnected --');
			stopConnection(id);
		}
	};

	peer.onremovestream = function(event) {
		console.log('-- peer.onremovestream()');
		deleteRemoteStream(id);
		detachVideo(id);
	};


	//ローカルストリームの追加
	if (localStream) {
		console.log('Adding local stream...');
		peer.addStream(localStream);
	}
	else {
		console.warn('no local stream, but continue.');
	}

	return peer;
}

//見つかったICEをおくる
function sendIceCandidate(id, candidate) {
	console.log('---sending ICE candidate ---');
	let obj = { type: 'candidate', ice: candidate };

	if (isConnectedWith(id)) {
		emitTo(id, obj);
	}
	else {
		console.warn('connection NOT EXIST or ALREADY CLOSED. so skip candidate')
	}
}

//SDPをおくる
function sendSdp(id, sessionDescription) {
	console.log('---sending sdp ---');

	let message = { type: sessionDescription.type, sdp: sessionDescription.sdp };
	console.log('sending SDP=' + message);
	emitTo(id, message);
}

function makeOffer(id) {
	let peerConnection = prepareNewConnection(id);
	addConnection(id, peerConnection);

	peerConnection.createOffer()
		.then(function(sessionDescription) {
			console.log('createOffer() succsess in promise');
			return peerConnection.setLocalDescription(sessionDescription);
		}).then(function() {
			console.log('setLocalDescription() succsess in promise');

			sendSdp(id, peerConnection.localDescription);

		}).catch(function(err) {
			console.error(err);
		});
}

function setOffer(id, sessionDescription) {

	let peerConnection = prepareNewConnection(id);
	addConnection(id, peerConnection);

	peerConnection.setRemoteDescription(sessionDescription)
		.then(function() {
			console.log('setRemoteDescription(offer) succsess in promise');
			makeAnswer(id);
		}).catch(function(err) {
			console.error('setRemoteDescription(offer) ERROR: ', err);
		});
}

function makeAnswer(id) {
	console.log('sending Answer. Creating remote session description...');
	let peerConnection = getConnection(id);
	if (!peerConnection) {
		console.error('peerConnection NOT exist!');
		return;
	}

	peerConnection.createAnswer()
		.then(function(sessionDescription) {
			console.log('createAnswer() succsess in promise');
			return peerConnection.setLocalDescription(sessionDescription);
		}).then(function() {
			console.log('setLocalDescription() succsess in promise');

			// -- Trickle ICE の場合は、初期SDPを相手に送る -- 
			sendSdp(id, peerConnection.localDescription);

			// -- Vanilla ICE の場合には、まだSDPは送らない --
		}).catch(function(err) {
			console.error(err);
		});
}

function setAnswer(id, sessionDescription) {
	let peerConnection = getConnection(id);
	if (!peerConnection) {
		console.error('peerConnection NOT exist!');
		return;
	}

	peerConnection.setRemoteDescription(sessionDescription)
		.then(function() {
			console.log('setRemoteDescription(answer) succsess in promise');
		}).catch(function(err) {
			console.error('setRemoteDescription(answer) ERROR: ', err);
		});
}

// --- tricke ICE（ICEの送信の仕方）を使う場合の関数
function addIceCandidate(id, candidate) {
	if (!isConnectedWith(id)) {
		console.warn('NOT CONNEDTED or ALREADY CLOSED with id=' + id + ', so ignore candidate');
		return;
	}

	let peerConnection = getConnection(id);
	if (peerConnection) {
		peerConnection.addIceCandidate(candidate);
	}
	else {
		console.error('PeerConnection not exist!');
		return;
	}
}
//ここが一番最初
function connect(roomId){
	roomname = roomId;
	webSocketManager();
	startVideo();
	setTimeout(() => {
		if (!isReadyToConnect()) {
			console.warn('NOT READY to connect');
		}
		else if (!canConnectMore()) {
			console.log('TOO MANY connections');
		}
		else {
			callMe();
		}
	}, 2000);
}

function hangUp() {
	emitRoom({ type: 'bye' });
	stopAllConnection();
}

function callMe() {
	emitRoom({ type: 'call me' });
}


window.multi = {};
window.multi.hangUp = hangUp;
window.multi.connect = connect;
window.multi.stopVideo = stopVideo;


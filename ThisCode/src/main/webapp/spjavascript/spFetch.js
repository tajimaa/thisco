/**
 * すまほよう
 */
let defaultSrc = 'default';

let nowRoomId = null;
let oldRoomId = null;
let nowRoomHostId = null;
let rooms = null;
let roomsMap = null;
let nowChannelId = null;
let channelsMap = null;
let voiceChannelsMap = null;
let chatDiv = null;
let chatSocket = null;
let noticeSocket = null;
let username = null;
let userid = null;
let userinfo = null;
let user_icon = null;
let friendCount = 0;
let friendIcons = [];
let roomIds = [];

const ip = constIp;
const port = constPort;

document.addEventListener("DOMContentLoaded", init);
function disableScroll(event) {
	event.preventDefault();
}
async function init() {
	await getUserInfo();

	const firstServer = roomsMap.entries().next().value;
	let firstServerId = null;

	if (firstServer != null) {
		firstServerId = firstServer[0];
		registerNotice();
		await joinRoom(firstServerId);
	} else {
		registerNotice();
	}
	setSwipe(".chat-scroll");
	initform();
	await getFriend('invFriendList');
	initMyPage();

}

//スワイプイベントの設定
function setSwipe(elem) {
	let t = document.querySelector(elem);
	let startX;
	let startY;
	let moveX;
	let moveY;
	let dist = 50;
	let oldX = 0;
	let oldY = 0;

	t.addEventListener("touchstart", function (e) {
		e.preventDefault();
		oldX = startX = e.touches[0].pageX;
		oldY = startY = e.touches[0].pageY;
	});

	t.addEventListener("touchmove", function (e) {

		moveX = e.changedTouches[0].pageX;
		moveY = e.changedTouches[0].pageY;

		var chatScrollElement = document.getElementById("chat-scroll");
		let sum = chatScrollElement.scrollTop + (oldY - moveY);
		if (sum < 0) {
			chatScrollElement.scrollTop = 0;
		} else if (sum > chatScrollElement.scrollHeight - chatScrollElement.clientHeight) {
			chatScrollElement.scrollTop = chatScrollElement.scrollHeight - chatScrollElement.clientHeight;
		} else {
			chatScrollElement.scrollTop = sum;
		}

		oldX = moveX;
		oldY = moveY;
	});

	t.addEventListener("touchend", function (e) {
		let footer = document.getElementById("footer");
		if (startX > moveX && startX > moveX + dist) {
			document.querySelector(".chatField").classList.add("active");
			footer.classList.remove("open-footer");
		}
		if (startX < moveX && startX + dist < moveX) {
			document.querySelector(".chatField").classList.remove("active");
			footer.classList.add("open-footer");
		}
	});
}

function toggleFooter() {
	let footer = document.getElementById("footer");
	if (footer.classList.contains("notActive")) {
		footer.classList.remove("open-footer");
	} else {
		footer.classList.add("open-footer");
	}
}

function toggleActive(elementId) {
	let element = document.getElementById(elementId);
	element.classList.toggle("active");
}

function toggleChatField() {
	document.querySelector(".chatField").classList.toggle("active");
	document.getElementById("footer").classList.toggle('open-footer');
}

//フレンド追加モーダルにフレンドリストを表示する関数
async function getFriend(element) {
	const elm = document.getElementById(element);

	try {
		const response = await fetch('/ThisCord/fn/getfriendList?userId=' + userid);
		if (response.ok) {
			const json = await response.json();

			elm.innerHTML = "";
			friendCount = 0;
			for (let friend of json.friendList) {
				friendCount++;
				friendIcons.push(friend.user_icon);
				elm.innerHTML +=
					`<div class="fland-box">
					  <div class="inv-friend-button">
					    <div class="icon-name-wrapper">
						<div style="display: flex; align-items: center;">
					      <img class="fland_icon_img" src="/ThisCord/resource/user_icons/${friend.user_icon}" />
					      
					        <p style="margin-left:10px; color: #fff; font-weight: 700; font-size: 16px;">${friend.user_name}</p>
					      
						</div>
						  <button class="invButton" value="招待" onclick="invFriendForm(${friend.user_id})">
							<p>招待</p>
						</button>
					    </div>
					  </div>
					</div>`;
			}

		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}

async function setFriendListToSinglePage(element) {
	const elm = document.getElementById(element);

	try {
		const response = await fetch('/ThisCord/fn/getfriendList?userId=' + userid);
		if (response.ok) {
			const json = await response.json();

			elm.innerHTML = "";
			for (let friend of json.friendList) {
				elm.innerHTML +=
					`<a class="friendListItem" href="javascript:joinPersonalChat(${friend.user_id},'${friend.user_name}')" onclick="toggleChatField();">
						<img class="singleChatIconImage" src="/ThisCord/resource/user_icons/${friend.user_icon}"  />
						<div style=" padding:4px 0px 4px 8px; text-decoration: none;">
							<p id="single-user-name">${friend.user_name}</p>
							<p id="single-user-id">${friend.user_name}-${friend.user_id}</p>
						</div>
					</a>`;

			}

		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}
// クエリ文字列からidパラメータの値を取得する関数
var queryString = window.location.search;

function getIdFromQueryString(name) {
	var urlParams = new URLSearchParams(queryString);
	return urlParams.get(name);
}

async function getUserInfo() {
	try {
		const response = await fetch("/ThisCord/fn/getuserinfo?id=" + getIdFromQueryString('id'));

		if (response.ok) {

			userinfo = await response.json();
			username = userinfo.user_name;
			userid = userinfo.user_id;
			user_icon = userinfo.user_icon;
			rooms = userinfo.servers;
			roomsMap = new Map(Object.entries(rooms));
			createRoomB(roomsMap);
		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
		location.href = "/ThisCord/login.html";
	}
}

async function createRoomB(roomInfo) {
	const roomListDiv = document.getElementById("room-list");
	roomListDiv.innerHTML = "";
	for (const [roomId, roomName] of roomInfo) {
		const src = roomName[1];
		if (src === defaultSrc) {
			roomListDiv.innerHTML += '<div class="server-list-item noSwipe"><a class="server-icon" id="server-id-' + roomId + '" onclick=" joinRoom(\'' + roomId + '\');"  ><div class="server-name">' + roomName[0] + '</div></a></div>';
		} else {
			roomListDiv.innerHTML += '<div class="server-list-item noSwipe"><a class="server-icon" id="server-id-' + roomId + '" onclick=" joinRoom(\'' + roomId + '\');"  ><img id="retryImage" src="/ThisCord/' + src + '" onerror="retryImageLoad(this, 10, 1000)"></img></a></div>';
		}

	}
}

function createChannelButton(channelInfo) {
	const channelsListDiv = document.getElementById("channels-list");
	channelsListDiv.innerHTML = "";

	for (const [channel_id, channel_name] of channelInfo) {
		channelsListDiv.innerHTML +=
			'<div class="text-channels noSwipe" id="channel-id-' + channel_id + '">' +
			'<a class="textIcon" href="javascript:joinChannel(\'' + channel_id + '\')">' +
			'<i class="fa-solid fa-hashtag fa-sm mx-r-5" style="margin-right: 5px;"></i>' +
			channel_name +
			'</a>' +
			'</div>';
	}
}


//サーバーに参加する関数
async function joinRoom(roomId) {
	if (chatSocket) {
		chatSocket.close();
	}
	fieldClear();

	nowRoomId = roomId;
	await getServerInfo(nowRoomId);

	const infoDiv = document.querySelector("#server");
	infoDiv.innerHTML = roomsMap.get(roomId)[0];
	createChannelButton(channelsMap);
	setChannelList(channelsMap, voiceChannelsMap);
	createVoiceChannelButton(voiceChannelsMap);
	const firstTextChannel = channelsMap.entries().next().value;
	const firstTextChannelId = firstTextChannel[0];

	let voiceIds = [];
	for (const [channel_id, channel_name] of voiceChannelsMap) {
		voiceIds.push(channel_id);
	}

	let json =
	{
		type: 'joinServer',
		serverId: roomId,
		user: username,
		icon: user_icon,
		channels: voiceIds
	};
	noticeSocket.send(JSON.stringify(json));
	joinChannel(firstTextChannelId);
	toggleHome();
	initform();
}

function joinChannel(channel_id) {
	if (chatSocket) {
		chatSocket.close();
	}
	if (nowRoomId != -1) {
		const infoDiv = document.querySelector("#channel");
		infoDiv.innerHTML = channelsMap.get(channel_id);
	}


	nowChannelId = channel_id;
	chatSocket = new WebSocket(`ws://${ip}:${port}/ThisCord/chat/${nowRoomId}/${nowChannelId}/${userinfo.user_id}`);
	console.log(`ws://${ip}:${port}/ThisCord/chat/${nowRoomId}/${nowChannelId}/${userinfo.user_id}`);
	chatSocket.onopen = event => {
		console.log("接続開始");
		getMessageInfo(channel_id);
	};

	let convertedText = null;
	chatSocket.onmessage = event => {
		const chat = document.getElementById("message-container");
		console.log(event.data);
		const rep = JSON.parse(event.data);

		convertedText = rep.message.replace(/\n/g, "<br>");
		console.log(rep);
		showOnMessage(rep, chat);
		scrollEnd(500);


	};

	chatSocket.onclose = event => {
		console.log("切断");
	};
	const currentElemnt = document.querySelector('#channel-id-' + channel_id);
	window.globalFunction.toggleChannelState(currentElemnt);
}

function showOnMessage(rep, chat) {
	convertedText = rep.message.replace(/\n/g, "<br>");

	let sendDate = rep.date.split(' ');
	let sendHour = sendDate[1].split(':')[0];
	let sendMinute = sendDate[1].split(':')[1];
	console.log(sendMinute);
	if (oldDate != sendDate[0]) {
		chat.innerHTML += `
			<div class="message-date-section-wrapper">
				<div class="message-date-section"></div>
				<div class="message-date">${sendDate[0]}</div>
				<div class="message-date-section"></div>
			</div>
		`;
	}

	if (oldUserId == rep.userid && oldDate == sendDate[0] && oldMinute == sendMinute && oldHour == sendHour) {
		chat.innerHTML +=
			'<div class="message-wrapper">' +
			'<p class="message-text">' + convertedText + '</p>' +
			'</div>';
		oldUserId = rep.userid;
	} else {

		chat.innerHTML +=
			'<div class="message-wrapper">' +
			'<div>' +
			'<img class=" chat-icon" src="/ThisCord/resource/user_icons/' + rep.usericon + '" >' +
			'</div>' +

			'<div class="wrapper-item">' +
			'<span class="message-user-name">' + rep.username + '</span>' +
			'<span class="message-date">' + rep.date + '</span>' +
			'<p class="message-text">' + convertedText + '</p>' +
			'</div>' +
			'</div>';
		oldUserId = rep.userid;

	}
	oldMinute = sendMinute;
	oldHour = sendHour;
	oldDate = sendDate[0];
}

//サーバーの情報を取得する関数
async function getServerInfo(roomId) {
	try {
		const response = await fetch(`/ThisCord/fn/getserverinfo?roomId=${roomId}&id=${userinfo.user_id}`);
		if (response.ok) {

			roominfo = await response.json();
			const members = roominfo.member;
			nowRoomHostId = roominfo.host_id;
			membersMap = new Map(Object.entries(members));

			//メンバー一覧に表示する処理
			const memberListDiv = document.getElementById("members-list");
			memberListDiv.innerHTML = "";
			for (const [user_id, user_name] of membersMap) {
				if (nowRoomHostId == user_id) {
					memberListDiv.innerHTML +=
						'<div class="member-wrapper">' +
						'<img class="member-icon" src="/ThisCord/resource/user_icons/' + user_name[1] + '"></img>' +
						'<span class="member-name">' + user_name[0] + '</span>' +
						'<i class="server-host fa-solid fa-crown fa-xs"></i>' +
						'</div>';
				} else {
					memberListDiv.innerHTML +=
						'<div class="member-wrapper">' +
						'<img class="member-icon" src="/ThisCord/resource/user_icons/' + user_name[1] + '"></img>' +
						'<span class="member-name">' + user_name[0] + '</span>' +
						'</div>';
				}
			}

			const channels = roominfo.channels;
			const voice_channels = roominfo.voice_channels;
			channelsMap = new Map(Object.entries(channels));
			voiceChannelsMap = new Map(Object.entries(voice_channels))
		} else {
			location.href = "/ThisCord/login.html";
		}
	} catch (error) {
		console.error("Error: " + error);
		location.href = "/ThisCord/login.html";
	}
	const currentElement = document.querySelector('#server-id-' + nowRoomId);
	window.globalFunction.toggleClickedState(currentElement);
}

//ボイスチャンネルのボタンを生成する関数
function createVoiceChannelButton(channelInfo) {
	const channelsListDiv = document.getElementById("voice-channels-list");
	channelsListDiv.innerHTML = "";

	for (const [channel_id, channel_name] of channelInfo) {
		channelsListDiv.innerHTML += '<div class="text-channels" id="channel-id-' + channel_id + '"><a class="voice-channel-linc" onclick="modalToggle(\'video_modal\'); joinVoiceChannel(\'' + channel_id + '\', \'' + username + '\',\'' + user_icon + '\')"><i class="fa-solid fa-volume-low fa-sm" style="margin-right: 5px;"></i> ' + channel_name + '</a></div><div id="channelMember-' + channel_id + '"></div>';
	}
}

//メッセージ送信関数
function sendMessage() {
	const messageInput = document.getElementById("message-input");
	const message = messageInput.value;
	if (message) {	//メッセージが空の場合にEnterを押しても処理されなくなる
		let json =
		{
			nowRoomId: nowRoomId,
			nowRoomName: roomsMap.get(nowRoomId),
			nowChannelId: nowChannelId,
			nowChannelName: channelsMap.get(nowChannelId),
			username: userinfo.user_name,
			usericon: user_icon,
			userid: userid,
			date: getDate(),
			message: message
		};

		chatSocket.send(JSON.stringify(json));
		messageInput.value = "";
	}
}

function getDate() {
	var today = new Date();
	var year = today.getFullYear();
	var month = today.getMonth() + 1;
	var day = today.getDate();
	var hours = today.getHours();
	var minutes = today.getMinutes();

	return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes;
}

function fieldClear() {
	const chat = document.getElementById("message-container");
	const memberListDiv = document.getElementById("members-list");
	const channelsListDiv = document.getElementById("channels-list");
	chat.innerHTML = "";
	memberListDiv.innerHTML = "";
	channelsListDiv.innerHTML = "";
}

function registerNotice() {
	noticeSocket = new WebSocket(`ws://${ip}:${port}/ThisCord/notice/${userid}/${username}/${user_icon}`);

	noticeSocket.onopen = event => {
		console.log("接続開始");
	};

	noticeSocket.onmessage = event => {
		let json = JSON.parse(event.data);
		let member = json.members;
		let vcId = json.voiceChannelid;
		let type = json.type;

		if (type == 'invite') {
			alert('招待されました');
			getUserInfo();
		}
		createVoiceChannelIcon(member, vcId);
	};

	noticeSocket.onclose = event => {
		console.log("通知サーバー切断 :", event);
	};
}

function createVoiceChannelIcon(members, channelId) {
	const videoChannelElement = document.getElementById('channelMember-' + channelId);
	videoChannelElement.innerHTML = "";
	for (let member of members) {

		//videoChannelElement.innerHTML +='<div>'+ member.user +'</div>';
		videoChannelElement.innerHTML +=
			'<div class="voice-channel-member">' +
			'<img class="voice-channel-icon" src="/ThisCord/resource/user_icons/' + member.icon + '">' +
			'<div class="voice-channel-user">' + member.user + '</div>' +
			'</div>';
	}
}

async function getMessageInfo(channel_id) {
	try {
		var response;

		if (nowRoomId == -1) {
			response = await fetch("/ThisCord/fn/getpersonalmessageinfo?channel_id=" + channel_id);
		} else {
			response = await fetch("/ThisCord/fn/getmessageinfo?channel_id=" + channel_id);
		}

		if (response.ok) {
			const jmessage = await response.json();
			const messages = new Map(Object.entries(jmessage));

			const chat = document.getElementById("message-container");

			chat.innerHTML = "";

			for (const [key, message] of messages) {
				showMessage(message, chat);
			}

			scrollEndfast()
		} else {
			console.error("Failed to fetch message information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}

let oldDate = null;
let oldUserId = null;
let oldHour = null;
let oldMinute = null;

function showMessage(message, chat) {
	convertedText = message.message.replace(/\n/g, "<br>");

	let sendDate = message.send_date.split(' ');
	let sendHour = sendDate[1].split(':')[0];
	let sendMinute = sendDate[1].split(':')[1];
	if (oldDate != sendDate[0]) {
		chat.innerHTML += `
			<div class="message-date-section-wrapper">
				<div class="message-date-section"></div>
				<div class="message-date">${sendDate[0]}</div>
				<div class="message-date-section"></div>
			</div>
		`;
	}

	if (oldUserId == message.user_id && oldDate == sendDate[0] && oldMinute == sendMinute && oldHour == sendHour) {
		chat.innerHTML +=
			'<div class="message-wrapper">' +
			'<p class="message-text">' + convertedText + '</p>' +
			'</div>';
		oldUserId = message.user_id;
	} else {

		chat.innerHTML +=
			'<div class="message-wrapper">' +
			'<div>' +
			'<img class=" chat-icon" src="/ThisCord/resource/user_icons/' + message.user_icon + '" >' +
			'</div>' +

			'<div class="wrapper-item">' +
			'<span class="message-user-name">' + message.user_name + '</span>' +
			'<span class="message-date">' + message.send_date + '</span>' +
			'<p class="message-text">' + convertedText + '</p>' +
			'</div>' +
			'</div>';
		oldUserId = message.user_id;

	}
	oldMinute = sendMinute;
	oldHour = sendHour;
	oldDate = sendDate[0];
}

function toggleHome() {
	channelsWrapper.classList.remove('none');
	//serverHeaderWrapper.classList.remove('none');
	//inputField.classList.remove('none');
	//memberListWrapper.classList.remove('none');
	//messageContainer.classList.remove('none');
	//flendListWrapper.classList.add('none');
	//homeNav.classList.add('none');
	//friendFormWarper.classList.add('none');
	//friendListWarpe.classList.add('none');

	//homeChannelFlandList.classList.add('none');
	//homeInfoList.classList.add('none');
	//homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 552px) 240px";
	//homeContainerFluid.classList.remove('homepageGrid');

	joinHomeFlag = false;
}

//自動スクロール
const main = document.getElementById('chat-scroll');
function scrollEndfast() {
	main.scrollTop = main.scrollHeight;
	scrollEndfast();
}

function scrollEnd(duration) {
	var scrollHeight = main.scrollHeight;
	var startPosition = main.scrollTop;
	var startTime = performance.now();

	function scrollAnimation(currentTime) {
		var elapsed = currentTime - startTime;
		var progress = elapsed / duration;

		main.scrollTop = startPosition + progress * (scrollHeight - startPosition);

		if (progress < 1) {
			requestAnimationFrame(scrollAnimation);
		}
	}

	requestAnimationFrame(scrollAnimation);
}

function closeVoiceChannel() {
	joinVoiceChannel(nowVcId, nowUser, nowIcon);
}

const homeContainerFluid = document.getElementById('container-fluid');
let joinVoiceFlag = false;
let nowVcId = null;
let nowUser = null;
let nowIcon = null;

function closeVoiceChannel() {
	joinVoiceChannel(nowVcId, nowUser, nowIcon);
	sendDisconnectVoiceChannel(nowVcId, nowUser);

	window.multi.stopVideo();
	window.globalFunction.videoChat();
	window.multi.hangUp();

	joinVoiceFlag = false;
	nowUser = null;
	nowVcId = null;
	nowIcon = null;
}

function joinVoiceChannel(channelId, user, icon) {
	if (!joinVoiceFlag) { // 既に参加している場合は切断

		sendJoinVoiceChannel(channelId, user, icon);
		joinVoiceFlag = true;
		nowVcId = channelId;

		window.globalFunction.videoChat();
		window.multi.connect(channelId);

		console.log("チャンネルに参加 nowVcChannelId:" + nowVcId + ":" + channelId, ':', user, ':', icon);
	}
}

//通知サーバーにボイスチャンネルに参加したことを通知するJSON
async function sendJoinVoiceChannel(voiceChannelId, user, icon) {
	let json =
	{
		type: 'joinVoiceChannel',
		serverId: nowRoomId,
		voiceChannelid: voiceChannelId,
		user: user,
		icon: icon
	};
	noticeSocket.send(JSON.stringify(json));
}

//通知サーバーにボイスチャンネルから切断したことを通知するJSON
function sendDisconnectVoiceChannel(voiceChannelId, user) {
	let json =
	{
		type: 'disconnectVoiceChannel',
		serverId: nowRoomId,
		voiceChannelid: voiceChannelId,
		user: user,
	};
	noticeSocket.send(JSON.stringify(json));
}

function invFriendForm(id) {
	const invitationInput = document.getElementById('invitationInput');
	invitationInput.value = id;
}

function retryImageLoad(imgElement, maxRetries, retryInterval) {
	let retries = 0;

	function loadImage() {
		imgElement.onload = function () {
			console.log('Image loaded successfully.');
		};

		imgElement.onerror = function () {
			if (retries < maxRetries) {
				retries++;

				setTimeout(loadImage, retryInterval);
			}
		};
		imgElement.src = imgElement.src;
	}
	loadImage();
}


function initform() {
	const serverNameIn = document.getElementById('server_name');
	console.log(username);
	if (serverNameIn.value.length == 0) {
		console.log(serverNameIn.value);

		serverNameIn.value = username + 'のサーバー';
	} else {
		console.log(serverNameIn.value);
	}

	const inputServerId = document.getElementById('inputServerId');
	inputServerId.value = nowRoomId;
	console.log(nowRoomId);

	const MakeServerUserId = document.getElementById('MakeServerUserId');
	MakeServerUserId.value = userid;


	invFriendList
	getFriend('invFriendList');
	setFriendListToSinglePage('singleChatFriendList');

	const formUserId = document.getElementById('formUserId');
	formUserId.value = userid;

	const createChannelServerId = document.getElementById('createChannelServerId');
	createChannelServerId.value = nowRoomId;


	const footerUserIcon = document.getElementById('footerUserIcon');
	footerUserIcon.src = '/ThisCord/resource/user_icons/' + user_icon;
	footerUserIcon.innerHTML = '<img class="footerUserImage" src="/ThisCord/resource/user_icons/' + user_icon + '"></img>';


}

function form_clear(formId) {
	var form = document.getElementById(formId);
	var submitButton = document.getElementById('form_submit');

	form.setAttribute('data-submitting', 'true');
	form.submit();

}


function addOldRoom() {

	if (nowRoomId != null)
		oldRoomId = nowRoomId;
	console.log("oldRoomId " + oldRoomId);
}

function backToServer() {
	if (oldRoomId > 0)
		joinRoom(oldRoomId);
	else
		console.log("oldRoomId " + oldRoomId);

}

// import analyze from "rgbaster";
async function initMyPage() {
	const infoUserName = document.getElementById('info-user-name');
	const infoUserId = document.getElementById('info-user-id');
	const fCount = document.getElementById('friendCount');
	const infoIconUserImage = document.getElementById('infoIconUserImage');
	const myFriends = document.getElementById('myFriends');
	const infoHeader = document.getElementById('infoHeader');

	infoIconUserImage.src = '/ThisCord/resource/user_icons/' + user_icon;
	infoUserName.innerHTML = username;
	infoUserId.innerHTML = `${username}-${userid}`;
	fCount.innerHTML = friendCount + '人';

	myFriends.innerHTML = '';
	for (let i = 0; i < friendIcons.length; i++) {
		myFriends.innerHTML += `<img class="myFriendsIcon" src="resource/user_icons/${friendIcons[i]}" alt="">`;
		if (i == 4)
			break;
	}

	infoHeader.style.backgroundColor = 'rgb(' + await getDominantColor("resource/user_icons/" + user_icon) + ')';
}


// 画像の中で一番使われている色を取得する関数
async function getDominantColor(src) {
	try {
		const dominantColor = async function (src) {
			return new Promise((resolve, reject) => {
				var img = new Image();
				img.crossOrigin = 'Anonymous';

				img.onload = function () {
					var canvas = document.createElement('canvas');
					canvas.width = img.width;
					canvas.height = img.height;

					var ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0);

					var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
					var pixels = imageData.data;

					var colorCount = {};

					for (var i = 0; i < pixels.length; i += 4) {
						var rgb = pixels.slice(i, i + 3).join(',');

						if (colorCount[rgb]) {
							colorCount[rgb]++;
						} else {
							colorCount[rgb] = 1;
						}
					}

					var maxCount = 0;
					var dominantColor = '';
					for (var color in colorCount) {
						if (colorCount[color] > maxCount) {
							maxCount = colorCount[color];
							dominantColor = color;
						}
					}

					//ここで色を返す
					resolve(dominantColor);
				};

				img.onerror = function () {
					reject('Error loading the image.');
				};

				img.src = src;

				if (img.complete || img.width + img.height > 0) {
					img.onload();
				}
			});
		};
		return await dominantColor(src);
	} catch (error) {
		console.error(error);
	}
}


function setChannelList(channelsMap, voiceChannelsMap) {
	const channelsListDiv = document.getElementById("textChannelsList");
	channelsListDiv.innerHTML = "";
	for (const [channel_id, channel_name] of channelsMap) {
		channelsListDiv.innerHTML += `
		<div class="info-items">
			<div class="delete-channels" id="channel-id-${channel_id}" onclick="deleteChannel('${channel_id}', 'text')">
				<div class="textIcon">
					<i class="fa-solid fa-hashtag fa-sm mx-r-5" style="margin-right: 5px;"></i>
					${channel_name}
				</div>
				<button class="deleteButton">
					削除
				</button>
			</div>
		</div>
			`;
	}

	const voiceChannelsListDiv = document.getElementById("voiceChannelsList");
	voiceChannelsListDiv.innerHTML = "";

	for (const [channel_id, channel_name] of voiceChannelsMap) {
		voiceChannelsListDiv.innerHTML += `
		<div class="info-items">
			<div class="delete-channels" id="channel-id-${channel_id}" onclick="deleteChannel('${channel_id}', 'voice')">
				<div class="voice-channel-linc">
					<i class="fa-solid fa-volume-low fa-sm" style="margin-right: 5px;"></i> ${channel_name}
				</div>
				<button class="deleteButton" value="削除" >
					<p>削除</p>
				</button>
			</div>
		</div>
			`;
	}

}

async function deleteChannel(id, type) {
	if (nowRoomHostId != userid) {
		alert("このチャンネルの管理権限がありません。");
		return;
	}
	if (window.confirm(`本当に${type}チャンネルを削除してもよろしいですか？`)) {
		const response = await fetch(`/ThisCord/fn/deleteChannel?channel_id=${id}&type=${type}`);
		if (response.ok) {
			console.log("ok");
			joinRoom(nowRoomId);
			modalToggle('deleteChannelModal');
		} else {
			console.error("ng");
			alert("チャンネルを削除できませんでした。");
		}
	} else {
		return;
	}

}

async function deleteServer() {
	if (nowRoomHostId != userid) {
		alert("このサーバーの管理権限がありません。");
		return;
	}
	if (window.confirm(`本当にサーバーを削除してもよろしいですか？`)) {
		const response = await fetch(`/ThisCord/fn/deleteServer?server_id=${nowRoomId}`);

		if (response.ok) {
			modalToggle('serverEditModal');

			await getUserInfo();

			const firstServer = roomsMap.entries().next().value;
			let firstServerId = null;

			if (firstServer != null) {
				firstServerId = firstServer[0];
				await joinRoom(firstServerId);
			}

		} else {
			alert("サーバーを削除できませんでした。");
		}

	} else {
		return;
	}
}

async function invitationFriend() {
	const invUserId = document.getElementById('invitationInput').value;
	const response = await fetch(`/ThisCord/fn/invite?serverId=${nowRoomId}&userId=${invUserId}`);

	if (response.ok) {
		alert("招待を送りました。");
		modalToggle('invitation-modal');
		let json =
		{
			type: 'invite',
			serverId: nowRoomId,
			inviteUserId: invUserId
		};
		noticeSocket.send(JSON.stringify(json));
		await getServerInfo(nowRoomId);

		
		
	} else {
		alert("サーバーに招待できませんでした");
	}
}
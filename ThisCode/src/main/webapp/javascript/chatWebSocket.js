/**
*chatpage.jspのWebSocketに関するjavascript
*/
let defaultSrc = 'default';

let nowRoomId = null;
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
let friendCounter = null;

const ip = constIp;
const port = constPort;

document.addEventListener("DOMContentLoaded", init);


//ログインしたらデフォルトで一番上のサーバーを表示する
async function init() {
	homeContainerFluid.classList.remove('homepageGrid');
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

	initform();
}

// クエリ文字列からidパラメータの値を取得する関数
var queryString = window.location.search;

function getIdFromQueryString(name) {
	var urlParams = new URLSearchParams(queryString);
	return urlParams.get(name);
}
//サーバーからユーザーデータを取得する関数
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
			console.log('rooms-------------'+roomsMap);
		} else {
			location.href = "/ThisCord/login.html";
		}
	} catch (error) {
		location.href = "/ThisCord/login.html";
	}
	const infoDiv = document.querySelector("#user");
	infoDiv.innerHTML =
		'<div class="user-box">' +
		'<img class="user_icon_img" src="/ThisCord/resource/user_icons/' + user_icon + '" onerror="retryImageLoad(this, 10, 1000)"></img>' +
		'<div style="line-height: 17px; padding:4px 0px 4px 8px;">' +
		'<p id="user-name">' + userinfo.user_name + '</p>' +
		'<p id="user-id">' + userinfo.user_name + '-' + userid + '</p>' +
		'</div>' +
		'</div>';
}
//通知サーバーのコネクションの初期化
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
		if(type == 'invite'){
			alert('招待されました');
			getUserInfo();	
		}
		console.log(JSON.stringify(json));

		createVoiceChannelIcon(member, vcId);
	};

	noticeSocket.onclose = event => {
		console.log("通知サーバー切断 :", event);
	};
}

//ボイスチャンネルに参加してるユーザーの表示をする関数
function createVoiceChannelIcon(members, channelId) {
	const videoChannelElement = document.getElementById('channelMember-' + channelId);

	console.log("メンバーの人数：" + members.length);
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

//jspのほかの切断ボタンから通話を切るための関数
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
}

function joinVoiceChannel(channelId, user, icon) {
  if (joinVoiceFlag) { // 既に参加している場合は切断
    //homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 552px) 240px";
    homeContainerFluid.classList.add("video-grid-container");
    sendDisconnectVoiceChannel(nowVcId, user);

    window.multi.stopVideo();
    window.globalFunction.videoChat();
    window.multi.hangUp();

    if (channelId === nowVcId) { // 同じチャンネルの場合は切断
      joinVoiceFlag = false;
      nowUser = null;
      nowVcId = null;
      nowIcon = null;
    } else { // 別のチャンネルに参加
      //homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 312px) 0px";
      homeContainerFluid.classList.remove("video-grid-container");
      sendJoinVoiceChannel(channelId, user, icon);
      joinVoiceFlag = true;
      nowVcId = channelId;

      window.globalFunction.videoChat();
      window.multi.connect(channelId);
    }
  } else { // 参加
    //homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 312px) 0px";
    homeContainerFluid.classList.remove("video-grid-container");
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
			
			var convertedText = "";

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



//サーバーのボタンを生成する関数
async function createRoomB(roomInfo) {
	const roomListDiv = document.getElementById("room-list");
	roomListDiv.innerHTML = "";
	for (const [roomId, roomName] of roomInfo) {
		const src = roomName[1];
		if (src === defaultSrc) {
			roomListDiv.innerHTML += '<div class="server-list-item"><a class="server-icon" id="server-id-' + roomId + '" onclick=" joinRoom(\'' + roomId + '\');"  ><div class="server-name">' + roomName[0] + '</div></a></div>';
		} else {
			roomListDiv.innerHTML += '<div class="server-list-item"><a class="server-icon" id="server-id-' + roomId + '" onclick=" joinRoom(\'' + roomId + '\');"  ><img id="retryImage" src="/ThisCord/' + src + '" onerror="retryImageLoad(this, 10, 1000)"></img></a></div>';
		}
	}
}

// テキストチャンネルのボタンを生成する関数
function createChannelButton(channelInfo) {
	const channelsListDiv = document.getElementById("channels-list");
	channelsListDiv.innerHTML = "";

	for (const [channel_id, channel_name] of channelInfo) {
		console.log(channel_name);
		channelsListDiv.innerHTML +=
			'<div class="text-channels" id="channel-id-' + channel_id + '">' +
			'<a class="textIcon" href="javascript:joinChannel(\'' + channel_id + '\')">' +
			'<i class="fa-solid fa-hashtag fa-sm mx-r-5" style="margin-right: 5px;"></i>' +
			channel_name +
			'</a>' +
			'</div>';
	}
}


//ボイスチャンネルのボタンを生成する関数
function createVoiceChannelButton(channelInfo) {
	const channelsListDiv = document.getElementById("voice-channels-list");
	channelsListDiv.innerHTML = "";

	for (const [channel_id, channel_name] of channelInfo) {
		channelsListDiv.innerHTML += '<div class="text-channels" id="channel-id-' + channel_id + '"><a class="voice-channel-linc" onclick="joinVoiceChannel(\'' + channel_id + '\', \'' + username + '\',\'' + user_icon + '\')"><i class="fa-solid fa-volume-low fa-sm" style="margin-right: 5px;"></i> ' + channel_name + '</a></div><div id="channelMember-' + channel_id + '"></div>';
	}
}

//テキストチャンネルに参加する関数
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
		const createChannelServerId = document.getElementById('createChannelServerId');
		createChannelServerId.value = nowRoomId;
	};
	
	var convertedText = "";
	
	chatSocket.onmessage = event => {
		console.log("Received message: " + event.data);
		const chat = document.getElementById("message-container");
		const rep = JSON.parse(event.data);
		showOnMessage(rep, chat);
		scrollEnd(500);

	};

	chatSocket.onclose = event => {
		console.log("切断");
	};
	
	if (nowRoomId == -1) {
		const currentElemnt = document.querySelector('#chat-id-' + nowSelectUserId);
		window.globalFunction.toggleChannelState(currentElemnt);
	} else {
		const currentElemnt = document.querySelector('#channel-id-' + channel_id);
		window.globalFunction.toggleChannelState(currentElemnt);
	}
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

const santen = document.getElementById('santen');

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

	homeContainerFluid.classList.remove('homepageGrid');

	const firstTextChannel = channelsMap.entries().next().value;
	const firstTextChannelId = firstTextChannel[0];

	let voiceIds = [];
	for(const [channel_id, channel_name] of voiceChannelsMap){
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
	santen.innerHTML = '<i class="fa-solid fa-ellipsis" onclick="modalToggle(&#39;serverEditModal&#39;)"></i>';
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
			//createRoomB(roomsMap);
			//createChannelButton(channelsMap);
			//createVoiceChannelButton(voiceChannelsMap);
		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
		location.href = "/ThisCord/login.html";
	}
	const currentElement = document.querySelector('#server-id-' + nowRoomId);
	window.globalFunction.toggleClickedState(currentElement);
}

function sendMessage() {
	const messageInput = document.getElementById("message-input");
	const message = messageInput.value;
	
	let json =
	{
		nowRoomId: nowRoomId,
		nowRoomName: roomsMap.get(nowRoomId),
		nowChannelId: nowChannelId,
		nowChannelName: channelsMap.get(nowChannelId),
		username: userinfo.user_name,
		usericon: user_icon,
		date: getDate(),
		message: message
	};

	chatSocket.send(JSON.stringify(json));
	messageInput.value = null;
}

function fieldClear() {
	const chat = document.getElementById("message-container");
	const memberListDiv = document.getElementById("members-list");
	const channelsListDiv = document.getElementById("channels-list");
	chat.innerHTML = "";
	memberListDiv.innerHTML = "";
	channelsListDiv.innerHTML = "";
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

	const MakeServerUserId = document.getElementById('MakeServerUserId');
	MakeServerUserId.value = userid;
	

	invFriendList
	getFriend('invFriendList');
	
	const formUserId = document.getElementById('formUserId');
	formUserId.value = userid;
}

//フレンド追加モーダルにフレンドリストを表示する関数
async function getFriend(element) {
	const elm = document.getElementById(element);

	try {
		const response = await fetch('/ThisCord/fn/getfriendList?userId=' + userid);
		if (response.ok) {
			const json = await response.json();
			friendCounter = 0;
			for (let friend of json.friendList) {
				
				friendCounter++;
				
				elm.innerHTML +=
					`<div class="fland-box">
					  <button class="inv-friend-button" onclick="invFriendForm(${friend.user_id})">
					    <div class="icon-name-wrapper">
					      <img class="fland_icon_img" src="/ThisCord/resource/user_icons/${friend.user_icon}" />
					      <div style="line-height: 17px; padding:4px 0px 4px 8px;">
					        <p id="user-name">${friend.user_name}</p>
					        <p id="user-id">${friend.user_name}-${friend.user_id}</p>
					      </div>
					    </div>
					  </button>
					</div>`;
			}

		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}


function form_clear(formId) {
	var form = document.getElementById(formId);
	var submitButton = document.getElementById('form_submit');

	form.setAttribute('data-submitting', 'true');
	form.submit();

}
function handleKeyPress(event) {
	var textarea = document.getElementById('message-input');
    if (event.key === "Enter" && event.shiftKey) {
        // シフト + エンターの場合、改行を挿入せずにデフォルトの挙動を抑制する
        event.preventDefault();

        // テキストエリアの内容に改行を追加
        textarea.value += '\n';
		var line = textarea.value.split("\n").length;
		if (line <= 11) {
	    	chatFieldSizeAdjustment(line-1);
		}
	} else if (event.key === "Enter") {
		event.preventDefault();
		if (textarea.value && !/^\s*$/.test(textarea.value)) {	//メッセージが空,改行コード,スペースのみの場合にEnterを押しても処理されなくなる
			sendMessage();
			chatFieldSizeAdjustment(0);
		}
	} else if (event.key === "Backspace") {
    	//改行したら、比を変える
		var line = textarea.value.split("\n").length-1;
		if (line >= 1 && line <= 11) {
	    	chatFieldSizeAdjustment(line-1);
		}

	}
}
//chat-fieldのサイズをwindowが変更される度にサイズに合わせる
function resizeWindow(){
	var textarea = document.getElementById('message-input');
	var line = textarea.value.split("\n").length;
    chatFieldSizeAdjustment(line-1);
}
window.onresize = resizeWindow;


function retryImageLoad(imgElement, maxRetries, retryInterval) {
	let retries = 0;

	function loadImage() {
		imgElement.onload = function() {
			console.log('Image loaded successfully.');
		};

		imgElement.onerror = function() {
			if (retries < maxRetries) {
				retries++;

				setTimeout(loadImage, retryInterval);
			}
		};
		imgElement.src = imgElement.src;
	}
	loadImage();
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



/**
 * home画面のjavascript
 * 
 */
const server_div = document.getElementById('server');
const channelsWrapper = document.getElementById('channelsWrapper');
const flendListWrapper = document.getElementById('flendListWrapper');
const serverHeaderWrapper = document.getElementById('serverHeaderWrapper');
const inputField = document.getElementById('inputField');
const homeChatField = document.getElementById('chat-field');
const messageContainer = document.getElementById('message-container');
const homeNav = document.getElementById('home-nav');
const memberListWrapper = document.getElementById('member-list-wrapper');
const friendFormWarper = document.getElementById('friend-form-warper');
const friendListWarpe = document.getElementById('friend-list-warpe');

const homeChannelFlandList = document.getElementById('home-channel-fland-list');
//const homeContainerFluid = document.getElementById('container-fluid');
const homeInfoList = document.getElementById('home-info-list');

let joinHomeFlag = false;
function joinHome() {
	server_div.innerHTML = 'Home';
	channelsWrapper.classList.add('none');
	serverHeaderWrapper.classList.add('none');
	inputField.classList.add('none');
	messageContainer.classList.add('none');
	memberListWrapper.classList.add('none');
	flendListWrapper.classList.remove('none');
	homeNav.classList.remove('none');
	friendFormWarper.classList.remove('none');
	friendListWarpe.classList.remove('none');
	homeChannelFlandList.classList.remove('none');

	homeInfoList.classList.remove('none');
	//homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 729px) 417px";
	homeContainerFluid.classList.add('homepageGrid');
	
	if (!joinHomeFlag) {
		joinHomeFlag = true;
	}
	var channel_list_friend = document.querySelector('.channel-list-friend');
	if (channel_list_friend.classList.contains('clicked') == false) {
		channel_list_friend.classList.add('clicked');
	}
	getFriendList();
	showInfo();

	santen.innerHTML = "";
}
function toggleHome() {
	channelsWrapper.classList.remove('none');
	serverHeaderWrapper.classList.remove('none');
	inputField.classList.remove('none');
	memberListWrapper.classList.remove('none');
	messageContainer.classList.remove('none');
	flendListWrapper.classList.add('none');
	homeNav.classList.add('none');
	friendFormWarper.classList.add('none');
	friendListWarpe.classList.add('none');

	homeChannelFlandList.classList.add('none');
	homeInfoList.classList.add('none');
	//homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 552px) 240px";
	homeContainerFluid.classList.remove('homepageGrid');

	joinHomeFlag = false;
}

//ホームページでユーザ情報を表示する
async function showInfo() {
	const infoElement = document.getElementById('info-wrapper');
	const color = await getDominantColor("resource/user_icons/" + user_icon);
	console.log(color);
	const htmlCode = `
    <div class="info-header" style="background-color: rgb(${color})"></div>
    <img class="info-icon-user-img" src="/ThisCord/resource/user_icons/${user_icon}">'
    <div class="info-card">
      <div class="info-top">
        <div id="info-user-name">${username}</div>
        <div id="info-user-id">${username}-${userid}</div>
      </div>
      <div class="info-friend-count">
        <div style="font-size:14px; font-waight: 700;">Thiscordフレンド数</div>
        <div id="friendCounter" style="color: #b5bac1; font-size: 12px;">${friendCounter}人</div>
      </div>
      <div class="info-logout">
        <a>
          <i class="fa-solid fa-right-from-bracket"></i>
          <a class="logout" href="/ThisCord/fn/logout">
          	ログアウトする
          </a>
        </a>
      </div>
    </div>
  `;
	infoElement.innerHTML = htmlCode;
}

function plusFriendCounter() {
	document.getElementById("friendCounter").innerHTML=friendCounter+"人";
}


//フレンド申請を送信する
async function sendFriendRequest() {
	const friendId = document.getElementById("friendId").value;
	const friendForm = document.getElementById('friend-form');
	console.log(friendId);
	try {
		const response = await fetch(`/ThisCord/fn/friendRequest?userId=${userid}&friendId=${friendId}`);

		if (response.ok) {
			console.log("ok");
			await getFriendList();
			document.getElementById("friendId").value = "";
			friendForm.classList.toggle('ok');
			plusFriendCounter();
			
		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}

function invFriendForm(id){
	const invitationInput = document.getElementById('invitationInput');
	const inputServerId = document.getElementById('inputServerId');
	invitationInput.value = id;
	inputServerId.value = nowRoomId;
	console.log(nowRoomId);
}

//フレンドリストを表示する関数
async function getFriendList() {
	const friendListDiv = document.getElementById('friend-list');
	friendListDiv.innerHTML = "";
	homeChannelFlandList.innerHTML = '';
	try {
		const response = await fetch('/ThisCord/fn/getfriendList?userId=' + userid);
		if (response.ok) {
			const json = await response.json();
			
			friendCounter = 0;
			
			for (let friend of json.friendList) {
				friendCounter++;
				friendListDiv.innerHTML +=
					'<div class="fland-box">' +
					'<div class="icon-name-wrapper">' +
					'<img class="fland_icon_img" src="/ThisCord/resource/user_icons/' + friend.user_icon + '"></img>' +
					'<div style="line-height: 17px; padding:4px 0px 4px 8px;">' +
					'<p id="user-name">' + friend.user_name + '</p>' +
					'<p id="user-id">' + friend.user_name + '-' + friend.user_id + '</p>' +
					'</div>' +
					'</div>' +
					'<div class="about-button">' +
					'<i class="fa-solid fa-ellipsis-vertical"></i>' +
					'</div>' +
					'</div>';

				homeChannelFlandList.innerHTML +=
					'<div class="fland-channels" id="chat-id-' + friend.user_id +'">' +
					'<a class="channel-fland-box" href="javascript:joinPersonalChat('+friend.user_id+",'"+friend.user_name+"'"+')">' +
					'<img class="fland_icon_img" src="/ThisCord/resource/user_icons/' + friend.user_icon + '"></img>' +
					'<div style="line-height: 17px; padding:4px 0px 4px 8px;">' +
					'<p id="user-name">' + friend.user_name + '</p>' +
					'</div>' +
					'</a>' +
					'</div>';
			}

		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}

//cht-fieldのサイズを改行、windowサイズを踏まえて調整する
function chatFieldSizeAdjustment(line) {
	const ratioCS = window.innerHeight - (22.198+48+68) + 0.198;//421
	const ratioInput = 68;
	const ratioInputchildren = 44;
	const fluctuationValue = 24;
	
    const parent = document.querySelector('.chat-field');
    const children = parent.children;
   
	children[0].style.height = (ratioCS - fluctuationValue * line) + 'px';
    children[1].style.height = (ratioInput + fluctuationValue * line) + 'px';
    children[1].children[0].style.height = (ratioInputchildren + fluctuationValue * line) + 'px';
}

function setChannelList(channelsMap, voiceChannelsMap) {
	const channelsListDiv = document.getElementById("textChannelsList");
	channelsListDiv.innerHTML = "";
	for (const [channel_id, channel_name] of channelsMap) {
		channelsListDiv.innerHTML += `
		<div class="info-items">
			<div class="text-channels noSwipe" id="channel-id-${channel_id}" onclick="deleteChannel('${channel_id}', 'text')">
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
			<div class="text-channels" id="channel-id-${channel_id}" onclick="deleteChannel('${channel_id}', 'voice')">
				<a class="voice-channel-linc" onclick="modalToggle('video_modal');>
					<i class="fa-solid fa-volume-low fa-sm" style="margin-right: 5px;"></i> ${channel_name}
				</a>
				<button class="deleteButton" value="削除" >
					削除
				</button>
			</div>
		</div>
			`;
	}

}

async function deleteChannel(id, type) {
	if(nowRoomHostId != userid){
		alert("このチャンネルの管理権限がありません。");
		return;
	}
	if ((channelsMap.entries().next().value[0] == id) || (voiceChannelsMap.entries().next().value[0] == id)) {
		alert("初期サーバーは削除できません。");
		return;
	}
	const response = await fetch(`/ThisCord/fn/deleteChannel?channel_id=${id}&type=${type}`);
	if (response.ok) {
		console.log("ok")
		await getServerInfo(nowRoomId);
		createChannelButton(channelsMap);
		createVoiceChannelButton(voiceChannelsMap);
		setChannelList(channelsMap, voiceChannelsMap);
	} else {
		console.error("ng");
		alert("チャンネルを削除できませんでした。");
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


//ページ表示時に
resizeWindow();


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
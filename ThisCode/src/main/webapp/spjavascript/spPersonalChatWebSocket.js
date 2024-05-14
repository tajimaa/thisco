function joinPersonalChat(user_id2, user_name) {
	console.log("joinPersonalChat_TestMessage");
	
	//見た目のリセット＆整え
	fieldClear();
	chatPageClear();
	joinPersonalChatView();
	
	//チャット相手の名前表示
	//修正中
	const infoDiv = document.querySelector("#channel");
	infoDiv.innerHTML = user_name;
	
	nowRoomId = -1;
	
	getFriendRelationId(userid, user_id2).then(function(relationId){
		console.log(relationId);
		joinChannel(relationId);
	});
}

function chatPageClear() {
	console.log('chatPageClear: '+nowRoomId);
	const messageContainer = document.getElementById('message-container');
	messageContainer.innerHTML = '';
}

function joinPersonalChatView(){

}
//表示される要素を変える
// function joinPersonalChatView() {
// 	serverHeaderWrapper.classList.remove('none');
// 	inputField.classList.remove('none');
// 	messageContainer.classList.remove('none');
// 	homeNav.classList.add('none');
// 	friendFormWarper.classList.add('none');
// 	friendListWarpe.classList.add('none');
	
// 	homeContainerFluid.style.gridTemplateColumns = "72px 240px calc(100% - 729px) 417px";
// }
//チャット相手とのrelation_idを取得
//(userId1は接続者ID, userId2はチャット相手のID)
async function getFriendRelationId(userId1, userId2) {
	try {
		const response = await fetch('/ThisCord/fn/getFriendRelationId?userId1=' + userId1 + '&' + 'userId2=' + userId2);
		if (response.ok) {
			const json = await response.json();
			
			const relationId = json.relationId;
			
			console.log("りれーしょんあいでぃい"+relationId);
			
			return relationId;
			
		} else {
			console.error("Failed to fetch room information");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}
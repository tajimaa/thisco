///**
// * スマホ版フレンド申請送信用のJavaScript
// */

 
 //フレンド申請を送信する
async function sendFriendRequest() {
	const friendId = document.getElementById("friendId").value;
	const friendForm = document.getElementById('friend-form');
	console.log(friendId);
	try {
		const response = await fetch(`/ThisCord/fn/friendRequest?userId=${userid}&friendId=${friendId}`);

		if (response.ok) {
			alert("フレンドを追加しました");
			modalToggle('friendRegisterModal');
			getFriend('invFriendList');
			getFriend('invFriendList');
			setFriendListToSinglePage('singleChatFriendList');
		} else {
			alert("フレンドを追加できませんでした");
		}
	} catch (error) {
		console.error("Error: " + error);
	}
}
package bean;

public class JsonMessageBean {
	private int nowRoomId = 0;
	private String nowRoomName = null;
	private int nowChannelId = 0;
	private String nowChannelName = null;
	private String userName = null;
	private String date = null;
	private String message = null;
	
	public int getNowRoomId() {
		return nowRoomId;
	}
	public void setNowRoomId(int nowRoomId) {
		this.nowRoomId = nowRoomId;
	}
	public String getNowRoomName() {
		return nowRoomName;
	}
	public void setNowRoomName(String nowRoomName) {
		this.nowRoomName = nowRoomName;
	}
	public int getNowChannelId() {
		return nowChannelId;
	}
	public void setNowChannelId(int nowChannelId) {
		this.nowChannelId = nowChannelId;
	}
	public String getNowChannelName() {
		return nowChannelName;
	}
	public void setNowChannelName(String nowChannelName) {
		this.nowChannelName = nowChannelName;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
}
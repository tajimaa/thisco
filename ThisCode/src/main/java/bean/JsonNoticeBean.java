package bean;

import java.util.ArrayList;

public class JsonNoticeBean {
	private String type;
	private int voiceChannelid;
	private int serverId;
	private String user;
	private String icon;
	private int userId;
	private String channels[] ;
	private String inviteUserId;
	
	private ArrayList<NoticeSessionBean> members = new ArrayList<>();

	public ArrayList<NoticeSessionBean> getMembers() {
		return members;
	}

	public void setMembers(ArrayList<NoticeSessionBean> members) {
		this.members = members;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getVoiceChannelid() {
		return voiceChannelid;
	}

	public void setVoiceChannelid(int voiceChannelid) {
		this.voiceChannelid = voiceChannelid;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public int getServerId() {
		return serverId;
	}

	public void setServerId(int serverid) {
		this.serverId = serverid;
	}

	public String[] getChannels() {
		return channels;
	}

	public void setChannels(String channels[]) {
		this.channels = channels;
	}

	public String getInviteUserId() {
		return inviteUserId;
	}

	public void setInviteUserId(String inviteUserId) {
		this.inviteUserId = inviteUserId;
	}


}

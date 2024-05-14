package bean;

import java.io.Serializable;

public class ServerDataBean implements Serializable {
    private int server_id;
    private String server_name;
    private int user_id;
    private String server_icon;
    
    public ServerDataBean() {}
    
	public int getServer_id() {
		return server_id;
	}
	public void setServer_id(int server_id) {
		this.server_id = server_id;
	}
	public String getServer_name() {
		return server_name;
	}
	public void setServer_name(String server_name) {
		this.server_name = server_name;
	}
	public int getUser_id() {
		return user_id;
	}
	public void setUser_id(int user_id) {
		this.user_id = user_id;
	}
	public String getServer_icon() {
		return server_icon;
	}
	public void setServer_icon(String server_icon) {
		this.server_icon = server_icon;
	}

}
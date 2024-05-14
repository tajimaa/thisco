package endpoint;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.Session;

public class ServerSessionBean {
	private int user_id;
	private int server_id;
	private static final Map<Integer, Set<Session>> channelSessions = new HashMap<>();
	
	public void addSession(int channel_id, Session session) {
		channelSessions.computeIfAbsent(channel_id, k -> ConcurrentHashMap.newKeySet()).add(session);
	}
	
	public void removeSession(int channel_id, Session session) {
		channelSessions.getOrDefault(channel_id, Collections.emptySet()).remove(session);
	}
	
	public Set<Session> getSession(int channel_id) {
		return channelSessions.getOrDefault(channel_id, Collections.emptySet());
	}
	
	
	public int getServer_id() {
		return server_id;
	}

	public void setServer_id(int server_id) {
		this.server_id = server_id;
	}

	public int getUser_id() {
		return user_id;
	}

	public void setUser_id(int user_id) {
		this.user_id = user_id;
	}

	public int getRoom_id() {
		return server_id;
	}

	public void setRoom_id(int server_id) {
		this.server_id = server_id;
	}

}

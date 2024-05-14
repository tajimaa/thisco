package endpoint;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.websocket.Session;

public class ServerSessionManager {
	private static final Map<Integer, ServerSessionBean> serverSessions = new HashMap<>();
	
	public static void addSession(int server_id, ServerSessionBean bean) {
		serverSessions.put(server_id, bean);
	}
	
	public static void removeSession(int server_id, int channel_id, Session session ) {
		serverSessions.get(server_id).removeSession(channel_id, session);
	}
	
	public static Set<Session> getSession(int server_id, int channel_id) {
		
		return serverSessions.get(server_id).getSession(channel_id);
	}
}

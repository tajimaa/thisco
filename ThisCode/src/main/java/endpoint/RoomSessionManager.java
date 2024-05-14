package endpoint;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.Session;

public class RoomSessionManager {
	private static final Map<String, Set<Session>> roomSessions = new HashMap<>();
	
	public static void addSession(String room, Session session) {
		roomSessions.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet()).add(session);
	}
	
	public static void removeSession(String room, Session session) {
		roomSessions.getOrDefault(room, Collections.emptySet()).remove(session);
	}
	
	public static Set<Session> getSession(String room) {
		return roomSessions.getOrDefault(room, Collections.emptySet());
	}
}

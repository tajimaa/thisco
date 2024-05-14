package endpoint;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;

import bean.WebRtcSignalBean;

@ServerEndpoint("/signaling_room/{roomname}")
public class SignalingRoom {

    private static final Map<String, Set<Session>> rooms = new HashMap<>();
    @OnOpen
    public void onOpen(Session session, @PathParam("roomname") String roomname) {
    	
    		rooms.computeIfAbsent(roomname, k -> ConcurrentHashMap.newKeySet()).add(session);
            session.getUserProperties().put("roomname", roomname);
            System.out.println("SignalingRoom.java 接続: "+session.getId() + " room名:"+ roomname);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
    	String roomname = (String)session.getUserProperties().get("roomname");
    	
    	Gson gson = new Gson();
    	
    	WebRtcSignalBean bean = null;
    	try {
    		bean = gson.fromJson(message, WebRtcSignalBean.class);
    	} catch (Exception e) {
    		e.printStackTrace();
    	}
    	
    	if(bean.getType().equals("call me")) {//type:call meの場合
    		
    		bean.setFrom(session.getId());
    		System.out.println("SignalingRoom.java from: "+bean.getFrom());
    		
    		broadcastRoom(gson.toJson(bean), roomname, session);
    		System.out.println("SignalingRoom.java call me");
    		
    	} else if(bean.getType().equals("bye")) {
    		String channel = (String)session.getUserProperties().put("roomname", roomname);
    		rooms.get(channel).remove(session);
    		bean.setFrom(session.getId());
    		broadcastRoom(gson.toJson(bean), roomname, session);
    		System.out.println("SignalingRoom.java bye");
    		
    	} else {
    		bean.setFrom(session.getId());
    		String json = gson.toJson(bean);
    		sendTo(json, bean.getSendto(), roomname);
    	}
    }

    @OnClose
    public void onClose(Session session) {
    	String roomname = (String)session.getUserProperties().get("roomname");
    	Set<Session> s = rooms.get(roomname);
    	s.remove(session);
        System.out.println("Client disconnected: " + session.getId());
    }
    
    //ルームに参加してる自分以外の人にブロードキャストするメソッド
    private void broadcastRoom(String message, String roomname, Session Mysession) {
		Set<Session> sessions = rooms.get(roomname);
		for (Session session : sessions) {
			if(!session.getId().equals(Mysession.getId())) {
				send(session, message);
			}
		}
    }
    
    //ルームに参加している特定のSessionIdをもつ人にメッセージを送るメソッド
    private void sendTo(String message, String sendto, String roomname) {
    	Set<Session> sessions = rooms.get(roomname);
    	for (Session session : sessions) {
    		if(session.getId().equals(sendto)) {
    			send(session, message);
    			break;
    		}
    	}
    }
    
    private void send(Session session, String message) {
        try {
            synchronized (session) {
                if (session.isOpen()) {
                    session.getBasicRemote().sendText(message);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
}
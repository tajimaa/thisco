package endpoint;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;

import bean.JsonNoticeBean;
import bean.NoticeSessionBean;

@ServerEndpoint("/notice/{userId}/{userName}/{icon}")
public class NoticeServer {
	String pink   = "\u001b[00;36m";
	String end    = "\u001b[00m";
	
	private static Map<Integer,Set<Session>> serverSession = new HashMap<>();
	private static Map<Integer,Set<Session>> voiceChannelSession = new HashMap<>();
	private static Map<Session,NoticeSessionBean> notices = new HashMap<>();
	private static Map<Integer, Session> members = new HashMap<>();		//Integer=userId Session=WebSocketSession
	
	@OnOpen
	public void onOpen(Session session, @PathParam("userId") int userId, @PathParam("userName") String userName,@PathParam("icon") String icon) {
        session.getUserProperties().put("userId", userId);
        session.getUserProperties().put("userName", userName);
        session.getUserProperties().put("icon", icon);
        
        NoticeSessionBean bean = new NoticeSessionBean();
        bean.setUserId(userId);
		bean.setUser(userName);
		bean.setIcon(icon);

		notices.put(session, bean);
		members.put(userId, session);
		
		System.out.println(pink+"NoticeServer.java "+end+":\t\tオンライン "+userName);
	}

	@OnMessage
	public void onMessage(String message, Session session) {
		
		Gson gson = new Gson();
		JsonNoticeBean bean = null;
		int serverId = 0;
		int voiceChannelId = 0;
		
    	try {
    		bean = gson.fromJson(message, JsonNoticeBean.class);
    	} catch (Exception e) {
    		e.printStackTrace();
    	}
    	
    	serverId = bean.getServerId();    	
    	voiceChannelId = bean.getVoiceChannelid(); 
    	if(bean.getType().equals("joinServer")) {//サーバーに入ったとき
    		System.out.println(pink+"NoticeServer.java "+end+":\t\ttype "+bean.getType());
    		session.getUserProperties().put("serverId", serverId);

    		serverSession.computeIfAbsent(serverId, k -> ConcurrentHashMap.newKeySet()).add(session);
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tサーバーオンライン数:"+serverSession.get(serverId).size());
    		
    		for(String str : bean.getChannels()) {
    			int voiceId = Integer.parseInt(str);
    			JsonNoticeBean mess = JsonInitChannel(serverId, voiceId);
    			String json = gson.toJson(mess);
        		sendServer(serverId, json);
    		}

    	}else if(bean.getType().equals("joinVoiceChannel")) {//ボイスチャンネルに入ったとき
    		System.out.println(pink+"NoticeServer.java "+end+":\t\t type="+bean.getType());
    		session.getUserProperties().put("voiceChannelId", voiceChannelId);
    		
    		voiceChannelSession.computeIfAbsent(voiceChannelId, k -> ConcurrentHashMap.newKeySet()).add(session);
    		
    		JsonNoticeBean mess = JsonInitChannel(serverId,voiceChannelId );
    		String json = gson.toJson(mess);
    		
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tチャンネル内オンライン数 "+voiceChannelSession.get(voiceChannelId).size());
    		
    		sendServer(serverId, json);
    	
    	}else if(bean.getType().equals("disconnectVoiceChannel")) {//ボイスチャンネルから出るとき
    		System.out.println(pink+"NoticeServer.java "+end+":\t\ttype "+bean.getType());
    		
    		voiceChannelSession.getOrDefault(voiceChannelId, Collections.emptySet()).remove(session);
    		
    		JsonNoticeBean mess = JsonInitChannel(serverId,voiceChannelId );
    		String json = gson.toJson(mess);
    		
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tチャンネル内オンライン数"+voiceChannelSession.get(voiceChannelId).size());
    		
    		sendServer(serverId, json);
    	
    	} else if(bean.getType().equals("invite")) {
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tしょうたいきたよ");
    		int invUserid = bean.getUserId();
    		String inviteUserId = bean.getInviteUserId();
    		Session sess = members.get(Integer.parseInt(inviteUserId));
    		
    		JsonNoticeBean mess = new JsonNoticeBean();
    		mess.setType("invite");
    		mess.setInviteUserId(inviteUserId);
    		String json = gson.toJson(mess);
    		System.out.println(message);
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tsendJson "+json);
    		
    		if(sess != null) {
    			sendOne(sess, json);
    		}else {
    			for(int id: members.keySet()) {
    				System.out.println(id);
    			}
    				
    			System.out.println(pink+"NoticeServer.java "+end+":\t\tそんなセッションありません message "+message);
    			
    		}
    		
    	} else {
    		System.out.println(pink+"NoticeServer.java "+end+":\t\tどのタイプでもありません message "+message);
    	}
	}
	
	@OnClose
	public void onClose(Session session, CloseReason reason) {
	    System.out.println("NoticeServer.java :"+reason);
	    
	    int userId = (int) session.getUserProperties().get("userId");
	    int serverId = (int) session.getUserProperties().get("serverId");
	    int voiceChannelId = 0;
	    
	    if( session.getUserProperties().get("voiceChannelId") != null) {
	    	voiceChannelId = (int)  session.getUserProperties().get("voiceChannelId");
	    	voiceChannelSession.getOrDefault(voiceChannelId, Collections.emptySet()).remove(session);
	    }
	    
	    serverSession.getOrDefault(serverId, Collections.emptySet()).remove(session);
	    
	    System.out.println("NoticeServer.java :\t\t切断 サーバーオンライン数" + serverSession.get(serverId).size());
	    
	    try {
	    	notices.remove(session);
	    } catch (Exception e) {
	    	e.printStackTrace();
	    }
	    
	    members.remove(userId);
	    
	}

	/* 接続エラーが発生したとき */
	@OnError
	public void onError(Session session, Throwable t) {
	    System.out.println("NoticeServer.java :\t\tエラーが発生しました。");
	    int userId = (int) session.getUserProperties().get("userId");
	    int serverId = (int) session.getUserProperties().get("serverId");
	    int voiceChannelId = (int) session.getUserProperties().get("voiceChannelId");
	    serverSession.getOrDefault(serverId, Collections.emptySet()).remove(session);
	    voiceChannelSession.getOrDefault(voiceChannelId, Collections.emptySet()).remove(session);

	    notices.remove(session);
	    members.remove(userId);
	    t.printStackTrace();
	}

	
	public JsonNoticeBean JsonInitChannel(int serverId, int channelId) {
		JsonNoticeBean mess = new JsonNoticeBean();
		mess.setServerId(serverId);
		mess.setVoiceChannelid(channelId);
		
		Set<Session> sessions = voiceChannelSession.getOrDefault(channelId, Collections.emptySet());
		
		for(Session ses: sessions) {
			mess.getMembers().add(notices.get(ses));
		}
		return mess;
	}
	
	public void sendServer(int serverId, String json) {
	    Set<Session> sessions = serverSession.getOrDefault(serverId, Collections.emptySet());
	    for (Session session : sessions) {
	        try {
	            if (session.isOpen()) {
	                session.getBasicRemote().sendText(json);
	            }
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	    }
	}
	
	public void sendOne(Session session, String json) {
		try {
			session.getBasicRemote().sendText(json);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
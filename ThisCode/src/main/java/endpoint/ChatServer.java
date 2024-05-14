package endpoint;
import java.io.IOException;
import java.util.HashMap;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;

import bean.MessageBean;
import db.dao.MessageDataDAO;
import db.dao.PersonalMessageDAO;
import util.Sanitizer;

@ServerEndpoint("/chat/{server_id}/{channel_id}/{user_id}")
public class ChatServer {
    @OnOpen
    public void onOpen(Session session, @PathParam("server_id") String s_server_id, @PathParam("channel_id") String s_channel_id,@PathParam("user_id") String s_user_id) {    	
    	System.out.println(s_server_id);
    	int server_id = Integer.parseInt(s_server_id);
    	
    	int channel_id = Integer.parseInt(s_channel_id);
    	int user_id = Integer.parseInt(s_user_id);
    	
    	System.out.println(server_id+" "+channel_id+" "+user_id);
    	
        session.getUserProperties().put("server_id", server_id);
        session.getUserProperties().put("channel_id", channel_id);
        session.getUserProperties().put("user_id", user_id);
        
        ServerSessionBean bean = new ServerSessionBean();
        bean.setServer_id(server_id);
        bean.setUser_id(user_id);
        bean.addSession(channel_id ,session);
        
        ServerSessionManager.addSession(server_id, bean);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        int server_id = (int) session.getUserProperties().get("server_id");
        int channel_id = (int) session.getUserProperties().get("channel_id");
        int user_id = (int) session.getUserProperties().get("user_id");
        System.out.println(server_id+"."+ user_id + ": " + message);
        
        addMessageToDB(user_id, message);
        
        
        System.out.println(escape(user_id, message));
        broadcast(server_id, channel_id, escape(user_id, message));
    }

    @OnClose
    public void onClose(Session session) {
    	System.out.println("接続破棄");
        int sever_id = (int) session.getUserProperties().get("server_id");
        int channel_id = (int) session.getUserProperties().get("channel_id");
        ServerSessionManager.removeSession(sever_id, channel_id, session);
    }

    private void broadcast(int server_id, int channel_id, String message) {
        Set<Session> sessions = ServerSessionManager.getSession(server_id, channel_id);
        for (Session session : sessions) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
    public void addMessageToDB(int user_id, String jmessage) {
    	
    	Gson gson = new Gson();
        HashMap message = gson.fromJson(jmessage, HashMap.class);
        
        MessageBean mb = new MessageBean();
        mb.setUser_id(user_id);
        mb.setChannel_id(Integer.parseInt((String)message.get("nowChannelId")));
        mb.setSend_date((String)message.get("date"));
        mb.setMessage(Sanitizer.sanitizing((String)message.get("message")));
		
        //nowRoomIdが-1なら、個人チャット(personal_message表)に書き込む
        
        if (message.get("nowRoomId") instanceof Double) {
        	if (-1.0 == (double)message.get("nowRoomId")) {
            	PersonalMessageDAO pmd = PersonalMessageDAO.getInstance();
            	pmd.insertRecord(mb);
        	}
        } else {
    	    MessageDataDAO mdd = MessageDataDAO.getInstance();
    		mdd.insertRecord(mb);
        }
    }
    private static String escape(int user_id, String mess) {
    	Gson gson = new Gson();
        HashMap message = gson.fromJson(mess, HashMap.class);
        
        message.put("message",Sanitizer.sanitizing((String)message.get("message")));
        return gson.toJson(message);
    }
}



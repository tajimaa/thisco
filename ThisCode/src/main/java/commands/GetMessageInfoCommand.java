package commands;

import java.util.ArrayList;

import com.google.gson.Gson;

import bean.MessageBean;
import db.dao.MessageDataDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetMessageInfoCommand extends AbstractCommand {

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int channel_id = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("channel_id")[0]));
		
		String jmessage = null;
		MessageDataDAO mdd = MessageDataDAO.getInstance();
    	ArrayList<MessageBean> result = mdd.findRecord(channel_id);
    	
		res.setCharacterEncoding("UTF-8");
		res.getWriter().write(new Gson().toJson(result));
    	
//    	jmessage = "{"
//    		+ "nowRoomId: nowRoomId,"
//    		+ "nowRoomName: roomsMap.get(nowRoomId),"
//    		+ "nowChannelId: nowChannelId,"
//    		+ "nowChanneName: channelsMap.get(nowChannelId),"
//    		+ "username: userinfo.user_name,"
//    		+ "date: getDate(),"
//    		+ "message: message"
//    	+ "}";
	}
}

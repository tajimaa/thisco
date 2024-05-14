package commands;

import java.util.ArrayList;

import com.google.gson.Gson;

import bean.MessageBean;
import db.dao.PersonalMessageDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetPersonalMessageInfoCommand extends AbstractCommand {

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int channel_id = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("channel_id")[0]));
		
		PersonalMessageDAO pmd = PersonalMessageDAO.getInstance();
    	ArrayList<MessageBean> result = pmd.findRecord(channel_id);
    	
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

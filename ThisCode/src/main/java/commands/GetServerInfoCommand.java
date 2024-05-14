package commands;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;

import bean.ServerDataBean;
import bean.ServerInfoDTO;
import bean.UserBean;
import bean.UserDataBean;
import db.dao.ServerDataDAO;
import db.dao.TextChannelDataDAO;
import db.dao.UserDataDAO;
import db.dao.UserServerRelationshipDAO;
import db.dao.VoiceChannelDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetServerInfoCommand extends AbstractCommand {
	String yellow = "\u001b[00;33m";
	String end    = "\u001b[00m";
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int roomId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("roomId")[0]));
		int userId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("id")[0]));
		UserBean bean = (UserBean)req.getAttributeInSession("bean"+userId);
		
		if(bean != null) {
			ServerInfoDTO dto = getInfo(roomId);
			
			req.setAttributeInSession("serverInfo", dto);
			res.setContentType("application/json");
			res.setCharacterEncoding("UTF-8");
			
			res.getWriter().write(new Gson().toJson(dto));
		} else {
			System.out.println(yellow+"GetServerInfoCommadn.java"+end+" : \t\tセッションがありません");
		}

		
	}
	
	private ServerInfoDTO getInfo(int server_id) {
		ServerInfoDTO resultDto = new ServerInfoDTO();
		ServerDataDAO serverDao = ServerDataDAO.getInstance();
		ServerDataBean serverBean = serverDao.findRecord(server_id);
		
		resultDto.setServer_id(serverBean.getServer_id());
		resultDto.setServer_name(serverBean.getServer_name());
		resultDto.setServer_icon(serverBean.getServer_icon());
		resultDto.setHost_id(serverBean.getUser_id());
		
		TextChannelDataDAO textChannelDao = TextChannelDataDAO.getInstance();
		Map<Integer, String> channels = textChannelDao.findRecords(server_id);
		resultDto.setChannels(channels);
		
		UserServerRelationshipDAO serverRelationDao = UserServerRelationshipDAO.getInstance();
		ArrayList<Integer> usersList = serverRelationDao.getJoinedUsers(server_id);
		
		UserDataDAO userDao = UserDataDAO.getInstance();
		Map<Integer, String[]> members = new HashMap<>();
		
		for(int user_id : usersList) {
			UserDataBean dataBean = userDao.getUserInfo(user_id);
			String info[] = new String[2];
			info[0] = dataBean.getUser_name();
			info[1] = dataBean.getUser_icon();
			members.put(dataBean.getUser_Id(), info);
		}
		resultDto.setMember(members);
		
		VoiceChannelDAO voiceDao = VoiceChannelDAO.getInstance();
		Map<Integer, String> voiceChannels = voiceDao.getVoiceChannels(server_id);
		resultDto.setVoice_channels(voiceChannels);
		
		return resultDto;
	}
	
}
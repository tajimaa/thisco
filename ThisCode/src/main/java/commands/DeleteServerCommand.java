package commands;

import db.dao.TextChannelDataDAO;
import db.dao.UserServerRelationshipDAO;
import db.dao.VoiceChannelDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class DeleteServerCommand extends AbstractCommand {

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int serverId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("server_id")[0]));

		int flag = -1;
		
		TextChannelDataDAO textDao = TextChannelDataDAO.getInstance();
		flag = textDao.deleteTextChannelAll(serverId);
		
		VoiceChannelDAO voiceDao = VoiceChannelDAO.getInstance();
		flag = voiceDao.deleteVoiceChannelAll(serverId);
		
		UserServerRelationshipDAO relationDao = UserServerRelationshipDAO.getInstance();
		flag = relationDao.deleteRelationshipAll(serverId);
		

		if(0 < flag) {
			res.setStatus("ok");
		} else {
			res.setStatus("ng");
		}
			

	}

}

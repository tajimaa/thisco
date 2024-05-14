package commands;

import db.dao.TextChannelDataDAO;
import db.dao.VoiceChannelDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class DeleteChannelCommand extends AbstractCommand {

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int channelId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("channel_id")[0]));
		String channelType = Sanitizer.sanitizing((String) req.getParameter("type")[0]);
		int flag = -1;
		if(channelType.equals("text")) {
			TextChannelDataDAO textDao = TextChannelDataDAO.getInstance();
			flag = textDao.deleteTextChannel(channelId);

		} else {
			VoiceChannelDAO voiceDao = VoiceChannelDAO.getInstance();
			flag = voiceDao.deleteVoiceChannel(channelId);
		}
		if(0 < flag) {
			res.setStatus("ok");
		} else {
			
			res.setStatus("ng");
		}
			
	}
}

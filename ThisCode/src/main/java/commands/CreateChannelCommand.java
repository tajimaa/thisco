package commands;

import db.dao.TextChannelDataDAO;
import db.dao.VoiceChannelDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class CreateChannelCommand extends AbstractCommand {
	String yellow = "\u001b[00;33m";
	String green  = "\u001b[00;32m";
	String end    = "\u001b[00m";
	
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		String channelName = Sanitizer.sanitizing((String)req.getParameter("channelName")[0]);
		String channelType = Sanitizer.sanitizing((String)req.getParameter("channelType")[0]);
		int serverId = Integer.parseInt(req.getParameter("createChannelServerId")[0]);
		System.out.println(yellow+"CreateCannelCommand.java"+ end + "\t\tチャンネル作成 "+ channelName+ " : " + serverId +" : " + channelType);
		
		if(channelType.equals("text")) {
			System.out.println(yellow+"CreateCannelCommand.java"+ end + "\t\t"+green+"テキストチャンネルを作成 "+end +channelName);
			TextChannelDataDAO textDao = TextChannelDataDAO.getInstance();
			textDao.addTextChannel(channelName, serverId);
			
		} else if(channelType.endsWith("voice")) {
			System.out.println(yellow+"CreateCannelCommand.java"+ end + "\t\t"+green+"ボイスチャンネルを作成 "+end + channelName);
			VoiceChannelDAO voiceDao = VoiceChannelDAO.getInstance();
			voiceDao.addVoiceChannel(channelName, serverId);
		}
		
		res.setStatus("ok");
	}

}

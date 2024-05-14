package commands;

import db.dao.FriendRelationshipDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetFriendRelationIdCommand extends AbstractCommand{
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		FriendRelationshipDAO dao = FriendRelationshipDAO.getInstance();
		int userId1 = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("userId1")[0]));
		int userId2 = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("userId2")[0]));
		
		System.out.println("getFriendRelationId "+userId1+" "+userId2);
		
		int relationId = dao.getRelationID(userId1, userId2);
		
		System.out.println("getFriendRelationId result "+relationId);

		res.setCharacterEncoding("UTF-8");
		res.getWriter().write("{\"relationId\" : \""+relationId+"\"}");
	}
}

package commands;

import com.google.gson.Gson;

import bean.UserBean;
import db.dao.UserDataDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetUaserInfoCommand extends AbstractCommand {
	String yellow = "\u001b[00;33m";
	String end    = "\u001b[00m";

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int userId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("id")[0]));
		UserBean bean = (UserBean)req.getAttributeInSession("bean"+userId);
		if(bean != null) {
			UserDataDAO account = UserDataDAO.getInstance();
			UserBean userBean = account.getRecord(userId);
			req.setAttributeInSession("bean"+userId, userBean);
			
			res.setContentType("application/json");
			res.setCharacterEncoding("UTF-8");
			res.getWriter().write(new Gson().toJson(userBean));
		} else {
			System.out.println(yellow+"GetUserInfCommand.java"+end+" : \t\tセッションがありません");
		}
	}
}

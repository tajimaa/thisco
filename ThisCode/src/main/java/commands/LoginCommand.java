package commands;

import bean.UserBean;
import db.dao.UserDataDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;
import util.encrypt.Encryption;

public class LoginCommand extends AbstractCommand {

	@Override
	public void execute(RequestContext req, ResponseContext res) {
		String email = Sanitizer.sanitizing(req.getParameter("email")[0]);
		String password = Sanitizer.sanitizing(req.getParameter("password")[0]);
		
		UserDataDAO account = UserDataDAO.getInstance();
		UserBean userBean = account.getRecord(email);
		
		if(userBean.getPassword() != null && Encryption.check(password, userBean.getPassword())) {
			
			String deviceType = req.getDeviceType();
			String target = null;
			if(deviceType == "Smartphone") {
				target = "spchat.html";
			} else {
				target ="chat.html";
			} 
			
        	req.setAttributeInSession("bean"+userBean.getUser_id(), userBean);
			res.setRedirect("/"+target+"?id="+userBean.getUser_id());
		} else {
			res.setRedirect("/login.html?miss");
		}
	}

}

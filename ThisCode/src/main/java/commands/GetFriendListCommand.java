package commands;

import java.util.ArrayList;

import com.google.gson.Gson;

import bean.JsonFriendListBean;
import bean.UserDataBean;
import db.dao.FriendRelationshipDAO;
import db.dao.UserDataDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;

public class GetFriendListCommand extends AbstractCommand{
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		FriendRelationshipDAO dao = FriendRelationshipDAO.getInstance();
		int userId = Integer.parseInt(Sanitizer.sanitizing(req.getParameter("userId")[0]));
		ArrayList<Integer> friendList = dao.getFriendList(userId);

		res.setCharacterEncoding("UTF-8");
		res.getWriter().write(new Gson().toJson(setBean(friendList)));
	}

	public JsonFriendListBean setBean(ArrayList<Integer> friendList) {
		JsonFriendListBean bean = new JsonFriendListBean();
		ArrayList<UserDataBean> friendListBean = new ArrayList<>();
		UserDataDAO udao = UserDataDAO.getInstance();

		for(int userId : friendList) {
			friendListBean.add(udao.getUserInfo(userId));
		}
		bean.setFriendList(friendListBean);
		return bean;
	}
}

package commands;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import db.mysql.MySqlManager;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;

public class InvitationCommand extends AbstractCommand {
	String yellow = "\u001b[00;33m";
	String end    = "\u001b[00m";
	
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		int user_id = Integer.parseInt(req.getParameter("userId")[0]);
		int server_id = Integer.parseInt(req.getParameter("serverId")[0]);

		if(0 < invaite(server_id, user_id)) {
			res.setStatus("ok");
		} else {
			res.setStatus("ng");
		}
		
	}
	
	private int invaite(int server_id, int user_id) {
		int result = -1;
		Connection cn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String SQL = "INSERT INTO us_relationship (user_id, server_id) VALUES (?, ?);";
		String UserSql ="select user_id from us_relationship where user_id = ? and server_id = ?";
		try {
			
			cn = MySqlManager.getConnection();
			
			pstmt = cn.prepareStatement(UserSql);
			pstmt.setInt(1, user_id);
			pstmt.setInt(2, server_id);
			rs = pstmt.executeQuery();
			if(!rs.next()) {
				pstmt = cn.prepareStatement(SQL);
				pstmt.setInt(1, user_id);
				pstmt.setInt(2, server_id);
				
				result = pstmt.executeUpdate();
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			MySqlManager.close();
		}
		return result;
	}

}

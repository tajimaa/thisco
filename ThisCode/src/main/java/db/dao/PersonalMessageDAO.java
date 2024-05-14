package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import bean.MessageBean;
import db.mysql.MySqlManager;

public class PersonalMessageDAO {
    private static final String SELECT_MESSAGE_DATA = "SELECT message_id, personal_message.user_id, account.user_name, account.user_icon, relation_id, send_date, message "
    												  + "FROM personal_message "
										    		  + "INNER JOIN account ON personal_message.user_id = account.user_id "
										    		  + "WHERE relation_id = ? "
										    		  + "ORDER BY message_id";
    private static final String INSERT_MESSAGE = "INSERT INTO personal_message (user_id, relation_id, send_date, message) "
    											 + "VALUES(?, ?, ?, ?)";
	private static PersonalMessageDAO dao = null;
	static{
		dao = new PersonalMessageDAO();
	}

	public static PersonalMessageDAO getInstance(){
		return dao;
	}

	private PersonalMessageDAO(){}

	//個人チャット
	public ArrayList<MessageBean> findRecord(int relationId){
		ArrayList<MessageBean> result = new ArrayList<>();

        try(	Connection cn = MySqlManager.getConnection();
				PreparedStatement ps = cn.prepareStatement(SELECT_MESSAGE_DATA); ){
			
			ps.setInt(1, relationId);
			
			try(ResultSet rs = ps.executeQuery();){
				while(rs.next()) {
	                MessageBean messageBean = new MessageBean();
	                messageBean.setMessage_id(rs.getInt("message_id"));
	                messageBean.setUser_id(rs.getInt("user_id"));
	                messageBean.setUser_name(rs.getString("user_name"));
	                messageBean.setUser_icon(rs.getString("user_icon"));
	                messageBean.setChannel_id(rs.getInt("relation_id"));
	                messageBean.setSend_date(rs.getString("send_date"));
	                messageBean.setMessage(rs.getString("message"));
	                result.add(messageBean);
				}
			}
			
		} catch(Exception e) {
			e.printStackTrace();
		}
		return result;
    }
	 public void insertRecord(MessageBean mb) {
	    	try (	Connection cn = MySqlManager.getConnection();
					PreparedStatement ps = cn.prepareStatement(INSERT_MESSAGE); ){
	            cn.setAutoCommit(false);
		    	
		    	ps.setInt(1, mb.getUser_id());
		    	ps.setInt(2, mb.getChannel_id());
		    	ps.setString(3, mb.getSend_date());
		    	ps.setString(4, mb.getMessage());
		    	
		    	ps.executeUpdate();
		    	
		    	cn.commit();
	    	} catch (SQLException e) {
	            e.printStackTrace();
	        }
	    }
}
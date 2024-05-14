package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import bean.MessageBean;
import db.mysql.MySqlManager;

public class MessageDataDAO{
    private static final String SELECT_MESSAGE_DATA = "SELECT message_id, message.user_id, account.user_name, account.user_icon, channel_id, send_date, message "
    		+ "FROM message "
    		+ "INNER JOIN account ON message.user_id = account.user_id "
    		+ "WHERE channel_id = ? "
    		+ "ORDER BY message_id";
    private static final String UPDATE_MESSAGE = "UPDATE message_data SET message = ? "
            + "WHERE server_id = ? AND channel_id = ?";
    private static final String INSERT_MESSAGE = "INSERT INTO message (user_id, channel_id, send_date, message) "
    		+ "VALUES(?, ?, ?, ?)";
    private static final String DELETE_CHANNEL ="delete from message where channel_id = ?";

    PreparedStatement pstmt = null;
    ResultSet rs = null;

    private static MessageDataDAO msdao = null;
    
    static {
    	msdao = new MessageDataDAO();
    }
    
    public static final MessageDataDAO getInstance() {
    	return msdao;
    }

    private MessageDataDAO(){}

    public ArrayList<MessageBean> findRecord(int channel_id) {
        ArrayList<MessageBean> result = new ArrayList<>();

        try {
        	Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(SELECT_MESSAGE_DATA);
            pstmt.setInt(1, channel_id);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                MessageBean messageBean = new MessageBean();
                messageBean.setMessage_id(rs.getInt("message_id"));
                messageBean.setUser_id(rs.getInt("user_id"));
                messageBean.setUser_name(rs.getString("user_name"));
                messageBean.setUser_icon(rs.getString("user_icon"));
                messageBean.setChannel_id(rs.getInt("channel_id"));
                messageBean.setSend_date(rs.getString("send_date"));
                messageBean.setMessage(rs.getString("message"));
                result.add(messageBean);
            }

        } catch (SQLException e){
            e.printStackTrace();
        
        } finally {
			MySqlManager.close();
		}
        return result;
    }

    public boolean updateRecord(int server_id, int channel_id, String newMessage) {
        boolean success = false;

        try {
        	Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(UPDATE_MESSAGE);
            pstmt.setString(1, newMessage);
            pstmt.setInt(2, server_id);
            pstmt.setInt(3, channel_id);
            int rowsUpdated = pstmt.executeUpdate();

            if (rowsUpdated > 0) {
                success = true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        
        } finally {
			MySqlManager.close();
		}
        
        return success;
    }
    public void insertRecord(MessageBean mb) {
    	try {
    		Connection cn = MySqlManager.getConnection();
            cn.setAutoCommit(false);
	    	pstmt = cn.prepareStatement(INSERT_MESSAGE);
	    	
	    	pstmt.setInt(1, mb.getUser_id());
	    	pstmt.setInt(2, mb.getChannel_id());
	    	pstmt.setString(3, mb.getSend_date());
	    	pstmt.setString(4, mb.getMessage());
	    	
	    	pstmt.executeUpdate();
	    	
	    	cn.commit();
    	} catch (SQLException e) {
            e.printStackTrace();
        } finally {
			MySqlManager.close();
		}
    }
    
    public void deleteChannel(int channelId) {
    	try {
    		Connection cn = MySqlManager.getConnection();
            cn.setAutoCommit(false);
	    	pstmt = cn.prepareStatement(DELETE_CHANNEL);
	    	
	    	pstmt.setInt(1, channelId);
	    	pstmt.executeUpdate();
	    	
	    	cn.commit();
    	} catch (SQLException e) {
            e.printStackTrace();
        } finally {
			MySqlManager.close();
		}
    }
}
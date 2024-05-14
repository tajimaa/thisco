package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import bean.TextChannelDataBean;
import db.mysql.MySqlManager;

public  class TextChannelDataDAO {
	private static final String CHANNEL = "SELECT * FROM text_channel";
	private static final String FINDRECORD = "SELECT * FROM text_channel WHERE channel_id = ?";
	private static final String SELECT_CHANNELS ="SELECT * FROM text_channel WHERE server_id = ?";
	private static final String INSERT_TEXT_CHANNEL = "INSERT INTO text_channel (channel_name, server_id) VALUES (?, ?);";
	private static final String DELETE_TEXT_CHANNEL ="delete from text_channel where channel_id = ?;";
	private static final String DELETE_TEXT_CHANNEL_ALL = "DELETE FROM text_channel WHERE server_id = ?";
	private Connection cn = null;
	private PreparedStatement pstmt = null;
	private ResultSet rs = null;
	
	private static TextChannelDataDAO tcdao = null;
	
	static {
		tcdao = new TextChannelDataDAO();
	}
	
	public static final TextChannelDataDAO getInstance() {
		return tcdao;
	}
	
	private TextChannelDataDAO() {
		this.cn = MySqlManager.getConnection();
	}
	
	public ArrayList<TextChannelDataBean> findAll() {
		ArrayList<TextChannelDataBean> result = new ArrayList<>();

        try{
            pstmt = cn.prepareStatement(CHANNEL);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                TextChannelDataBean textChannelDataBean = new TextChannelDataBean();
                textChannelDataBean.setChannel_id(rs.getInt("channel_id"));
                textChannelDataBean.setChannel_name(rs.getString("channel_name"));
                textChannelDataBean.setServer_id(rs.getInt("server_id"));
                result.add(textChannelDataBean);   
            }
        } catch (SQLException e){
            e.printStackTrace();
        }
        return result;
	}
	
	
	public TextChannelDataBean findRecord(int channel_id) {
        TextChannelDataBean textChannelDataBean = new TextChannelDataBean();

        try{
            pstmt = cn.prepareStatement(FINDRECORD);
            pstmt.setInt(1,channel_id);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                textChannelDataBean.setChannel_id(rs.getInt("channel_id"));
                textChannelDataBean.setChannel_name(rs.getString("channel_name"));
                textChannelDataBean.setServer_id(rs.getInt("server_id"));
            }
        } catch (SQLException e){
            e.printStackTrace();
        
        }
        return textChannelDataBean;
	}
	
	public Map<Integer, String> findRecords(int server_id) {
		Map<Integer, String> result = new HashMap<>();

        try{
        	this.cn = MySqlManager.getConnection();

            pstmt = cn.prepareStatement(SELECT_CHANNELS);
            pstmt.setInt(1, server_id);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                result.put(rs.getInt("channel_id"), rs.getString("channel_name"));
            }
        } catch (SQLException e){
            e.printStackTrace();
        }
        return result;
	}
	
	public void addTextChannel(String channelName, int serverId) {
		try{
			this.cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(INSERT_TEXT_CHANNEL);
            pstmt.setString(1,channelName);
            pstmt.setInt(2, serverId);
            pstmt.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } 
	}

	
    public int deleteTextChannel(int channelId) {
    	int result = -1;
        try{
        	MessageDataDAO dao = MessageDataDAO.getInstance();
        	dao.deleteChannel(channelId);
        	
        	Connection con = MySqlManager.getConnection();
            pstmt = con.prepareStatement(DELETE_TEXT_CHANNEL);
            pstmt.setInt(1, channelId);
            result = pstmt.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } finally {
        	
            MySqlManager.close();
        }
        return result;
    }
    
    public int deleteTextChannelAll(int server) {
    	int result = -1;
        try{
        	Connection con = MySqlManager.getConnection();
            pstmt = con.prepareStatement(DELETE_TEXT_CHANNEL_ALL);
            pstmt.setInt(1, server);
            result = pstmt.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } finally {
        	
            MySqlManager.close();
        }
        return result;
    }
    
    
	


}

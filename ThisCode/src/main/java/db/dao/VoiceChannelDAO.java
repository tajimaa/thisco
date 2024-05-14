package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import db.mysql.MySqlManager;

public class VoiceChannelDAO {
	private static final String getVoiceChannels ="select * from voice_channel where server_id = ?";
	private static final String INSERT_VOICE_CHANNEL = "INSERT INTO voice_channel (channel_name, server_id) VALUES (?, ?);";
	private static final String DELETE_VOICE_CHANNEL = "delete from voice_channel where channel_id = ?;";
	private static final String DELETE_VOICE_CHANNEL_ALL ="DELETE FROM voice_channel WHERE server_id = ?";
	
	private static VoiceChannelDAO vcdao = null;
	static {
    	vcdao = new VoiceChannelDAO();
    }
	
	public static final VoiceChannelDAO getInstance() {
    	return vcdao;
    }
	
	public Map<Integer, String> getVoiceChannels(int serverId) {
		Map<Integer, String> result = new HashMap<>();
		
		try(	Connection cn = MySqlManager.getConnection();
				PreparedStatement ps = cn.prepareStatement(getVoiceChannels); ){
			
			ps.setInt(1,serverId);
			
			try(ResultSet rs = ps.executeQuery();){
				while(rs.next()) {
					result.put(rs.getInt("channel_id"), rs.getString("channel_name"));
				}
			}

			
		} catch(Exception e) {
			e.printStackTrace();
		}
		return result;
	}
	
	public void addVoiceChannel(String channelName, int serverId) {
		try(Connection cn = MySqlManager.getConnection();
			PreparedStatement ps = cn.prepareStatement(INSERT_VOICE_CHANNEL);
				){
			ps.setString(1,channelName);
			ps.setInt(2, serverId);
			ps.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } 
	}
	
	public int deleteVoiceChannel(int channelId) {
		int result = -1;
        try{
        	Connection con = MySqlManager.getConnection();
        	PreparedStatement pstmt = con.prepareStatement(DELETE_VOICE_CHANNEL);
            pstmt.setInt(1, channelId);
            result = pstmt.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } finally {
            MySqlManager.close();
        }
        return result;
    }
	
	public int deleteVoiceChannelAll(int server) {
		int result = -1;
        try{
        	Connection con = MySqlManager.getConnection();
        	PreparedStatement pstmt = con.prepareStatement(DELETE_VOICE_CHANNEL_ALL);
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

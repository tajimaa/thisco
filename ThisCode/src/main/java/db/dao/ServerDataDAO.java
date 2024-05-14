package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import bean.ServerDataBean;
import db.mysql.MySqlManager;

public class ServerDataDAO { //server表
    private static final String DB_SELECT = "SELECT * FROM server";
    private static final String DB_RECORD = "SELECT * FROM server WHERE server_id = ?";
    private static final String INSERT_NEW_SERVER ="INSERT INTO server (server_name, user_id, server_icon) VALUES (?, ?, ?)";
    private static final String DELETE_SERVER ="DELETE FROM server WHERE server_id = ? ";
    //private Connection cn = null;
    private PreparedStatement pstmt = null;
    private ResultSet rs = null;
    
    private static ServerDataDAO sddao = null;
    
    static {
    	sddao = new ServerDataDAO();
    }
    
    public static final ServerDataDAO getInstance() {
    	return sddao;
    }
    
    private ServerDataDAO() {}

    public ArrayList<ServerDataBean> findAll() {
        ArrayList<ServerDataBean> result = new ArrayList<>();
        try {
        	Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(DB_SELECT);
            rs = pstmt.executeQuery();
            while (rs.next()) {
                ServerDataBean serverDataBean = new ServerDataBean();
                serverDataBean.setServer_id(rs.getInt("server_id"));
                serverDataBean.setServer_name(rs.getString("server_name"));
                serverDataBean.setUser_id(rs.getInt("user_id"));
                serverDataBean.setServer_icon(rs.getString("server_icon"));
                result.add(serverDataBean);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
			MySqlManager.close();
		}
        return result;
    }
    
    public ServerDataBean findRecord(int id) {
    	ServerDataBean serverDataBean = new ServerDataBean();
        try {
        	Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(DB_RECORD);
            pstmt.setInt(1, id);
            rs = pstmt.executeQuery();
            
            if (rs.next()) {	
                serverDataBean.setServer_id(rs.getInt("server_id"));
                serverDataBean.setServer_name(rs.getString("server_name"));
                serverDataBean.setUser_id(rs.getInt("user_id"));
                serverDataBean.setServer_icon(rs.getString("server_icon"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
			MySqlManager.close();
		}
        return serverDataBean;
    }
    
    public String[] getServerNameAndIcon(int id) {
		Connection cn = null;
		PreparedStatement  pstmt = null;
	    ResultSet rs = null;
	    String result[] = new String[2];
	    String SQL = "select server_name, server_icon from server where server_id = ?";
		try {
			cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(SQL);
			pstmt.setInt(1, id);
			rs = pstmt.executeQuery();
			
			if(rs != null && rs.next()) {
				result[0] = rs.getString("server_name");
				result[1] = rs.getString("server_icon");
			}

		} catch(Exception e) {
			e.printStackTrace();
		}finally {
			MySqlManager.close();
		}
		return result;
	}
    
    public int getMaxServerId() {
    	int result = -1;
    	Statement st = null;
    	ResultSet rs = null;
    	try {
    		Connection cn = MySqlManager.getConnection();
    		st = cn.createStatement();
    		rs = st.executeQuery("select max(server_id) AS server_id from server");
    		
    		if (rs.next()) {
    			result = rs.getInt("server_id");
    		}
    	} catch(Exception e) {
    		e.printStackTrace();
    	}finally {
			MySqlManager.close();
		}
    	return result;
    }
    
    public void insertNewServer(String server_name, int user_id, String path) {
		try {
			Connection cn = MySqlManager.getConnection();
			cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(INSERT_NEW_SERVER);
			pstmt.setString(1, server_name);
			pstmt.setInt(2, user_id);
			pstmt.setString(3, path);
			pstmt.executeUpdate();
		
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			MySqlManager.close();
		}
		
	}
    
    public int deleteServer(int serverId) {
    	int result = -1;
        try{
        	Connection con = MySqlManager.getConnection();
        	PreparedStatement pstmt = con.prepareStatement(DELETE_SERVER);
            pstmt.setInt(1, serverId);
            result = pstmt.executeUpdate();
        } catch (SQLException e){
            e.printStackTrace();
        } finally {
            MySqlManager.close();
        }
        return result;
    }

}

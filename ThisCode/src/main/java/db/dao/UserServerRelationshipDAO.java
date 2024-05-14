//us_relationship表
package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import bean.UserServerRelationshipBean;
import db.mysql.MySqlManager;

public class UserServerRelationshipDAO {
	private static final String SERVER_SELECT = "select * from us_relationship"; //これでいいかわからん
	private static final String FINDRECORD = "select * from us_relationship where user_id = ? and server_id = ?";
	private static final String SELECT_PARTICIPATING_SERVER ="select * from us_relationship where user_id = ?";
	private static final String updateSQL ="INSERT INTO us_relationship (user_id, server_id) VALUES (?, ?);";
	private static final String DELETE_RELATIONSHIP_ALL ="delete from us_relationship where server_id = ?";
	
	Connection cn = null;
	PreparedStatement pstmt = null;
	ResultSet rs = null;
	
	private static UserServerRelationshipDAO usrdao = null;
    
    static {
    	usrdao = new UserServerRelationshipDAO();
    }
    
    public static final UserServerRelationshipDAO getInstance() {
    	return usrdao;
    }
	
	private UserServerRelationshipDAO() { 
		this.cn = MySqlManager.getConnection();
	}
	
	public ArrayList<UserServerRelationshipBean> findAll() {
        ArrayList<UserServerRelationshipBean> result = new ArrayList<>();
        
        try{
            pstmt = cn.prepareStatement(SERVER_SELECT);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                UserServerRelationshipBean userServerRelationshipBean = new UserServerRelationshipBean();
                userServerRelationshipBean.setUser_id(rs.getInt("user_id"));
                userServerRelationshipBean.setServer_id(rs.getInt("server_id"));

                result.add(userServerRelationshipBean);
            }
        } catch(SQLException e){
            e.printStackTrace();
        } 
        return result;
    }
	
	public ArrayList<UserServerRelationshipBean> getParticipatingServer(int userId){
		ArrayList<UserServerRelationshipBean> result = new ArrayList<>();
        
        try{
            pstmt = cn.prepareStatement(SELECT_PARTICIPATING_SERVER);
            pstmt.setInt(1, userId);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                UserServerRelationshipBean userServerRelationshipBean = new UserServerRelationshipBean();
                userServerRelationshipBean.setUser_id(rs.getInt("user_id"));
                userServerRelationshipBean.setServer_id(rs.getInt("server_id"));

                result.add(userServerRelationshipBean);
            }
        } catch(SQLException e){
            e.printStackTrace();
        
        }
        return result;
	}
	
	public ArrayList<Integer> getJoinedUsers(int server_id) {
		ArrayList<Integer> result = new ArrayList<>();
		
		Connection cn = null;
		PreparedStatement  pstmt = null;
	    ResultSet rs = null;
	    String SQL = "select user_id from us_relationship where server_id = ?";
	    try {
			cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(SQL);
			pstmt.setInt(1, server_id);
			rs = pstmt.executeQuery();
			
			if(rs != null) {
				while(rs.next()) {
					result.add(rs.getInt("user_id"));
				}
			}
			if (cn != null) {
                try{
                    cn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
		} catch(Exception e) {
			e.printStackTrace();
		}
	    
	    return result;
	}
	
	
	public UserServerRelationshipBean findRecord(int id) {
        UserServerRelationshipBean userServerRelationshipBean = new UserServerRelationshipBean();
        
        try{
            pstmt = cn.prepareStatement(FINDRECORD);
            pstmt.setInt(1, id);
            rs = pstmt.executeQuery();

            while(rs.next()) {
                userServerRelationshipBean.setUser_id(rs.getInt("user_id"));
                userServerRelationshipBean.setServer_id(rs.getInt("server_id"));

            }
        } catch(SQLException e){
            e.printStackTrace();
        }
        return userServerRelationshipBean;
    }

	
	
	public Integer[] getServers(int user_id) {
		ArrayList<Integer> result = new ArrayList<>();

	    String SQL = "select server_id from us_relationship where user_id = ?";
	    try {
			cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(SQL);
			pstmt.setInt(1, user_id);
			rs = pstmt.executeQuery();
			
			if(rs != null) {
				while(rs.next()) {
					result.add(rs.getInt("server_id"));
				}
			}

            
		} catch(Exception e) {
			e.printStackTrace();
		}
	    
	    return result.toArray(new Integer[result.size()]);
	}
	
	
	public void addRelationship(int serverId, int userId) {
		try {
			cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(updateSQL);
			
			pstmt.setInt(1, userId);
			pstmt.setInt(2, serverId);
			pstmt.executeUpdate();

            
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	
    public int deleteRelationshipAll(int serverId) {
    	int result = -1;
        try{
        	Connection con = MySqlManager.getConnection();
        	PreparedStatement pstmt = con.prepareStatement(DELETE_RELATIONSHIP_ALL);
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

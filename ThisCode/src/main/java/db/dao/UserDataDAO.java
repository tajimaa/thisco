package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import bean.UserBean;
import bean.UserDataBean;
import db.mysql.MySqlManager;

//account表
public class UserDataDAO{
    private static final String DB_SELECT = "select * from account where user_id = ?";

    
    private PreparedStatement pstmt = null;
    private static UserDataDAO uddao = null;
    public static boolean errorChecker = false;
    
    static {
    	uddao = new UserDataDAO();
    }
    
    public static final UserDataDAO getInstance() {
    	return uddao;
    }

    //Connectionとってくるコンストラクタ
    private UserDataDAO() {}
    
    //インスタンスをとってくるクラスメソッドの呼び出し
    ServerDataDAO sddao = ServerDataDAO.getInstance();
    UserServerRelationshipDAO usrdao = UserServerRelationshipDAO.getInstance();

    //1行ずつ全部ArrayListにぶち込むメソッド
    public ArrayList<UserDataBean> findAll(int User_Id) {
        ArrayList<UserDataBean> result = new ArrayList<>();

        try {
        	Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(DB_SELECT);
            pstmt.setInt(1, User_Id);
            ResultSet rs = pstmt.executeQuery();

            while(rs.next()) {
            	UserDataBean userDataBean = new UserDataBean();
            	userDataBean.setUser_id(rs.getInt("user_id"));
            	userDataBean.setMailaddress(rs.getString("mailaddress"));
            	userDataBean.setPassword(rs.getString("password"));
            	userDataBean.setUser_name(rs.getString("user_name"));
            	userDataBean.setUser_icon(rs.getString("user_icon"));
                result.add(userDataBean); 
            }

        } catch (SQLException e){
            e.printStackTrace();
        }finally {
			MySqlManager.close();
		}
        return result;
    }
    
    public UserDataBean getUserInfo(int user_id) {
    	UserDataBean userDataBean = new UserDataBean();
    	
    	try {
    		Connection cn = MySqlManager.getConnection();
            pstmt = cn.prepareStatement(DB_SELECT);
            pstmt.setInt(1, user_id);
            ResultSet rs = pstmt.executeQuery();

            if(rs.next()) {
            	userDataBean.setUser_id(rs.getInt("user_id"));
            	userDataBean.setMailaddress(rs.getString("mailaddress"));
            	userDataBean.setPassword(rs.getString("password"));
            	userDataBean.setUser_name(rs.getString("user_name"));
            	userDataBean.setUser_icon(rs.getString("user_icon"));
            }

        } catch (SQLException e){
            e.printStackTrace();
        }finally {
			MySqlManager.close();
		}
    	
        return userDataBean;
    }
    
    //
	public UserBean getRecord(String email) {
	    String SQL="select * from account where mailaddress = ?";
	    
	    UserBean bean = new UserBean();
	    try {
	    	Connection cn =  MySqlManager.getConnection();
			pstmt = cn.prepareStatement(SQL);
			pstmt.setString(1, email);
			ResultSet rst = pstmt.executeQuery();
			
			if(rst != null && rst.next()) {
				
				bean.setUser_id(rst.getInt("user_id"));
				bean.setMailaddress(rst.getString("mailaddress"));
				bean.setPassword(rst.getString("password"));
				bean.setUser_name(rst.getString("user_name"));
				bean.setUser_icon(rst.getString("user_icon"));
				
				for(int num : usrdao.getServers(bean.getUser_id())) {
					
					String info[] = sddao.getServerNameAndIcon(num);
					bean.addRooms(num, info[0], info[1]);
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
		}finally {
			MySqlManager.close();
		}
	    return bean;
	}
	
	public UserBean getRecord(int  userId) {
	    String SQL="select * from account where user_id = ?";
	    
	    UserBean bean = new UserBean();
	    try {
	    	Connection cn = MySqlManager.getConnection();
			pstmt = cn.prepareStatement(SQL);
			pstmt.setInt(1, userId);
			ResultSet rs = pstmt.executeQuery();
			
			if(rs != null && rs.next()) {
				
				bean.setUser_id(rs.getInt("user_id"));
				bean.setMailaddress(rs.getString("mailaddress"));
				bean.setPassword(rs.getString("password"));
				bean.setUser_name(rs.getString("user_name"));
				bean.setUser_icon(rs.getString("user_icon"));
				
				for(int num : usrdao.getServers(bean.getUser_id())) {
					
					String info[] = sddao.getServerNameAndIcon(num);
					bean.addRooms(num, info[0], info[1]);
				}
			}
            
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			MySqlManager.close();
		}
	    return bean;
	}
	
	
	public int insertUser(String user_name, String password, String email) {
		String insert = "INSERT INTO account (mailaddress, password, user_name ) VALUES (?, ?, ?)";
		String select = "select mailaddress from account";
		String select_id ="select user_id from account where mailaddress=?"; 
		Connection cn = MySqlManager.getConnection();
		int flag = -1;
		errorChecker = false;
		Statement st = null;
		try {
			
			System.out.println("insertUser()_"+user_name+":"+password+":"+email);
			if (cn==null) {
				System.out.println("cn:null");
			}
			st = cn.createStatement();
			ResultSet rs = st.executeQuery(select);
			
			if(rs.next()) {
				rs = null;
				pstmt = cn.prepareStatement(insert);
				pstmt.setString(1, email);
				pstmt.setString(2, password);
				pstmt.setString(3, user_name);
				int fla = pstmt.executeUpdate();
				
				if(fla != -1) {
					pstmt = cn.prepareStatement(select_id);
					pstmt.setString(1, email);
					rs = pstmt.executeQuery();
					if(rs.next()) {
						flag = rs.getInt("user_id");
					}
				}
			}
		} catch(Exception e) {
			e.printStackTrace();
			errorChecker = true;
			
		} finally {
			MySqlManager.close();
		}
		return flag;
	}
	
	public int updateIcon(String email, String path) {
		String update = "update account set user_icon=? where mailaddress=?";
	    PreparedStatement ps = null;	    
	    
	    int flag = -1;
	    Connection cn = MySqlManager.getConnection();
		try {
			ps = cn.prepareStatement(update);
			ps.setString(1, path);
			ps.setString(2, email);
			flag = ps.executeUpdate();
			
		} catch(Exception e) {
			e.printStackTrace();
		} finally {
			MySqlManager.close();
		}
		
		return flag;
	}
	
}

package db.mysql;


import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class MySqlManager {
    private static String DATABASE_NAME;
    private static String PROPERTIES;
    private static String URL;

    private static String USER;
    private static String PASS;
    
    private static  Connection conn = null;
    
    
    public static void initConnection() {
		Properties prop = new Properties();
		
		try {
			prop.load(new FileInputStream("C:\\ThisLocal\\ThisCode\\src\\properties\\mysql.properties"));
//			prop.load(new FileInputStream("/usr/local/tomcat8.5/webapps/TestProject/mysql.properties"));
			DATABASE_NAME = prop.getProperty("databaseName");
			PROPERTIES = prop.getProperty("properties");
			URL = prop.getProperty("url");
			USER = prop.getProperty("user");
			PASS = prop.getProperty("pass");
		} catch (Exception e) {
			e.printStackTrace();
		}
    }
		
    public static Connection getConnection() {

        try {
        	initConnection();
            Class.forName("com.mysql.cj.jdbc.Driver");

            conn = DriverManager.getConnection(URL + DATABASE_NAME + PROPERTIES, USER, PASS);
            
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return conn;

    }
    
    public static void close() {
    	try {
    		if(conn != null) {
    			conn.close();
    		}
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

package framework.command;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

import framework.context.RequestContext;

public class CommandFactory {
	@SuppressWarnings({ "deprecation", "finally" })
	public static AbstractCommand getCommand(RequestContext rc) {
		AbstractCommand command = null;
		Properties prop = new Properties();
		
		try {
			prop.load(new FileInputStream("C:\\ThisLocal\\ThisCode\\src\\properties\\commands.properties"));
//			prop.load(new FileInputStream("/usr/local/tomcat8.5/webapps/TestProject/commands.properties"));
			String name = prop.getProperty(rc.getCommandPath());
			Class<?> c = Class.forName(name);
			command = (AbstractCommand) c.newInstance();
			
		} catch (ClassNotFoundException |IOException e) {
			e.printStackTrace();
			command = null;
		} catch (InstantiationException e) {
			e.printStackTrace();
			command = null;
		} catch (IllegalAccessException e) {
			e.printStackTrace();
			command = null;
		} finally {
			return command;
		}
		
	}
}

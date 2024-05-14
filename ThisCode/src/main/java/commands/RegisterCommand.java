package commands;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Random;

import bean.RegisterUserDTO;
import db.dao.UserDataDAO;
import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import util.Sanitizer;
import util.encrypt.Encryption;

public class RegisterCommand extends AbstractCommand {
	private boolean errorChecker = false;
	@Override
	public void execute(RequestContext req, ResponseContext res) {
		String editedImageData = Sanitizer.sanitizing(req.getParameter("editedImage")[0]);
        String username = Sanitizer.sanitizing(req.getParameter("username")[0]);
        String password = Sanitizer.sanitizing(req.getParameter("password")[0]);
        String email = Sanitizer.sanitizing(req.getParameter("email")[0]);
        String hashedPassword = Encryption.hash(password);	//パスワードのハッシュ化
        
        RegisterUserDTO dto = new RegisterUserDTO();
        dto.setEmail(email);
        dto.setUser_name(username);
        dto.setPassword(hashedPassword);
        dto.setUser_icon(editedImageData);

        if(dto.getUser_icon().substring(1) == null) {
        	System.out.println("null");
        } else {
        	System.out.println("not null");
        }
        userRegister(dto);
        if(errorChecker == false) {
        	res.setTarget("fn/login");
    	} else {
			res.setRedirect("/regist.jsp?miss");
			errorChecker = false;
			System.out.println(errorChecker);
		}
	}
	
	private void userRegister(RegisterUserDTO dto) {
		UserDataDAO dao = UserDataDAO.getInstance();
		int flag = dao.insertUser(dto.getUser_name(), dto.getPassword(), dto.getEmail());
		errorChecker = dao.errorChecker;
		if(flag != -1) {
			String path = flag+".jpg";
	        if(!dto.getUser_icon().equals("default")) {
	        	saveBase64Image(dto.getUser_icon(), path);
	        	dao.updateIcon(dto.getEmail(), flag+".jpg");
	        } else {
	        	Random random = new Random();
	            int num = random.nextInt(4) + 1;
	            dao.updateIcon(dto.getEmail(), "default"+num+".png");
	        }
		}
	}
	
	private void saveBase64Image(String base64Data, String fileName) {
        String savePath = "/usr/local/tomcat8.5/webapps/ThisCord/resource/user_icons/" + fileName;
//        /usr/local/tomcat8.5/webapps/ThisCord/resource/server_icons
        try (OutputStream out = new FileOutputStream(savePath)) {
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data.split(",")[1]);
            out.write(imageBytes);
            System.out.println("せいこう");
        } catch (IOException e) {
        	e.printStackTrace();
        }
    }

}

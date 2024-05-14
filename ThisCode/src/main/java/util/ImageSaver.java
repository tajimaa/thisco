package util;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class ImageSaver {
	public static void base64ToImage(String base64Data, String path) {
        try (OutputStream out = new FileOutputStream(path)) {
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data.split(",")[1]);
            out.write(imageBytes);
            System.out.println("画像保存完了");
        } catch (IOException e) {
        	e.printStackTrace();
        }
    }
}

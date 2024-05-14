package javaee.context;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import framework.context.ResponseContext;

public class WebResponseContext implements ResponseContext {
	private Object result;
	private String target;
	private String send_target;
	private HttpServletResponse response;

	public WebResponseContext() {
	}
	
	@Override
	public void setCharacterEncoding(String type) {
		response.setCharacterEncoding(type);
	}
	@Override
	public void setContentType(String type) {
		response.setContentType(type);
	}

	@Override
	public Object getResult() {
		return result;
	}

	@Override
	public String getTarget() {
		return target;
	}

	@Override
	public void setResult(Object bean) {
		result = bean;
	}

	@Override
	public void setTarget(String transferInfo) {
		target = transferInfo;
	}

	@Override
	public void setTargetJsp(String transferInfo) {
		target = "/WEB-INF/jsp/" + transferInfo + ".jsp";
	}

	@Override
	public void setResponse(Object obj) {
		response = (HttpServletResponse) obj;
	}

	@Override
	public Object getResponse() {
		return response;
	}

	@Override
	public PrintWriter getWriter() {
		PrintWriter print = null;
		try {
			print = response.getWriter();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return print;
	}

	@Override
	public void setRedirect(String path) {
		send_target = path;
		
	}

	@Override
	public String getRedirect() {
		return send_target;
	}

	@Override
	public void setStatus(String status) {
		if(status.equals("ok")) {
			response.setStatus(HttpServletResponse.SC_OK);
		}else if(status.equals("ng")) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
		 
	}
}

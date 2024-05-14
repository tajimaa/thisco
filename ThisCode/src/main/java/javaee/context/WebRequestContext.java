package javaee.context;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import framework.context.RequestContext;

public class WebRequestContext implements RequestContext {
	String yellow = "\u001b[00;33m";
	String end    = "\u001b[00m";
	
	private Map<String, String[]> parameters;
	private HttpServletRequest request;
	private HttpSession session;
	
	public WebRequestContext() {}
	
	
	@Override
	public String getDeviceType() {
		String userAgent = request.getHeader("User-Agent");

        // PCかスマートフォンかを判定
        String deviceType = "Unknown";
        if (userAgent != null) {
            userAgent = userAgent.toLowerCase();

            if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
                deviceType = "Smartphone";
            } else {
                deviceType = "PC";
            }
        }
        return deviceType;
	}
	
	@Override
	public String getCommandPath() {		
		String path = request.getRequestURI();
		String target= path.replace("fn", "").replace("ThisCord", "").replace("/","");
		return target;
	}

	@Override
	public String[] getParameter(String key) {
		
		return parameters.get(key);
	}
	

	@Override
	public Object getRequest() {
		return request;
	}

	@Override
	public void setRequest(Object request) {
		this.request = (HttpServletRequest) request;
		this.parameters = this.request.getParameterMap();
		this.session = this.request.getSession(true);
	}
	
	@Override
	public void setAttribute(String param, Object obj) {
		this.request.setAttribute(param, obj);
	}
	
	
	@Override
	public void setSession(Object session) {
		this.session = (HttpSession) session;
	}
	
	@Override
	public void invalidateSession(){
		session.invalidate();
	}
	
	@Override
	public void setAttributeInSession(String key, Object obj) {
		session.setAttribute(key, obj);
	}
	
	@Override
	public Object getAttributeInSession(String key) {
		return session.getAttribute(key);
	}
	
	@Override
	public void invalidate() {
		session.invalidate();
	}
}

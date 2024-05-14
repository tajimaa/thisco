package framework.context;

import java.io.PrintWriter;

public interface ResponseContext {
	public void setContentType(String type);
	public Object getResult();
	public String getTarget();
	public void setResult(Object bean);
	public void setTarget(String transferInfo);
	public void setRedirect(String path);
	public String getRedirect();
	public void setResponse(Object obj);
	public Object getResponse();
	public PrintWriter getWriter();
	public void setTargetJsp(String transferInfo);
	public void setCharacterEncoding(String type);
	public void setStatus(String status);
}

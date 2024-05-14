package javaee.controller;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import framework.command.AbstractCommand;
import framework.command.CommandFactory;
import framework.context.RequestContext;
import framework.context.ResponseContext;
import framework.controller.ApplicationController;
import javaee.context.WebRequestContext;
import javaee.context.WebResponseContext;


public class WebApplicationController implements ApplicationController {
	String yellow = "\u001b[00;33m";
	String end    = "\u001b[00m";
	
	public RequestContext getRequest(Object request) {
		RequestContext reqc = new WebRequestContext();
		reqc.setRequest(request);
		return reqc;
	}
	
	public ResponseContext getResponse(Object response) {
		ResponseContext resc = new WebResponseContext();
		resc.setResponse(response);
		return resc;
	}
	
	public void handleRequest(RequestContext req, ResponseContext res) {
		AbstractCommand command = CommandFactory.getCommand(req);

		System.out.println(yellow+"WebApplicationController.java "+ end +":\t\tコマンドパス="+req.getCommandPath());
		command.execute(req, res);
	}
	
	public void handleResponse(RequestContext reqc, ResponseContext resc) {
		HttpServletRequest req = (HttpServletRequest)reqc.getRequest();
		HttpServletResponse res = (HttpServletResponse)resc.getResponse();
		req.setAttribute("result", resc.getResult());
		
		try {
			if(resc.getTarget() != null) {
				RequestDispatcher rd = req.getRequestDispatcher(resc.getTarget());
				rd.forward(req, res);
			} else if (resc.getRedirect() != null) {
				res.sendRedirect(req.getContextPath()+resc.getRedirect());
			}
			
		} catch(ServletException e) {
			
		} catch(IOException e) {
			
		}
	}
}

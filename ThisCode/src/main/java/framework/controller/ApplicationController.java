package framework.controller;

import framework.context.RequestContext;
import framework.context.ResponseContext;

public interface ApplicationController {
	RequestContext getRequest(Object request);
	ResponseContext getResponse(Object response);
	void handleRequest(RequestContext req, ResponseContext res);
	void handleResponse(RequestContext req, ResponseContext res);
}

package framework.command;

import framework.context.RequestContext;
import framework.context.ResponseContext;

public abstract class AbstractCommand {
	public abstract void execute(RequestContext req, ResponseContext res);
}

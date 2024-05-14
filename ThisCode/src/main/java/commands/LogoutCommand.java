package commands;

import framework.command.AbstractCommand;
import framework.context.RequestContext;
import framework.context.ResponseContext;

public class LogoutCommand extends AbstractCommand {

    @Override
    public void execute(RequestContext req, ResponseContext res) {

        req.invalidate(); // セッションを無効化

        res.setRedirect("/login.html");
    }
}

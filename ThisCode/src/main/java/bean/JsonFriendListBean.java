package bean;

import java.io.Serializable;
import java.util.ArrayList;

public class JsonFriendListBean implements Serializable {

    private ArrayList<UserDataBean> friendList;

    public ArrayList<UserDataBean> getFriendList() {
        return friendList;
    }

    public void setFriendList(ArrayList<UserDataBean> friendList) {
        this.friendList = friendList;
    }
}

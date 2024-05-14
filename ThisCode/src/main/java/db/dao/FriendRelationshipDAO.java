package db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import db.mysql.MySqlManager;

public class FriendRelationshipDAO {
	private final String SELECT_FRIEND_LIST = "SELECT user_id1, user_id2 FROM friend_relationship WHERE user_id1 = ? OR user_id2 = ?";
	private final String INSERT_FRIEND = "INSERT INTO friend_relationship (user_id1, user_id2, flag) VALUES (?, ?, true);";
	private final String SELECT_RELATION_ID = "SELECT relation_id FROM friend_relationship WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id2 = ? AND user_id1 = ?)";

	private static FriendRelationshipDAO dao = null;
	static {
		dao = new FriendRelationshipDAO();
	}

	public static FriendRelationshipDAO getInstance() {
		return dao;
	}

	private FriendRelationshipDAO() {
	}

	//フレンドリストを取得する
	public ArrayList<Integer> getFriendList(int userId) {
		ArrayList<Integer> result = new ArrayList<>();

		try (Connection cn = MySqlManager.getConnection();
				PreparedStatement ps = cn.prepareStatement(SELECT_FRIEND_LIST);) {

			ps.setInt(1, userId);
			ps.setInt(2, userId);

			try (ResultSet rs = ps.executeQuery();) {
				while (rs.next()) {
					//user_id1からuser_id2どちらかの自分以外を取得する
					if (rs.getInt("user_id1") == userId) {
						result.add(rs.getInt("user_id2"));
					} else {
						result.add(rs.getInt("user_id1"));
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}

	//フレンドを登録する
	public int insertFriend(int userId, int friendId) {
		int result = -1;
		ArrayList<Integer> friendList = getFriendList(userId);
		if (!friendList.contains(friendId)) {
			try (Connection cn = MySqlManager.getConnection();
					PreparedStatement ps = cn.prepareStatement(INSERT_FRIEND);) {

				ps.setInt(1, userId);
				ps.setInt(2, friendId);

				result = ps.executeUpdate();

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return result;

	}

	//自分とフレンドのIDで個人チャットのデータを持ってくるためのrelation_idを取得する関数
	public int getRelationID(int userId1, int userId2) {
		int result = -1;

		try (Connection cn = MySqlManager.getConnection();
				PreparedStatement ps = cn.prepareStatement(SELECT_RELATION_ID);) {

			ps.setInt(1, userId1);
			ps.setInt(2, userId2);
			ps.setInt(3, userId1);
			ps.setInt(4, userId2);

			try (ResultSet rs = ps.executeQuery();) {
				while (rs.next()) {
					result = rs.getInt("relation_id");
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}

}
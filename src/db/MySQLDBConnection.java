package db;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import model.Restaurant;

import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import yelp.YelpAPI;

public class MySQLDBConnection implements DBConnection {
	// May ask for implementation of other methods. Just add empty body to them.

	private Connection conn;
	private static final int MAX_RECOMMENDED_RESTAURANTS = 10;

	public MySQLDBConnection() {
		try {
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			conn = DriverManager.getConnection(DBUtil.URL);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void close() {
		if (conn != null) {
			try {
				conn.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private boolean executeUpdateStatement(String query) {
		if (conn == null) {
			return false;
		}
		try {
			Statement stmt = conn.createStatement();
			//System.out.println("\nDBConnection executing query:\n" + query);
			stmt.executeUpdate(query);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	private ResultSet executeFetchStatement(String query) {
		if (conn == null) {
			return null;
		}
		try {
			Statement stmt = conn.createStatement();
			//System.out.println("\nDBConnection executing query:\n" + query);
			return stmt.executeQuery(query);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public Boolean verifyUserId(String userId) {
		try {
			if (conn == null) {
				return false;
			}
			String sql = "SELECT user_id from users WHERE user_id=?";
			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString( 1, userId);  
			ResultSet rs = pstmt.executeQuery();
			
			if (rs.next()) {
				return true;
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return false;
	}
	
	@Override
	public Boolean signupLogin(String userId, String password, 
			String firstName, String lastName) {
		try {
			if (conn == null) {
				return false;
			}
			if (!verifyUserId(userId)) {
				String sql = "INSERT INTO users VALUES (?,?,?,?)";
				PreparedStatement pstmt = conn.prepareStatement( sql );
				pstmt.setString( 1, userId); 
				pstmt.setString( 2, password);
				pstmt.setString( 3, firstName); 
				pstmt.setString( 4, lastName); 
				pstmt.executeUpdate();
				return true;
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return false;
	}
	
	@Override
	public Boolean verifyLogin(String userId, String password) {
		try {
			if (conn == null) {
				return false;
			}
			//String sql = "SELECT user_id from users WHERE user_id='" + userId + "' and password='" + password + "'";
			//ResultSet rs = executeFetchStatement(sql);

			String sql = "SELECT user_id from users WHERE user_id=? and password=?";
			PreparedStatement pstmt = conn.prepareStatement( sql );
			pstmt.setString( 1, userId); 
			pstmt.setString( 2, password); 
			ResultSet rs = pstmt.executeQuery();
			
			if (rs.next()) {
				return true;
			}
		} catch (Exception e) {
			System.out.println("found error");
			System.out.println(e.getMessage());
		}
		System.out.println("false");
		return false;
	}

	@Override
	public String getFirstLastName(String userId) {
		String name = "";
		try {
			if (conn != null) {
				String sql = "SELECT first_name, last_name from users WHERE user_id='" + userId + "'";
				ResultSet rs = executeFetchStatement(sql);
				if (rs.next()) {
					name += rs.getString("first_name") + " " + rs.getString("last_name");
				}
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return name;
	}

	@Override
	public JSONArray searchRestaurants(String userId, double lat, double lon) {
		try {
			// clear previous search results
			//executeUpdateStatement("DELETE FROM restaurants");
			YelpAPI api = new YelpAPI();
			JSONObject response = new JSONObject(api.searchForBusinessesByLocation(lat, lon));
			JSONArray array = (JSONArray) response.get("businesses");

			JSONArray list = new JSONArray();
			Set<String> visited = getVisitedRestaurants(userId);

			for (int i = 0; i < array.length(); i++) {
				JSONObject object = array.getJSONObject(i);
				Restaurant restaurant = new Restaurant(object);
				String businessId = restaurant.getBusinessId();
				String name = restaurant.getName();
				String categories = restaurant.getCategories();
				String city = restaurant.getCity();
				String state = restaurant.getState();
				String fullAddress = restaurant.getFullAddress();
				double stars = restaurant.getStars();
				double latitude = restaurant.getLatitude();
				double longitude = restaurant.getLongitude();
				String imageUrl = restaurant.getImageUrl();
				String url = restaurant.getUrl();
				JSONObject obj = restaurant.toJSONObject();
				if (visited.contains(businessId)) {
					obj.put("is_visited", true);
				} else {
					obj.put("is_visited", false);
				}
				executeUpdateStatement("INSERT IGNORE INTO restaurants " + "VALUES ('" + businessId + "', \"" + name
						+ "\", \"" + categories + "\", \"" + city + "\", \"" + state + "\", " + stars + ", \""
						+ fullAddress + "\", " + latitude + "," + longitude + ",\"" + imageUrl + "\", \"" + url
						+ "\")");
				list.put(obj);
			}
			return list;
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return null;
	}
	
	@Override
	public Set<String> getVisitedRestaurants(String userId) {
		Set<String> visitedRestaurants = new HashSet<String>();
		try {
			String sql = "SELECT business_id from history WHERE user_id=" + userId;
			ResultSet rs = executeFetchStatement(sql);
			while (rs.next()) {
				String visitedRestaurant = rs.getString("business_id");
				visitedRestaurants.add(visitedRestaurant);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return visitedRestaurants;
	}

	@Override
	public boolean setVisitedRestaurants(String userId, List<String> businessIds) {
		boolean result = true;
		for (String businessId : businessIds) {
			// INSERT INTO history (`user_id`, `business_id`) VALUES ("1111",
			// "abcd");
			if (!executeUpdateStatement("INSERT INTO history (`user_id`, `business_id`) VALUES (\"" + userId + "\", \""
					+ businessId + "\")")) {
				result = false;
			}
		}
		return result;

	}

	@Override
	public void unsetVisitedRestaurants(String userId, List<String> businessIds) {
		for (String businessId : businessIds) {
			executeUpdateStatement("DELETE FROM history WHERE `user_id`=\"" + userId + "\" and `business_id` = \""
					+ businessId + "\"");
		}

	}

	@Override
	public Set<String> getCategories(String businessId) {
		try {
			String sql = "SELECT categories from restaurants WHERE business_id='" + businessId + "'";
			ResultSet rs = executeFetchStatement(sql);
			if (rs.next()) {
				Set<String> set = new HashSet<>();
				String[] categories = rs.getString("categories").split(",");
				for (String category : categories) {
					// ' Japanese ' -> 'Japanese'
					set.add(category.trim());
				}
				return set;
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return new HashSet<String>();
	}

	@Override
	public List<String> getBusinessId(Set<String> categories, double lat, double lon) {
		List<String> res = new ArrayList<>();
		final String distRange = "0.002"; 
		try {
			// if category = Chinese, categories = Chinese, Korean, Japanese,
			// it's a match
			StringBuilder sql = new StringBuilder();
			boolean firstCategory = true;
			//System.out.println(categories);
			sql.append("SELECT business_id FROM (SELECT business_id, POWER(ABS(latitude-" + lat);
			sql.append("), 2) + POWER(ABS(longitude-" + lon);
			sql.append("), 2) as dist from restaurants WHERE");
			for (String category : categories) {
				if (firstCategory) {
					firstCategory = false;
				} else {
					sql.append(" OR");
				}
				sql.append(" categories LIKE '%" + category + "%'");
			}
			sql.append(" ORDER BY stars DESC, dist) as filter WHERE filter.dist < ");
			sql.append(distRange);
			ResultSet rs = executeFetchStatement(sql.toString());
			while (rs.next()) {
				String businessId = rs.getString("business_id");
				res.add(businessId);
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return res;
	}

	@Override
	public JSONObject getRestaurantsById(String businessId, boolean isVisited) {
		try {
			String sql = "SELECT * from " + "restaurants where business_id='" + businessId + "'";
			ResultSet rs = executeFetchStatement(sql);
			if (rs.next()) {
				Restaurant restaurant = new Restaurant(rs.getString("business_id"), rs.getString("name"),
						rs.getString("categories"), rs.getString("city"), rs.getString("state"),
						rs.getString("full_address"), rs.getFloat("stars"), rs.getFloat("latitude"),
						rs.getFloat("longitude"), rs.getString("image_url"), rs.getString("url"));
				JSONObject obj = restaurant.toJSONObject();
				obj.put("is_visited", isVisited);
				return obj;
			}
		} catch (Exception e) { /* report an error */
			System.out.println(e.getMessage());
		}
		return null;
	}

	@Override
	public JSONArray recommendRestaurants(String userId, double lat, double lon) {
		try {
			// Step 1
			Set<String> visitedRestaurants = getVisitedRestaurants(userId);
			// Step 2
			Set<String> allCategories = new HashSet<>();// why hashSet?
			for (String restaurant : visitedRestaurants) {
				allCategories.addAll(getCategories(restaurant));
			}
			// Step 3
			// Recommendation algorithm: sort by stars then by distance
			 List<String> allRestaurants = getBusinessId(allCategories, lat, lon);
			// Step 4
			JSONArray diff = new JSONArray();
			int count = 0;
			for (String businessId : allRestaurants) {
				// Perform filtering
				if (!visitedRestaurants.contains(businessId)) {
					diff.put(getRestaurantsById(businessId, false));
					count++;
					if (count >= MAX_RECOMMENDED_RESTAURANTS) {
						break;
					}
				}
			}
			// Step 5
			return diff;
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return null;
	}
}
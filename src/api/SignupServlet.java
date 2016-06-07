package api;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONException;
import org.json.JSONObject;

import db.DBConnection;
import db.MySQLDBConnection;

/**
 * Servlet implementation class SignupServlet
 */
@WebServlet("/SignupServlet")
public class SignupServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final DBConnection connection = new MySQLDBConnection();

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public SignupServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		try {
	   		JSONObject input = RpcParser.parseInput(request);
	   		if (input.has("user_id") && input.has("password") &&
	   				input.has("firstName") && input.has("lastName")) {
	   			JSONObject msg = new JSONObject();
	   			String user = (String) input.get("user_id");
	   			String pwd = (String) input.get("password");
	   			String firstName = (String) input.get("firstName");
	   			String lastName = (String) input.get("lastName");
	   			
	   			if (connection.signupLogin(user, pwd, firstName, lastName)) {
	   				msg.put("status", "OK");
	   			} else {
	   				response.setStatus(401);
	   			}
	   			RpcParser.writeOutput(response, msg);
	   		}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}

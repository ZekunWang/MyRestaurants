package api;

import java.io.BufferedReader;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class RpcParser {

    public static class MyComparator implements Comparator<JSONObject> {
    	private String keyword;
    	
    	public MyComparator(String keyword) {
    		this.keyword = keyword;
    	}

		@Override
		public int compare(JSONObject ob1, JSONObject ob2) {
			try {
				return ob1.getString(keyword).compareTo(ob2.getString(keyword));
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return 0;
		}
    }
    
    public static void sortJSON(List<JSONObject> list, String keyword) {
    	Collections.sort(list, new MyComparator(keyword));
    }
    
	public static JSONObject parseInput(HttpServletRequest request) {
		StringBuffer sb = new StringBuffer();
		String line = null;
		try {
			BufferedReader reader = request.getReader();
			line = reader.readLine();
			while (line != null) {
				sb.append(line);
				line = reader.readLine();
			}
			reader.close();
			return new JSONObject(sb.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public static void writeOutput(HttpServletResponse response, JSONObject obj) {
	   	 try {   		 
	   		 response.setContentType("application/json");
	   		 response.addHeader("Access-Control-Allow-Origin", "*");
	   		 PrintWriter out = response.getWriter();
	   		 out.print(obj);
	   		 out.flush();
	   		 out.close();
	   	 } catch (Exception e) {
	   		 e.printStackTrace();
	   	 }    
	}
	    
	public static void writeOutput(HttpServletResponse response, JSONArray array) {
		 try {   		 
	   		 response.setContentType("application/json");
	   		 response.addHeader("Access-Control-Allow-Origin", "*");
	   		 PrintWriter out = response.getWriter();
	   		 out.print(array);
	   		 out.flush();
	   		 out.close();
	   	 } catch (Exception e) {
	   		 e.printStackTrace();
	   	 }    
	 }
}

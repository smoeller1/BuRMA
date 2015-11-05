package edu.umkc.mongorestapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.servlets.CrossOriginFilter;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONObject;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.WriteResult;

/**
 * Servlet implementation class UserServlet
 */
@WebServlet("/user")
public class UserServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	CrossOriginFilter cors = new CrossOriginFilter();
        
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UserServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    private void runDbQuery(DBCollection users, BasicDBObject queryObj, BasicDBObject results) {
    	System.out.println("UserServlet: runDbQuery: Starting");
    	DBCursor docs = users.find(queryObj);
    	try {
    		if (docs.hasNext()) { //we will only support pulling a single user for now
    			DBObject thisResult = docs.next();
    			results.putAll(thisResult);
    		}
    	} finally {
    		docs.close();
    	}
    	System.out.println("UserServlet: runDbQuery: Finished");
    }
    
    private void authenticateUser(JSONObject returnObj, DBCollection users, Map<String,String[]> queryStr) {
    	System.out.println("UserServlet: authenticateUser: Starting");
		if (checkNullUP(queryStr)) {
			returnObj.put("status", "ERROR");
			returnObj.put("statusreason", "Username and password are required");
			return;
		}
		
		BasicDBObject queryObj = new BasicDBObject("name", queryStr.get("username")[0].toString());
		BasicDBObject queryResults = new BasicDBObject();
		runDbQuery(users, queryObj, queryResults);
		
		if (queryResults.get("password").toString().equals(queryStr.get("password")[0].toString())) {
			System.out.println("UserServlet: authenticateUser: User successfully authenticated");
			returnObj.put("status", "SUCCESS");
			returnObj.put("statusreason", "User authenticated");
			returnObj.put("email", queryResults.get("email").toString());
		} else {
			System.out.println("UserServlet: authenticateUser: User failed authentication: "
					+ queryResults.get("password").toString() + " != " + queryStr.get("password")[0].toString());
			returnObj.put("status", "FAILED");
			returnObj.put("statusreason", "invalid password");
		}
		System.out.println("UserServlet: authenticateUser: Finished");
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		StringBuilder buffer = new StringBuilder();
		BufferedReader reader = request.getReader();
		String line;
		while ((line = reader.readLine()) != null) {
			System.out.println("UserServlet: doGet: partial buffer data: " + line + " :end");
			buffer.append(line);
		}
		String data = buffer.toString();
		System.out.println("UserServlet: doGet: Put buffer: " + data);
		
		Map<String,String[]> queryStr = request.getParameterMap();
		System.out.println("UserServlet: doGet: Recieved queryStr: " + queryStr.toString());

		MongoClientURI uri = new MongoClientURI("mongodb://mongodbi:password@ds035004.mongolab.com:35004/quasily");
		MongoClient client = new MongoClient(uri);
		DB db = client.getDB(uri.getDatabase());
		DBCollection users = db.getCollection("CS5551");

		JSONObject returnObj = new JSONObject();
		
		if (queryStr.get("requesttype") == null) {
			returnObj.put("status", "ERROR");
			returnObj.put("statusreason", "No request type submitted");
		} else {	
			switch (queryStr.get("requesttype")[0].toCharArray()[0]) {
			case '1':
				authenticateUser(returnObj, users, queryStr);
				break;
			case '2':
				if (data.isEmpty()) {
					System.out.println("ERROR: No PUT data for case 2");
				} else {
					JSONObject putData = (JSONObject) JSON.parse(data);
					createNewUser(returnObj, users, queryStr, putData);
				}
				break;
			case '3':
				if (data.isEmpty()) {
					System.out.println("ERROR: No PUT data for case 3");
				} else {
					JSONObject putData = (JSONObject) JSON.parse(data);
					updatePassword(returnObj, users, queryStr, putData);
				}
				break;
			case '4':
				deleteAccount(returnObj, users, queryStr);
				break;
			default:
				System.out.println("UserServlet: doGet: Unknown request type: " + queryStr.get("requesttype")[0].toString());
				returnObj.put("status", "ERROR");
				returnObj.put("statusreason", "Unknown request type");
				break;
			}
		}
		
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
		response.setHeader("Access-Control-Allow-Headers", "x-requested-with");
		response.setHeader("Access-Control-Max-Age",  "86400");
		response.getWriter().append(returnObj.toString());
		
		/* response.getWriter().write(docs.toArray().toString());
		response.getWriter().append("Served at: ").append(request.getContextPath()); */
	}

	private void deleteAccount(JSONObject returnObj, DBCollection users, Map<String, String[]> queryStr) {
		System.out.println("UserServlet: deleteAccount: Starting");
		if (checkNullUP(queryStr)) {
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", "Username and password required");
			return;
		}
		
		JSONObject validateUser = new JSONObject();
		authenticateUser(validateUser, users, queryStr);
		if (validateUser.get("status").toString().equals("SUCCESS")) {
			//Do nothing
		} else {
			returnObj.put("status",  "FAIL");
			returnObj.put("statusreason", validateUser.get("statusreason").toString());
			return;
		}
		
		BasicDBObject search = new BasicDBObject("name", queryStr.get("username")[0].toString());
		WriteResult result = users.remove(search);
		returnObj.put("status", "SUCCESS");
		returnObj.put("statusreason", "Account deleted");
		System.out.println("UserServlet: deleteAccount: Delete result: " + result.toString());
		
		System.out.println("UserServlet: deleteAccount: Finished");
	}

	private void updatePassword(JSONObject returnObj, DBCollection users, Map<String, String[]> queryStr, JSONObject putData) {
		System.out.println("UserServlet: updatePassword: Starting");
		if (checkNullUP(queryStr)) {
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", "Username and password required");
			return;
		}
		if (putData.get("newpassword") == null) {
			System.out.println("UserServlet: updatePassword: New password is null");
			returnObj.put("status",  "FAIL");
			returnObj.put("statusreason", "New password is required");
			return;
		}
		
		JSONObject validateUser = new JSONObject();
		authenticateUser(validateUser, users, queryStr);
		if (validateUser.get("status").toString().equals("SUCCESS")) {
			//Do nothing
		} else {
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", validateUser.get("statusreason").toString());
			return;
		}
		
		BasicDBObject search = new BasicDBObject("name", queryStr.get("username")[0].toString());
		BasicDBObject update = new BasicDBObject("$set", new BasicDBObject("password", putData.get("newpassword")));
		WriteResult result = users.update(search, update);
		returnObj.put("status", "SUCCESS");
		returnObj.put("statusreason", "Password updated");
		System.out.println("UserServlet: updatePassword: Update result: " + result.toString());
		
		System.out.println("UserServlet: updatePassword: Finished");
	}
	
	private boolean checkNullUP(Map<String, String[]> queryStr) {
		System.out.println("UserServlet: checkNullUP: Starting");
    	if (queryStr.get("username") == null) {
			System.out.println("UserServlet: checkNullUP: Username is null");
			return true;
		}
		if (queryStr.get("password") == null) {
			System.out.println("UserServlet: checkNullUP: Password is null");
			return true;
		}
		System.out.println("UserServlet: checkNullUP: Starting");
		return false;
	}

	private void createNewUser(JSONObject returnObj, DBCollection users, Map<String, String[]> queryStr, JSONObject putData) {
		System.out.println("UserServlet: createNewUser: Starting");
		if (checkNullUP(queryStr)) {
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", "Username and password required");
			return;
		}
		if (putData.get("email") == null) {
			System.out.println("UserServlet: createNewUser: Email is null");
			returnObj.put("status",  "FAIL");
			returnObj.put("statusreason", "Email is required");
			return;
		}
		if (queryStr.get("password")[0].equals(putData.get("password2"))) {
			//good, do nothing
		} else {
			System.out.println("UserServlet: createNewUser: Passwords don't match: " + queryStr.get("password")[0].toString() + "/" + putData.get("password2"));
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", "Passwords do not match");
			return;
		}
		
		BasicDBObject queryObj = new BasicDBObject("name", queryStr.get("username")[0].toString());
		BasicDBObject queryResults = new BasicDBObject();
		runDbQuery(users, queryObj, queryResults);
		if (queryResults.isEmpty()) {
			BasicDBObject insert = new BasicDBObject("name", queryStr.get("username")[0].toString());
			insert.put("password", queryStr.get("password")[0].toString());
			insert.put("email", putData.get("email"));
			if (putData.get("address") != null) {
				System.out.println("UserServlet: createNewUser: Address is included: " + putData.get("address").toString());
				try {
					JSONObject address = (JSONObject) JSON.parse(putData.get("address").toString());
					insert.put("address", address);
				} catch (NullPointerException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			WriteResult result = users.insert(insert);
			returnObj.put("status", "SUCCESS");
			returnObj.put("statusreason", "New user added");
			System.out.println("UserServlet: createNewUser: Insert result: " + result.toString());
		} else {
			returnObj.put("status", "FAIL");
			returnObj.put("statusreason", "User already exists");
			System.out.println("UserServlet: createNewUser: Insert failed - user already exists");
		}
		
		System.out.println("UserServlet: createNewUser: Finished");
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}

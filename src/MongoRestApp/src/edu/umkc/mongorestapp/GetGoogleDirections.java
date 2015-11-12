package edu.umkc.mongorestapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class GetGoogleDirections {
	private String startLoc;
	private String endLoc;
	private String waypoint;
	
	public GetGoogleDirections(String startLoc, String endLoc) {
		super();
		this.startLoc = startLoc;
		this.endLoc = endLoc;
	}

	public GetGoogleDirections(String startLoc, String endLoc, String waypoint) {
		super();
		this.startLoc = startLoc;
		this.endLoc = endLoc;
		this.waypoint = waypoint;
	}
	
	public void setWaypoint(String waypoint) {
		this.waypoint = waypoint;
	}

	public JSONObject getDirections() throws IOException{
		String url = "https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyAu_MQiOajO2EJJbjWUKHPZQqkcygqzF2E&origin="+startLoc+"&destination="+endLoc;
		if (!waypoint.isEmpty()) {
			url.concat("&waypoints="+waypoint);
		}
		URL googleMaps = new URL(url);
		URLConnection gmc = googleMaps.openConnection();
		BufferedReader in = new BufferedReader(new InputStreamReader(gmc.getInputStream()));
		String inputData;
		String jsonData = "";
		while ((inputData = in.readLine()) != null) {
			jsonData.concat(inputData);
		}
		in.close();
		JSONObject route = (JSONObject) JSON.parse(jsonData);
		JSONObject routes = (JSONObject) route.get("routes");
		JSONArray legsArr = (JSONArray) routes.get("legs");
		int TotalTime = 0;
		int TotalDistance = 0;
		for (int i = 0; i < legsArr.size(); i++) {
			JSONObject tmpObj = (JSONObject) legsArr.get(i);
			JSONObject duration = (JSONObject) tmpObj.get("duration");
			JSONObject distance = (JSONObject) tmpObj.get("distance");
			TotalTime += Integer.parseInt(duration.get("value").toString());
			TotalDistance += Integer.parseInt(distance.get("value").toString());
		}
		route.put("TotalTime", TotalTime);
		route.put("TotalDistance", TotalDistance);
		return route;
	}
}

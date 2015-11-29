package edu.umkc.mongorestapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import com.ibm.json.java.JSONObject;

public class GetBingDirections {
	private String startLoc;
	private String endLoc;
	private String waypoint;
	
	public GetBingDirections(String startLoc, String endLoc) {
		super();
		this.startLoc = startLoc;
		this.endLoc = endLoc;
	}

	public GetBingDirections(String startLoc, String endLoc, String waypoint) {
		super();
		this.startLoc = startLoc;
		this.endLoc = endLoc;
		this.waypoint = waypoint;
	}

	public void setWaypoint(String waypoint) {
		this.waypoint = waypoint;
	}
	
	public JSONObject getDirections() throws IOException{
		String url = "http://dev.virtualearth.net/REST/v1/Routes/Driving?key=An5k009sPgQ-Odp-SJ0ueRBn9VKH-0IhwMLAi5aFTa0iTfY4Yk7XYKzTl5nBAm1P";
		url = url + "&waypoint.1="+startLoc;
		if (waypoint != null) {
			url = url + "&waypoint.2="+waypoint+"&waypoint.3="+endLoc;
		} else {
			url = url + "&waypoint.2="+endLoc;
		}
		System.out.println("GetBingDirections: getDirections: using URL: " + url);
		
		URL bingMaps = new URL(url);
		URLConnection bmc = bingMaps.openConnection();
		BufferedReader in = new BufferedReader(new InputStreamReader(bmc.getInputStream()));
		String inputData;
		String jsonData = "";
		while ((inputData = in.readLine()) != null) {
			//System.out.println("GetGoogleDirections: getDirections: partial data read: "+inputData);
			jsonData += inputData;
		}
		in.close();
		System.out.println("GetBingDirections: getDirections: finished reading remote URL");
		
		JSONObject route = new JSONObject();
		return route;
	}
}

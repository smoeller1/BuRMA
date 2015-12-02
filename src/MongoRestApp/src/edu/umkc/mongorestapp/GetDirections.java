package edu.umkc.mongorestapp;

import java.io.IOException;

import com.ibm.json.java.JSONObject;

public class GetDirections {
	private String startLoc;
	private String endLoc;
	private String waypoint;
	private int routePref;
	
	
	public GetDirections(String startLoc, String endLoc) {
		super();
		this.startLoc = startLoc;
		this.endLoc = endLoc;
		this.routePref = 1;
	}
	
	public String getStartLoc() {
		return startLoc;
	}
	public void setStartLoc(String startLoc) {
		this.startLoc = startLoc;
	}
	public String getEndLoc() {
		return endLoc;
	}
	public void setEndLoc(String endLoc) {
		this.endLoc = endLoc;
	}
	public String getWaypoint() {
		return waypoint;
	}
	public void setWaypoint(String waypoint) {
		this.waypoint = waypoint;
	}
	public void setRoutePref(int routePref) {
		this.routePref = routePref;
	}
	
	public JSONObject getDirections(JSONObject fullRoute) throws IOException {
		//Query Google first
		GetGoogleDirections googleRoute = new GetGoogleDirections(startLoc, endLoc);
		if (waypoint != null) {
			googleRoute.setWaypoint(waypoint);
		}
		JSONObject googleDirections = googleRoute.getDirections(fullRoute);
		System.out.println("GetDirections: getDirections: fullRoute size from Google: "+fullRoute.size());
		
		GetBingDirections bingRoute = new GetBingDirections(startLoc, endLoc);
		if (waypoint != null) {
			bingRoute.setWaypoint(waypoint);
		}
		JSONObject bingDirections = bingRoute.getDirections();
		
		System.out.println("GetDirections: getDirections: Google time: " + googleDirections.get("TotalTime") + ", Bing time: " + bingDirections.get("TotalTime"));
		
		if (routePref == 2) { //Need to find shortest distance
			if (Integer.parseInt(googleDirections.get("TotalDistance").toString()) > Integer.parseInt(bingDirections.get("TotalDistance").toString())) {
				System.out.println("GetDirections: getDirections: selecting Bing as shortest route");
				return bingDirections;
			} else {
				System.out.println("GetDirections: getDirections: selecting Google as shortest route");
				return googleDirections;
			}
		} else { //Default to shortest distance
			if (Integer.parseInt(googleDirections.get("TotalTime").toString()) > Integer.parseInt(bingDirections.get("TotalTime").toString())) {
				System.out.println("GetDirections: getDirections: selecting Bing as fastest route");
				return bingDirections;
			} else {
				System.out.println("GetDirections: getDirections: selecting Google as fastest route");
				return googleDirections;
			}
		}
	}

}

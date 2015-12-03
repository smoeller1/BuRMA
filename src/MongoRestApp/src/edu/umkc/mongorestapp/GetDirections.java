package edu.umkc.mongorestapp;

import java.io.IOException;

import com.ibm.json.java.JSONArray;
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
		JSONObject googleFullRoute = new JSONObject();
		JSONObject googleDirections = googleRoute.getDirections(googleFullRoute);
		System.out.println("GetDirections: getDirections: fullRoute size from Google: "+fullRoute.size());
		
		GetBingDirections bingRoute = new GetBingDirections(startLoc, endLoc);
		if (waypoint != null) {
			bingRoute.setWaypoint(waypoint);
		}
		JSONObject bingFullRoute = new JSONObject();
		JSONObject bingDirections = bingRoute.getDirections(bingFullRoute);
		
		System.out.println("GetDirections: getDirections: Google time: " + googleDirections.get("TotalTime") + ", Bing time: " + bingDirections.get("TotalTime"));
		
		return FindBestRoute(googleDirections, googleFullRoute, bingDirections, bingFullRoute);
	}

	private JSONObject FindBestRoute(JSONObject googleDirections, JSONObject googleFull, JSONObject bingDirections, JSONObject bingFull) {
		JSONObject finalRoute = new JSONObject();
		
		if (routePref == 2) { //Need to find shortest distance
			if (Integer.parseInt(googleDirections.get("TotalDistance").toString()) > Integer.parseInt(bingDirections.get("TotalDistance").toString())) {
				System.out.println("GetDirections: getDirections: selecting Bing as shortest route");
				finalRoute.put("TotalTime", bingDirections.get("TotalTime"));
				finalRoute.put("TotalDistance", bingDirections.get("TotalTime"));
				finalRoute.put("route", GetMinRouteWaypoints((JSONArray) googleFull.get("route"), (JSONArray) bingFull.get("route")));
			} else {
				System.out.println("GetDirections: getDirections: selecting Google as shortest route");
				finalRoute.put("TotalTime",  googleDirections.get("TotalTime"));
				finalRoute.put("TotalDistance", googleDirections.get("TotalDistance"));
				finalRoute.put("route", googleDirections.get("route"));
			}
		} else { //Default to shortest distance
			if (Integer.parseInt(googleDirections.get("TotalTime").toString()) > Integer.parseInt(bingDirections.get("TotalTime").toString())) {
				System.out.println("GetDirections: getDirections: selecting Bing as fastest route");
				finalRoute.put("TotalTime", bingDirections.get("TotalTime"));
				finalRoute.put("TotalDistance", bingDirections.get("TotalTime"));
				finalRoute.put("route", GetMinRouteWaypoints((JSONArray) googleFull.get("route"), (JSONArray) bingFull.get("route")));
			} else {
				System.out.println("GetDirections: getDirections: selecting Google as fastest route");
				finalRoute.put("TotalTime",  googleDirections.get("TotalTime"));
				finalRoute.put("TotalDistance", googleDirections.get("TotalDistance"));
				finalRoute.put("route", googleDirections.get("route"));
			}
		}
		
		return finalRoute;
	}

	/* Uses direction vectors to see if the two routes are diverging.
	 * If they are diverging, then we need to add an additional waypoint to force them to converge
	 * If they are not diverging, then there is nothing we need to do
	 * 
	 * (google|bing)Route : [ "TotalDistance" : (int) meters,
	 *  			   "TotalTime" : (int) seconds,
	 *  			   "start" : { "lat" : (float) latitude, "lng" : (float) longitude },
	 *  			   "end" : { "lat" : (float) latitude, "lng" : (float) longitude } ]
	 */
	private JSONObject GetMinRouteWaypoints(JSONArray googleRoute, JSONArray bingRoute) {
		float maxDeviation = 0.25f; //use an arbitrary deviation between 0 and 2. This may need adjustment later
		
		JSONObject minRoute = new JSONObject();
		JSONObject finalStep = new JSONObject();
		int nodeNumber = 0;
		int bc = 0;
		for (int gc = 0; gc < googleRoute.size(); gc++) {
			JSONObject googleStep = (JSONObject) googleRoute.get(gc);
			JSONObject googleStart = (JSONObject) googleStep.get("start");
			JSONObject googleEnd = (JSONObject) googleStep.get("end");
			finalStep = googleEnd;
			if (!minRoute.containsKey("Node0")) { //First time through, we know the starting point should be the same, so just use Google
				minRoute.put("node" + nodeNumber++, googleStart);
			}
			
			//get the slope variable for Google
			float glatChange = Float.parseFloat(googleEnd.get("lat").toString()) - Float.parseFloat(googleStart.get("lat").toString());
			float glngChange = Float.parseFloat(googleEnd.get("lng").toString()) - Float.parseFloat(googleStart.get("lng").toString());
			float ghypotenuse = (float) Math.sqrt((glatChange * glatChange) + (glngChange * glngChange));
			float gyNormalized = glatChange / ghypotenuse;
			float gxNormalized = glngChange / ghypotenuse;
			float cumulativeBHypotenuse = 0;
			
			//Now walk through the Bing data points until we either run out of data points,
			//or we have traveled further than the google route has traveled.
			while (bc < bingRoute.size() && cumulativeBHypotenuse <= ghypotenuse) {
				JSONObject bingStep = (JSONObject) bingRoute.get(bc);
				JSONObject bingStart = (JSONObject) bingStep.get("start");
				JSONObject bingEnd = (JSONObject) bingStep.get("end");
				
				//get the slope variable for Bing
				float blatChange = Float.parseFloat(bingEnd.get("lat").toString()) - Float.parseFloat(bingStart.get("lat").toString());
				float blngChange = Float.parseFloat(bingEnd.get("lng").toString()) - Float.parseFloat(bingStart.get("lng").toString());
				float bhypotenuse = (float) Math.sqrt((blatChange * blatChange) + (blngChange * blngChange));
				float byNormalized = blatChange / bhypotenuse;
				float bxNormalized = blngChange / bhypotenuse;
				
				// Check if the preferred Bing path deviates from the Google path. If it does, we need to add the Bing point
				// as a waypoint node, so that it can be passed to Google to force the Bing path in Google
				if (Math.abs(byNormalized - gyNormalized) >= maxDeviation || Math.abs(bxNormalized - gxNormalized) >= maxDeviation) {
					minRoute.put("node" + nodeNumber++, bingStart);
				}
				
				cumulativeBHypotenuse += bhypotenuse;
				bc++;
			}
		}
		
		//Finalize by pushing the final node on
		minRoute.put("node" + nodeNumber++, finalStep);
		
		return minRoute;
	}
}

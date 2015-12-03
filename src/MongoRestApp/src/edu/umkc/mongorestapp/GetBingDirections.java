package edu.umkc.mongorestapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import com.ibm.json.java.JSONArray;
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
	
	/* Returns a JSONObject of:
	 * bingDirections : { "TotalTime" : (int) seconds,
	 *   "TotalDistance" : (int) meters,
	 *   "route" : {
	 *              "nodeN" : {
	 *                         "lat" : (float) latitude,
	 *                         "lng" : (float) longitude
	 *                        }
	 *             }
	 *  }
	 *  
	 *  mapRoute : { "TotalDistance" : (int) meters,
	 *  			 "TotalTime" : (int) seconds,
	 *  		     "route" : [ "TotalDistance" : (int) meters,
	 *  			   "TotalTime" : (int) seconds,
	 *  			   "start" : { "lat" : (float) latitude, "lng" : (float) longitude },
	 *  			   "end" : { "lat" : (float) latitude, "lng" : (float) longitude } ] }
	 */
	public JSONObject getDirections(JSONObject mapRoute) throws IOException{
		String startLocEnc = URLEncoder.encode(startLoc);
		String endLocEnc = URLEncoder.encode(endLoc);
		String url = "http://dev.virtualearth.net/REST/v1/Routes/Driving?key=An5k009sPgQ-Odp-SJ0ueRBn9VKH-0IhwMLAi5aFTa0iTfY4Yk7XYKzTl5nBAm1P";
		url = url + "&waypoint.1="+startLocEnc;
		if (waypoint != null) {
			String waypointEnc = URLEncoder.encode(waypoint);
			url = url + "&waypoint.2="+waypointEnc+"&waypoint.3="+endLocEnc;
		} else {
			url = url + "&waypoint.2="+endLocEnc;
		}
		System.out.println("GetBingDirections: getDirections: using URL: " + url);
		
		URL bingMaps = new URL(url);
		URLConnection bmc = bingMaps.openConnection();
		BufferedReader in = new BufferedReader(new InputStreamReader(bmc.getInputStream()));
		String inputData;
		String jsonData = "";
		while ((inputData = in.readLine()) != null) {
			//System.out.println("GetBingDirections: getDirections: partial data read: "+inputData);
			jsonData += inputData;
		}
		in.close();
		System.out.println("GetBingDirections: getDirections: finished reading remote URL");
		
		if (jsonData.isEmpty()) {
			throw new IOException("No data read from server");
		}
		
		JSONObject rawRouteData = JSONObject.parse(jsonData.toString());
		
		JSONObject returnResults = new JSONObject();
		JSONObject lastNode = new JSONObject();
		JSONArray fullRoute = new JSONArray();
		int TotalTime = 0;
		int TotalDistance = 0;
		JSONArray resourceArr = (JSONArray) rawRouteData.get("resourceSets");
		java.util.ListIterator resourceArrIter = resourceArr.listIterator();
		while (resourceArrIter.hasNext()) {
			JSONObject routes = (JSONObject) resourceArrIter.next();
			JSONArray routesArr = (JSONArray) routes.get("resources");
			System.out.println("GetBingDirections: getDirections: Looping through returned resources");
			java.util.ListIterator routesArrIter = routesArr.listIterator();
			while (routesArrIter.hasNext()) {
				JSONObject resource = (JSONObject) routesArrIter.next();
				System.out.println("GetBingDirections: getDirections: parsing indivual resource");
				TotalTime += Integer.parseInt(resource.get("travelDuration").toString());
				TotalDistance += (int) Float.parseFloat(resource.get("travelDistance").toString()) * 1000;  //returned as km, we want meters
				JSONArray resourceArr2 = (JSONArray) resource.get("routeLegs");
				java.util.ListIterator resourceArr2Iter = resourceArr2.listIterator();
				while (resourceArr2Iter.hasNext()) {
					JSONObject tmpObj = (JSONObject) resourceArr2Iter.next();
					System.out.println("GetBingDirections: getDirections: processing an individual node");
					lastNode = (JSONObject) tmpObj.get("actualEnd");
					JSONObject start = (JSONObject) tmpObj.get("actualStart");
					if (!returnResults.containsKey("Node0")) {
						assignNodeGps(start, returnResults, 0);
					}
					JSONObject tmpFullRoute = new JSONObject();
					tmpFullRoute.put("start", convertGPSArrayToObject(start));
					tmpFullRoute.put("end", convertGPSArrayToObject(lastNode));
					tmpFullRoute.put("TotalDistance", (int) Float.parseFloat(tmpObj.get("travelDistance").toString()) * 1000);
					tmpFullRoute.put("TotalTime", Integer.parseInt(tmpObj.get("travelDuration").toString()));
					fullRoute.add(tmpFullRoute);
				}
			}
		}
		assignNodeGps(lastNode, returnResults, 1);
		returnResults.put("TotalTime", TotalTime);
		returnResults.put("TotalDistance", TotalDistance);
		mapRoute.put("TotalTime", TotalTime);
		mapRoute.put("TotalDistance", TotalDistance);
		mapRoute.put("route", fullRoute);
		return returnResults;
	}
	
	protected JSONObject convertGPSArrayToObject(JSONObject source) {
		System.out.println("GetBingDirections: convertGPSArrayToObject: Entered with object with: "+source.size()+" size");
		JSONObject formattedNode = new JSONObject();
		JSONArray coordinates = (JSONArray) source.get("coordinates");
		formattedNode.put("lat", coordinates.get(0));
		formattedNode.put("lng", coordinates.get(1));
		return formattedNode;
	}
	
	protected void assignNodeGps(JSONObject leg, JSONObject returnResults, int nodeNumber) {
		System.out.println("GetBingDirections: assignNodeGps: Called with nodeNumber="+Integer.toString(nodeNumber));
		JSONObject formattedNode = convertGPSArrayToObject(leg);
		JSONObject tmpObj = new JSONObject();
		if (returnResults.containsKey("route")) {
			tmpObj = (JSONObject) returnResults.get("route");
		}
		tmpObj.put("node"+Integer.toString(nodeNumber), formattedNode);
		returnResults.put("route", tmpObj);
	}
}

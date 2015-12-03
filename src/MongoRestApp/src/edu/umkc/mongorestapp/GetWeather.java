package edu.umkc.mongorestapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import com.ibm.json.java.JSON;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/* Uses the Weather Underground (www.wunderground.com) API to get weather information for multiple points
 * along a driving route. The driving route information is expected to be in Google Maps JSON format
 */

public class GetWeather {
	private JSONObject directions;
	int numberOfLegs; //There will be +1 more than this is set to, due to the starting point

	public GetWeather(JSONObject directions) {
		super();
		this.directions = directions;
		numberOfLegs = 2; //default to 3 total legs (2 + starting point), because of free WUnderground limitations
	}
	
	public GetWeather(JSONObject directions, int numberOfLegs) {
		super();
		this.directions = directions;
		this.numberOfLegs = numberOfLegs - 1; //account for the starting point taking a spot
	}
	
	public void setNumberOfLegs(int numberOfLegs) {
		this.numberOfLegs = numberOfLegs - 1; //account for the starting point taking a spot
	}

	/* Takes a Google Maps formatted JSON route and adds the following JSON object to returnObj.
	 * with an ordered array with the same number of elements as numberOfLegs+1
	 * WeatherInfo: [
	 *   { temp_f: value,
	 *     temp_c: value,
	 *     icon: short description of weather (generally 1 word),
	 *     icon_url: URL of pertinent weather icon image,
	 *     travelTime: estimated time, in seconds, to reach this weather location,
	 *     extremeEvent: (optional) if there is an extreme event, like tornado, this element will be populated with details
	 *   }
	 * ]
	 * 
	 * 	 directions : { "TotalDistance" : (int) meters,
	 *  			 "TotalTime" : (int) seconds,
	 *  		     "route" : [ "TotalDistance" : (int) meters,
	 *  			   "TotalTime" : (int) seconds,
	 *  			   "start" : { "lat" : (float) latitude, "lng" : (float) longitude },
	 *  			   "end" : { "lat" : (float) latitude, "lng" : (float) longitude } ] }
	 */
	public void parseDirections(JSONObject returnObj) throws IOException {
		JSONArray weatherInfo = new JSONArray();
		int weatherInfoC = 0;  //count number of weather points saved
		
		int totalTime = Integer.parseInt((String) directions.get("TotalTime").toString());
		
		int legTime = totalTime / numberOfLegs;
		if (legTime < 1) {
			/* just a safety check, in case a very short route is passed in */
			legTime = 1;
		}
		
		JSONArray routesArr = (JSONArray) directions.get("route");
		java.util.ListIterator routesArrIter = routesArr.listIterator();
		int secondsSinceLast = 0;
		
		//Save these with each loop, so that we can use the last one to get the last point
		String lastLat = "";
		String lastLng = "";
		
		while (routesArrIter.hasNext()) {
			JSONObject thisRoute = (JSONObject) routesArrIter.next();
			JSONObject startGps = (JSONObject) thisRoute.get("start");
			JSONObject endGps = (JSONObject) thisRoute.get("end");
			if (weatherInfoC == 0) { //first time through, save the starting point weather
				weatherInfo.add(getSingleWeather(startGps.get("lat").toString(), startGps.get("lng").toString(), weatherInfoC * legTime));
				weatherInfoC++;
			}
			String startLat = startGps.get("lat").toString();
			String startLng = startGps.get("lng").toString();
			String endLat = endGps.get("lat").toString();
			String endLng = endGps.get("lng").toString();
			lastLat = endLat;
			lastLng = endLng;
			float startLatFloat = Float.parseFloat(startLat);
			float startLngFloat = Float.parseFloat(startLng);
			float endLatFloat = Float.parseFloat(endLat);
			float endLngFloat = Float.parseFloat(endLng);
			int dValue = Integer.parseInt(thisRoute.get("TotalTime").toString());
				
			/* Check if the duration of this leg will put us past our next update point */
			while (dValue + secondsSinceLast > legTime) {
				float ratioNeeded = ((float) (legTime - secondsSinceLast)) / (float) dValue;
				String legLat = Float.toString((endLatFloat - startLatFloat) * ratioNeeded + startLatFloat);
				String legLng = Float.toString((endLngFloat - startLngFloat) * ratioNeeded + startLngFloat);
				weatherInfo.add(getSingleWeather(legLat, legLng, weatherInfoC * legTime));
				weatherInfoC++;
					
				/* Now to see if this leg.step in the path needs to be subdivided into even more weather points */
				if (secondsSinceLast + dValue >= legTime) {
					dValue -= legTime - secondsSinceLast;
					if (dValue < legTime) {
						/* This was the last subdivided point in this step */
						secondsSinceLast = dValue;
						dValue = 0;
					} else {
						/* There are even more subdivided points that we need to get out of this step */
						secondsSinceLast = 0;
					}
				} else {
					dValue -= legTime - secondsSinceLast;
					secondsSinceLast = (secondsSinceLast + dValue) % legTime;
				} //if
			} //while
		} //routesArr while
		
		//Handle the weather for the last point now
		JSONObject tmpSingleWeather = getSingleWeather(lastLat, lastLng, weatherInfoC * legTime);
		weatherInfo.add(tmpSingleWeather);
		
		returnObj.put("WeatherInfo", weatherInfo);
	}
	
	/* getSingleWeather returns a JSON object of:
	 * { temp_f: value,
	 *   temp_c: value,
	 *   icon: short description of weather (generally 1 word),
	 *   icon_url: URL of pertinent weather icon image,
	 *   travelTime: estimated time, in seconds, to reach this weather location,
	 *   extremeEvent: (optional) if there is an extreme event, like tornado, this element will be populated with details
	 * }
	 * Data comes from the Weather Underground REST API
	 */
	protected JSONObject getSingleWeather(String lat, String lon, int travelTime) throws IOException {
		JSONObject returnObj = new JSONObject(); //parsed results to be returned to calling method
		
		String url = "http://api.wunderground.com/api/84d3abefc608dbdd/conditions/q/" + lat + "," + lon + ".json";
		System.out.println("GetWeather: getSingleWeather: Calling url: "+url);
		
		URL wUnderground = new URL(url);
		URLConnection wuc = wUnderground.openConnection();
		BufferedReader in = new BufferedReader(new InputStreamReader(wuc.getInputStream()));
		String inputData;
		String jsonData = "";
		while ((inputData = in.readLine()) != null) {
			jsonData += inputData;
		}
		in.close();
		//System.out.println("GetWeather: getSingleWeather: Returned results: "+jsonData);
		
		JSONObject weatherResults = (JSONObject) JSON.parse(jsonData);
		JSONObject currentObservation = (JSONObject) weatherResults.get("current_observation");
		returnObj.put("temp_f", currentObservation.get("temp_f").toString());
		returnObj.put("temp_c", currentObservation.get("temp_c").toString());
		returnObj.put("icon", currentObservation.get("icon").toString());
		returnObj.put("icon_url", currentObservation.get("icon_url").toString());
		returnObj.put("travelTime", travelTime);
		
		return returnObj;
	}
}

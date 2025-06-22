# DisasterApp
The scope for this application will be within Canada to notify users and also help governments. The application will use real time from NASA’s Firms web services to provide the most updated fire areas.

# Inspiration 
The number of wildfire evacuees in Manitoba has increased, with more likely as a handful of communities remain on alert.
"The numbers have continued to grow. We were saying 17,000. I think we can safely assume it's north of that number now," Premier Wab Kinew. source:*(https://www.cbc.ca/news/canada/manitoba/wildfire-evacuee-numbers-information-1.7552948)*

"The numbers have continued to grow. We were saying 17,000. I think we can safely assume it's north of that number now," Premier Wab Kinew told CBC Manitoba's Information Radio on Thursday morning.

# Overview:
Disaster Watch is a real-time mapping application that visualizes active wildfires, emergency shelter locations, and critical natural disasters on an interactive web map. Built with React and Leaflet, the app fetches live fire data from NASA FIRMS and geocodes emergency shelters using OpenStreetMap APIs. It enables users to search locations, identify threats nearby, and make informed decisions during natural disasters.

# How it Works:
Live Fire Detection:
Integrates NASA FIRMS (Fire Information for Resource Management System) API to display satellite-detected fires on the map, each with brightness, location, and timestamp.

## Emergency Shelters:
Predefined addresses (like schools or shelters) are geocoded into map markers using OpenStreetMap’s Nominatim API, helping users find safe locations nearby.

## Search & Locate:
Users can type in any city or location. The app fetches its coordinates and places a marker, letting users instantly check safety in that area.

## Responsive UI:
Designed for both desktop and mobile screens, showing a real-time interactive experience with minimal delay.

# Use Cases:
Firefighters & Emergency Responders: Get accurate coordinates of ongoing wildfires to plan routes and dispatch teams.

# Public Safety Agencies: 
Share the app with residents to find shelters and avoid danger zones.

# Citizens: 
Individuals in affected regions can use this tool to stay informed and react quickly.

# Future Additions:
ML-based fire severity predictions
Flood alerts from meteorological APIs
Public alert notifications
Mobile PWA version for offline access

# Example Use Case:
A user in Manitoba sees smoke outside. They open the app, click “locate me,” and instantly see a NASA-detected fire nearby along with the closest emergency shelter’s address. They can now contact local authorities or decide on evacuation steps confidently.



import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, useMapEvent, useMap} from 'react-leaflet';

nasaData = "https://firms.modaps.eosdis.nasa.gov/api/area/json/<adde6368823b1c811de264a026f39f29>/MODIS_NRT/NorthAmerica/24h";
import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, LayersControl, TileLayer, LayerGroup,useMapEvent} from 'react-leaflet';
import 'leaflet.smoothpolygons'
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function NearMe() {
  
  const [position, setPostion] = useState(null);
  const map = useMapEvent({

    click() {
      map.locate();
    },
    locationfound(e) {
      setPostion(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
      
  });
  

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}


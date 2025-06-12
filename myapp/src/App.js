import SimpleMap from './map';
import './App.css';

function App() {
  return (
    <div className="App">
    {/* Leaflet CSS should be imported in index.html or via JS import */}
     <div>
      {/* <h1>My Leaflet.js and React Map</h1> */}
      <SimpleMap />
    </div>
    {/* Leaflet JS should be imported in index.html or via npm package */}
    </div>
  );
}

export default App;

import SimpleMap from './map';
import './App.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🔥</span>
        <span className="navbar-title">DisasterWatch</span>
      </div>
      <div className="navbar-search">
        <input type="text" placeholder="Search location..." id="navbar-search-input" />
        <button onClick={() => {
          const val = document.getElementById('navbar-search-input').value;
          const formInput = document.querySelector('#form input');
          const form = document.getElementById('form');
          if (formInput && form) {
            formInput.value = val;
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }}>Search</button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div>
      <Navbar />
      <div className="App">
        <SimpleMap />
      </div>
    </div>
  );
}

export default App;

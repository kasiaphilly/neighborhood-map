import React, { Component } from 'react';
import './styles.css';
import { locations } from './data/locations.js';
import { mapDesign } from './data/mapDesign.js';
import map from './components/map.js';
import sidebar from './components/sidebar.js';
import scriptLoader from 'react-async-script-loader';
import escapeRegExp from 'escape-string-regexp';
import sortBy from 'sort-by';
import fetchJsonp from 'fetch-jsonp';
import './App.css';



class App extends Component {

  state = {
    places: [],
    markers: [],
    infowindows: [],
    filteredPlace: [],
    map: {}
  }

  //place update
  updatePlaces = (places) => {
    this.setState({ places })
  }

  // markers update
  updateMarkers = (markers) => {
    this.setState({ markers })
  }

  // infowindow update
  updateInfowindows = (infowindows) => {
    this.setState({ infowindows })
  }

  //map update
  updateMap = (map) => {
    this.setState({ map })
  }


  render() {
    const { map, places, markers, infowindows, filteredPlace } = this.state
    return (
      <main className="App">

        <Sidebar map={map} infowindows={infowindows} markers={markers} places={places}
          filteredPlace={filteredPlace} updateFilter={this.updateFilter} />
        <Map map={map} infowindows={infowindows} markers={markers} places={places}
          updateMap={this.updateMap} updateInfowindows={this.updateInfowindows} updateMarkers={this.updateMarkers} updatePlaces={this.updatePlaces}
        />
      </main>
    );
  }
}

export default App;

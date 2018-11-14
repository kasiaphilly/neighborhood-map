import React, { Component } from 'react';
import './styles.css';
import Map from './components/map.js';
import Sidebar from './components/sidebar.js';


class App extends Component {

  state = {
    places: [],
    markers: [],
    infowindows: [],
    myPlace: [],
    map: {}
  }

  // update places
  updatePlaces = (places) => {
    this.setState({
      places: places,
      myPlace: places
    })
  }

  // update markers
  updateMarkers = (markers) => {
    this.setState({ markers })
  }

  // update infowindows
  updateInfowindows = (infowindows) => {
    this.setState({ infowindows })
  }

  // update the map
  updateMap = (map) => {
    this.setState({ map })
  }

  // filter the searched items  TODO UPDATE!
  filterResults = (query) => {
    if (query) {

      let result = this.state.places.filter((place) => place.name.toLowerCase().includes(query.toLowerCase()));

      let markersResult = this.state.markers.filter((marker) => marker.name.toLowerCase().includes(query.toLowerCase()));
      // set all marker not visible
      this.state.markers.forEach(marker => {
        marker.setVisible(false)
      });
      // set only searched marker to visible
      markersResult.forEach(function (marker) {
        marker.setVisible(true)
      })
      this.setState({
        myPlace: result
      })
    } else {
      this.state.markers.forEach(function (marker) {
        marker.setVisible(true)
      })
      this.setState({
        myPlace: this.state.places
      })
    }
  }

  render() {
    const { map, places, markers, infowindows, myPlace } = this.state
    return (
      <main className="App">

        <Sidebar map={map} infowindows={infowindows} markers={markers} places={places}
          myPlace={myPlace} filterResults={this.filterResults} />
        <Map map={map} infowindows={infowindows} markers={markers} places={places}
          updateMap={this.updateMap} updateInfowindows={this.updateInfowindows} updateMarkers={this.updateMarkers} updatePlaces={this.updatePlaces}
        />
      </main>
    );
  }
}

export default App;

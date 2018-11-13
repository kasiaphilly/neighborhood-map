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

let createMap = {};
export let testData = '';

class App extends Component {
  // Constructor
  constructor(props) {
    super(props);

    // Initial states
    this.state = {
      map: {},
      markers: [],
      infowindow: {}
    }
    // Binding the pullData function to this
    this.pullData = this.pullData.bind(this);
  }

  componentWillReceiveProps({isScriptLoadSucceed}) {
    // Conditional to initialize the map when the script loads
    if (isScriptLoadSucceed) {

      // Calls this function to fetch Foursquare data asynchronously
      this.pullData();

      // Initialize Google Maps
      createMap = new window.google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat: 39.968918, lng: -75.143},
          styles: mapDesign,
          mapTypeControl: false,
          fullscreenControl: false
        });

      const buildInfoWindow = new window.google.maps.InfoWindow({maxWidth: 320});
      const bounds = new window.google.maps.LatLngBounds();
      const myEvents = 'click keypress'.split(' ');
      let createMarkers = [];
      let myLocations = [];

      setTimeout(() => {

        /**
        * Checks if the markers state get Foursquare data for all markers
        * else the markers will be built with the locations stored in the data directory
        */
        if (this.state.markers.length === 6) {
          myLocations = this.state.markers;
          console.log(myLocations);

          /**
          * Confirmation that Foursquare data has been received
          * this information will be used in other parts of the App
          */
          testData = true;

        } else {
          myLocations = locations;
          console.log(myLocations);
        }

        for (let i = 0; i < myLocations.length; i++) {
          let position = {lat: myLocations[i].location.lat, lng: myLocations[i].location.lng};
          let name = myLocations[i].name;
          let address = myLocations[i].location.address;
          let lat = myLocations[i].location.lat;
          let lng = myLocations[i].location.lng;
          let bestPhoto = '';
          let rating = '';
          let likes = '';
          let tips = '';
          let moreInfo = '';

          if (testData === true) {
            bestPhoto = myLocations[i].bestPhoto.prefix.concat('width300', myLocations[i].bestPhoto.suffix);
            rating = myLocations[i].rating;
            likes = myLocations[i].likes.count;
            tips = myLocations[i].tips.groups[0].items[0].text;
            moreInfo = myLocations[i].canonicalUrl;
          }

          let marker = new window.google.maps.Marker({
            id: i,
            map: createMap,
            position: position,
            name: name,
            title: name,
            address: address,
            lat: lat,
            lng: lng,
            bestPhoto: bestPhoto,
            rating: rating,
            likes: likes,
            tips: tips,
            moreInfo: moreInfo,
            icon: markerDefault,
            animation: window.google.maps.Animation.DROP
          });

          createMarkers.push(marker);

          // Adds event listeners to all created markers
          for (let i = 0; i < myEvents.length; i++) {
            marker.addListener(myEvents[i], function() {
              addInfoWindow(this, buildInfoWindow);
              this.setAnimation(window.google.maps.Animation.BOUNCE);
              setTimeout(function () {
                marker.setAnimation(null);
              }, 1000);
            });
          }

          marker.addListener('mouseover', function() {
            this.setIcon(markerSelected);
          });

          marker.addListener('mouseout', function() {
            this.setIcon(markerDefault);
          });

          bounds.extend(createMarkers[i].position);
        }

        createMap.fitBounds(bounds);

        // Updates states with prepared data
        this.setState({
          map: createMap,
          markers: createMarkers,
          infowindow: buildInfoWindow
        });
      }, 800);

    // Indication when the map can't be loaded
    } else {
      alert("Something went wrong and the map could not be loaded. Try to reload this page!");
    }
  }

  /**
  * @description Fetch Foursquare data asynchronously
  * @param {object} location
  * @param {object} response
  * @param {object} data
  * @param {object} error
  */
  pullData() {
    let places = [];
    locations.map((location) =>
      fetch("https://api.foursquare.com/v2/venues/${location.venueId}?client_id=MNWCTMZ00VP3ZL140X5BGSD0SOGXWL435PTT31PQ4ZTSMBHL&client_secret=Z2SMN1DR3SIUJ0I3AZYPSVJL3EJEIJWEIPPPS3UGUITYVJAJ&v=20180323")
        .then(response => response.json())
        .then(data => {
          if (data.meta.code === 200) {
            places.push(data.response.venue);
          }
        }).catch(error => {
          testData = false;
          console.log(error);
        })
    );

    // Updates the markers state with the data obtained
    this.setState({
      markers: places
    });
    console.log(this.state.markers);
  }

  // Renders the App
  render() {
    return (
      <div className='App' role='main'>
        <Filter
          map={ this.state.map }
          markers={ this.state.markers }
          infowindow={ this.state.infowindow }
        />
        <map />
      </div>
    );
  }
}

/**
* @description Opens the infowindow
* @param {object} marker
* @param {object} infowindow
* @param {object} createMap
*/
function addInfoWindow(marker, infowindow) {
  if (testData === true) {
    infowindow.setContent(
      '<div class="info-wrap">'+
      '<img class="info-photo" src='+marker.bestPhoto+' alt="Beach photo"><br>'+
      '<h2 class="info-name">'+marker.name+'</h2><br>'+
      '<p class="info-position">Latitude: '+marker.lat+'</p><br>'+
      '<p class="info-position">Longitude: '+marker.lng+'</p><br>'+
      '<p class="info-address">Address: '+marker.address+'</p><br>'+
      '<p class="info-rating">Rating: '+marker.rating+'</p><br>'+
      '<p class="info-likes">Likes: '+marker.likes+'</p><br>'+
      '<p class="info-tips">Tips: "'+marker.tips+'"</p><br>'+
      '<a class="info-link" href='+marker.moreInfo+' target="_blank"><span>For more information<span></a><br>'+
      '<img class="info-fslogo" src='+foursquareLogo+' alt="Powered by Foursquare"><br>'+
      '</div>'
    );
  } else {
    infowindow.setContent(
      '<div class="error-wrap">'+
      '<p class="error-message">Sorry, Foursquare data can&apos;t be loaded!</p><br>'+
      '</div>'
    );
  }
  infowindow.open(createMap, marker);
}

// asynchronously loads the map
export default scriptLoader(
  ["https://maps.googleapis.com/maps/api/js?key=AIzaSyD42M9x96sriIW2Q_dqn2Y57T6f3MpBe44&v=3&callback=initMap"]
)(app);

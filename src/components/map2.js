import React, { Component } from 'react'
import * as FourSquareAPI from './API/FourSquare'
import $ from 'jquery'
import PropTypes from 'prop-types'
import { locations } from '../data/locations.js'; // adjust path
import { mapDesign } from '../data/mapDesign.js';


const CALLS_LIMIT = 5
let newMap
let places = [];


/*let newPlaces = []
let newMarkers = []
let newInfowindows = []
*/

let infowindow
const type = 'restaurant'
let createMarkers = [];
let myLocations = [];
const buildInfoWindow = new window.google.maps.InfoWindow({maxWidth: 320});
const bounds = new window.google.maps.LatLngBounds();
const myEvents = 'click keypress'.split(' ');



class Map extends Component {
  state = {
      map: {},
      markers: [],
      infowindow: {}
    }
    // Binding the pullData function to this
    pullData = pullData.bind(this);
    componentDidMount = componentDidMount.bind(this);






    componentDidMount() {
        window.createMap = this.createMap
        this.loadJS('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDQLFI1huz_P6aOlOqP5pJnloVBwLjSUn8&v=3&callback=createMap')
    }

    /* code took from https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/
    // Asynchronous Loading
    loadJS = (src) => {
        document.getElementById('map').innerText = 'Loading...'
        var ref = window.document.getElementsByTagName("script")[0];
        var script = window.document.createElement("script");
        script.src = src;
        script.async = true;
        // error handling
        script.onerror = () => {
            document.getElementById('map').innerText = `Sorry, something went wrong with loading Google Maps:`
          };
        ref.parentNode.insertBefore(script, ref);
    }

*/


// INITIALIZES GOOGLE map

        //initiates Google map
        createMap = () => {
            // create new map
            newMap = new google.maps.Map(document.getElementById('map'), {
              center: {lat: 40.7413549, lng: -73.9980244},
              zoom: 13,
              styles: mapDesign,        // customized graphic design
              mapTypeControl: false,
            })
            /* Get Places
            const thisMap = this
            */



        /*    //button FIND HERE
            const findHere = document.getElementById('find-here');
            findHere.addEventListener('click', function () {
                //clear old search
                for (let item of thisMap.props.markers) {
                    item.setMap(null)
                }
                //clear markers list
                newMarkers = []
                thisMap.props.updateMarkers(newMarkers)
                //clear places
                newPlaces = []
                thisMap.props.updatePlaces(newPlaces)
                //clear infowindows
                newInfowindows = []
                thisMap.props.updateInfowindows(newInfowindows)
                let bounds = newMap.getBounds()
                let service = new google.maps.places.PlacesService(newMap);
                service.nearbySearch({
                    location: pos,
                    radius: 5000,
                    type: type,
                    bounds: bounds
                }, thisMap.callback);
                thisMap.props.updatePlaces(newPlaces)
            })
            findHere.click();
            this.props.updateMap(newMap)

        }
        callback = (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length && i < CALLS_LIMIT; i++) {
                    this.createMarker(results[i]);
                }
                //update places
                this.props.updatePlaces(newPlaces)
                this.props.updateMarkers(newMarkers)
                this.props.updateInfowindows(newInfowindows)
            } else if (status === 'ZERO_RESULTS') {
                alert('No Restaurant in this area')
            } else {
                alert(`Sorry, something went wrong with Google Maps Places:
                Status: ${status}`);
            }
        };



*/




//CREATE MARKERS FROM DATA LIST (LOCATIONS)


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
            icon: pointer,      // customized pointer symbol
            animation: window.google.maps.Animation.DROP
          });

          createMarkers.push(marker);


// LISTEN TO EVENTS ON MARKERS

          // Adds event listeners to all created markers
          for (let i = 0; i < myEvents.length; i++) {
            marker.addListener(myEvents[i], function() {
              addInfoWindow(this, buildInfoWindow);
              this.setAnimation(window.google.maps.Animation.BOUNCE);
              setTimeout(function () {
                marker.setAnimation(null);
              }, 300);
            });
          }

          marker.addListener('mouseover', function() {
            this.setIcon(activePointer);
          });

          marker.addListener('mouseout', function() {
            this.setIcon(pointer);
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





/*
    // Indication when the map can't be loaded
    } else {
      alert("Something went wrong and the map could not be loaded. Try to reload this page!");
    }
  }


*/





//CREATE PLACES ARRAY WITH INFO FROM FOURSQUARE

// Pulls data on locations from FourSquare




    const getFourSquareInfo = (location) => {
        return fetch(`https://api.foursquare.com/v2/venues/${location.venueId}?client_id=MNWCTMZ00VP3ZL140X5BGSD0SOGXWL435PTT31PQ4ZTSMBHL&client_secret=Z2SMN1DR3SIUJ0I3AZYPSVJL3EJEIJWEIPPPS3UGUITYVJAJ&v=20180323`)
            .then(result => result.json())
            .then(result => {
        if (result.meta.code !== 200 || result === 'err') {
            this.setState({ fourSquareContent:
                    `<section>
                        <p>Sorry, something went wrong</p>
                        <p>ERROR: ${result.meta.code}</p>
                        <p>${result.meta.errorDetail}</p>
                    </section>`
                })
        } else {
            let categories = 'no category'
            let image = 'no image'
            let rating = 'no rating'
            if ('categories' in result.response.venue)
                categories = result.response.venue.categories[0].name
            if ('bestPhoto' in result.response.venue)
                image = result.response.venue.bestPhoto.prefix + 120 + result.response.venue.bestPhoto.suffix
            if ('rating' in result.response.venue)
                rating = result.response.venue.rating

            this.setState({
                fourSquareContent: `
                    <section>
                            <h3 class='info-content' tabindex=0>${place.name}</h3>
                            <h4 tabindex=0><p>Address :</h4>
                            <p tabindex=0>${location.address}</p>
                            <img src='${image}' alt='an image of ${place.name}' tabindex=0>
                            <p tabindex=0>Rating: ${rating}</p>
                    </section>`
            })
        }

    }








    /*add new marker

    createMarker = (place) => {
        let marker = new google.maps.Marker({
            name: place.name,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            map: newMap,
            id: place.id
        })
        //this.setState((state) => ({ makers: state.markers.concat(newMarker) }))
        let lat = marker.getPosition().lat()
        let lng = marker.getPosition().lng()
        // get some information from FourSwuare
        this.fourSquare(lat, lng, place.name, marker, place)
        // add place to places
        newPlaces.push(place)
        newMarkers.push(marker)
    }
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
      '</div>'
    );

  } else {
    infowindow.setContent(
      '<div class="error-wrap">'+
      '<p class="error-message">Sorry, Foursquare data could not be loaded!</p><br>'+
      '</div>'
    );
  }
  infowindow.open(createMap, marker);
}










/*


    const getFourSquareInfo = (lat, lng, name) => {
        return fetch(`${API}/search?&ll=${lat},${lng}&limit=1&radius=250&query=${name}&client_id=${ID}&client_secret=${SECRET}&v=20180323`)
            .then(result => result.json())
            .then(result => {
                if (result.response.venues[0]) {
                    return result.response.venues[0].id
                }
            })
            .then(LocationID =>
                fetch(`${API}/${LocationID}?&client_id=${ID}&client_secret=${SECRET}&v=20180323`)
                    .then(result => result.json())
            )
            .catch('err')
    }


*/


/*

    // get place information from fourSquare
    fourSquare = (lat, lng, name, marker, place) => {
        return FourSquareAPI.getFourSquareInfo(lat, lng, name).then(result => {
            if (result.meta.code !== 200 || result === 'err') {
                this.setState({ fourSquareContent:
                        `<section>
                            <p>Sorry, something went wrong</p>
                            <p>ERROR: ${result.meta.code}</p>
                            <p>${result.meta.errorDetail}</p>
                        </section>`
                    })
            } else {
                let categories = 'no category'
                let image = 'no image'
                let rating = 'no rating'
                if ('categories' in result.response.venue)
                    categories = result.response.venue.categories[0].name
                if ('bestPhoto' in result.response.venue)
                    image = result.response.venue.bestPhoto.prefix + 120 + result.response.venue.bestPhoto.suffix
                if ('rating' in result.response.venue)
                    rating = result.response.venue.rating

                this.setState({
                    fourSquareContent: `
                        <section>
                                <h3 class='info-content' tabindex=0>${place.name}</h3>
                                <h4 tabindex=0><p>Restaurant Category :</h4>
                                <p tabindex=0>${categories}</p>
                                <img src='${image}' alt='an image of ${place.name}' tabindex=0>
                                <p tabindex=0>Rating: ${rating}</p>
                        </section>`
                })
            }

            //Add information to the Marker
            marker = this.addInfowindow(marker, place)
        })
    }

    //Add Info
    addInfowindow = (marker, place) => {
        //Add fourSquare Information
        infowindow = new google.maps.InfoWindow({
            content: this.state.fourSquareContent,
            id: place.id,
        });

*/









        //set focus on infowindow (Accessibility)
        infowindow.addListener('domready', function () {
            $('.info-content').focus()
        })

        marker.infowindow = infowindow

        // open information when mouse is over
        marker.addListener('mouseover', function () {
            marker.infowindow.open(newMap, marker)
            $('.sidebar').addClass('close')
        })

        //close information when mouse in out
        marker.addListener('mouseout', function () {
            marker.infowindow.close()
            $('.sidebar').removeClass('close')
        })


        /* add element to newInfowindows array
        newInfowindows.push(infowindow)
        return marker */
    }

    render() {
        return (
            <div id='map' tabIndex='-1' aria-label="Philadelphia coffeeshop map" aria-hidden="true" role="application"></div>
        )
    }
}

/* asynchronously loads the map
export default scriptLoader(
  ["https://maps.googleapis.com/maps/api/js?key=AIzaSyD42M9x96sriIW2Q_dqn2Y57T6f3MpBe44"]
)(App);
*/

/*
* @description Fetch Foursquare data asynchronously
* @param {object} location
* @param {object} response
* @param {object} data
* @param {object} error
*/



/*
* @description Opens the infowindow
* @param {object} marker
* @param {object} infowindow
* @param {object} createMap
*/

/*Check if the Type of variables are correct
Map.propTypes = {
    map: PropTypes.object.isRequired,
    infowindows: PropTypes.array.isRequired,
    markers: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    updateMap: PropTypes.func.isRequired,
    updateInfowindows: PropTypes.func.isRequired,
    updateMarkers: PropTypes.func.isRequired,
    updatePlaces: PropTypes.func.isRequired
}
*/
export default scriptLoader(
  ["https://maps.googleapis.com/maps/api/js?key=AIzaSyD42M9x96sriIW2Q_dqn2Y57T6f3MpBe44&v=3&callback=createMap"]
);

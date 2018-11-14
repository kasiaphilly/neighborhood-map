/*global google*/
import React, { Component } from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'
import * as FourSquareAPI from './API/APPdata'
import { GM_API } from './API/APPdata'
import { mapDesign } from '../data/mapDesign.js'
import { locations } from '../data/locations.js'
import activePointer from '../img/active-pointer.png'
import pointer from '../img/pointer.png'

let startingLocation = {lat: 39.968918, lng: -75.143}
let newMap
let newPlaces = []
let newMarkers = []
let newInfowindows = []
let infowindow
const type = 'cafe';

class Map extends Component {
    state = {
        fourSquareContent: ''
    }
    componentDidMount() {
        window.initMap = this.initMap
        this.loadJS(`https://maps.googleapis.com/maps/api/js?libraries=places&key=${GM_API}&v=3&callback=initMap`)
    }

    /* Asynchronous Loading
    code source: https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/
    */
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



    //initialization Google Maps
    initMap = () => {
        // create new map
        newMap = new google.maps.Map(document.getElementById('map'), {
            center: startingLocation,
            zoom: 16,
            styles: mapDesign,        // customized graphic design from: https://snazzymaps.com/style/89205/coffee-shop
            mapTypeControl: false,
        })
        // Get Places
        const thisMap = this



        //button FIND HERE
        const findPlaces = document.getElementById('search');
        findPlaces.addEventListener('click', function () {
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
                location: startingLocation,
                radius: 1000,
                type: type,
                bounds: bounds
            }, thisMap.callback);
            thisMap.props.updatePlaces(newPlaces)
        })
        findPlaces.click();
        this.props.updateMap(newMap)

    }
    callback = (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length && i < 5; i++) {
                this.createMarker(results[i]);
            }
            //update places
            this.props.updatePlaces(newPlaces)
            this.props.updateMarkers(newMarkers)
            this.props.updateInfowindows(newInfowindows)
        } else if (status === 'ZERO_RESULTS') {
            alert('No coffe around here...')
        } else {
            alert(`Oops, something went wrong :(
            Status: ${status}`);
        }
    };


    //add new marker
    createMarker = (place) => {
        let marker = new google.maps.Marker({
            name: place.name,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            map: newMap,
            icon: activePointer,      // customized pointer symbol
            id: place.id
        })
        //this.setState((state) => ({ makers: state.markers.concat(newMarker) }))
        let lat = marker.getPosition().lat()
        let lng = marker.getPosition().lng()
        // get FourSquare info
        this.fourSquare(lat, lng, place.name, marker, place)          // change to APPdata ???
        // add place to places
        newPlaces.push(place)
        newMarkers.push(marker)
    }


    /* create marker from list
    let favPlaces []
    favPlaces = locations;
    createFavMarker = (place) => {
          for (let i = 0; i < favPlaces.length; i++) {
          let marker = new google.maps.Marker(
            {
              name: favPlaces.name,
              position: new google.maps.LatLng(favPlaces[i].location.lat, favPlaces[i].location.lng),
              address: favPlaces[i].location.address,
              animation: google.maps.Animation.DROP,
              map: newMap,
              icon: activePointer,      // customized pointer symbol
              id: favPlaces.venueId
         })
         //this.setState((state) => ({ makers: state.markers.concat(newMarker) }))
         let lat = marker.getPosition().lat()
         let lng = marker.getPosition().lng()
         // add place to places
         newPlaces.push(place)
         newMarkers.push(marker)
       }
*/

    // get place information from fourSquare
    fourSquare = (lat, lng, name, marker, place) => {
        return FourSquareAPI.getFSData(lat, lng, name).then(result => {
            if (result.meta.code !== 200 || result === 'err') {
                this.setState({ fourSquareContent:
                        `<section>
                            <p>Oops!
                            Something went wrong :(</p>
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
                        <section class="info-window">
                                <h3 class='info-content' tabindex=0>${place.name}</h3>
                                <h4 tabindex=0><p>Category :</h4>
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

    //Add infowindow
    addInfowindow = (marker, place) => {
        //Add data from FS
        infowindow = new google.maps.InfoWindow({
            content: this.state.fourSquareContent,
            id: place.id,
        });

        //set a11y focus on infowindow
        infowindow.addListener('domready', function () {
            $('.info-content').focus()
        })

        marker.infowindow = infowindow

        //open info window on click

        let clicks=0;

        marker.addListener('click', function () {
        if (clicks%2===0){
            infowindow.open(newMap, marker)
            clicks++;
          } else {
            infowindow.close()
            clicks++;
          }
        }
      )

        //change pointer icon on mouseover
        marker.addListener('mouseover', function() {
          this.setIcon(pointer);
        });
        //change pointer icon back on mouseout
        marker.addListener('mouseout', function() {
          this.setIcon(activePointer);
        });


        //add element to newInfowindows array
        newInfowindows.push(infowindow)
        return infowindow
    }

    render() {
        return (
            <div id='map' tabIndex='-1' aria-describedby="map view applications" aria-hidden="true"></div>
        )
    }
}


export default Map;

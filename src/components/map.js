/*global google*/
import React, { Component } from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'
import * as FourSquareAPI from './API/FourSquare'
import { mapDesign } from '../data/mapDesign.js'

//initial position
const WASHINGTON = {
    lat: 38.903029,
    lng: -77.033071
}
const CALLS_LIMIT = 5
let pos = WASHINGTON
let newMap
let newPlaces = []
let newMarkers = []
let newInfowindows = []
let infowindow
const type = 'restaurant'

class Map extends Component {
    state = {
        fourSquareContent: ''
    }
    componentDidMount() {
        window.initMap = this.initMap
        this.loadJS('https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyD42M9x96sriIW2Q_dqn2Y57T6f3MpBe44&v=3&callback=initMap')
    }

    // code took from https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/
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
    //initialization Google Maps
    initMap = () => {
        // create new map
        newMap = new google.maps.Map(document.getElementById('map'), {
            center: pos,
            zoom: 13,
            styles: mapDesign,        // customized graphic design
            mapTypeControl: false,
        })
        // Get Places
        const thisMap = this




        //button FIND HERE
        const findHere = document.getElementById('search');
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

    //add new marker

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


    //add new marker

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


        //add element to newInfowindows array
        newInfowindows.push(infowindow)
        return marker
    }

    render() {
        return (
            <div id='map' tabIndex='-1' aria-describedby="map view applications" aria-hidden="true"></div>
        )
    }
}

//Check if the Type of variables are correct
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

export default Map;

/*global google*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery'
import menuIcon from '../img/menu64.png';

export default class Sidebar extends Component {

        // make sidebar visible or hidden
        toggleMenu() {
            $('.sidebar').toggleClass('close')
        }

        // show selected item on the map
        chosePointer = (e) => {
            this.props.markers.filter((marker) => {
                if (marker.id === e.target.value) {
                    this.props.infowindows.filter(infowindow => {
                        if (infowindow.id === marker.id) {
                            //set animation for selected marker
                            if (marker.getAnimation() !== null) {
                                marker.setAnimation(null)
                            } else {
                                marker.setAnimation(google.maps.Animation.DROP)
                                marker.setAnimation(null)
                            }
                            // open info window
                            infowindow.open(this.props.map, marker)
                        }
                    })
                }
                else
                    marker.infowindow.close(this.props.map, marker);
            })
        }



    render() {
        const { myPlaces } = this.props
        return (
            <nav className='sidebar'>
                <div role='button' aria-label='open or close side menu' onKeyPress={this.toggleMenu} onClick={this.toggleMenu} className='hamburger-icon' tabIndex='0'></div>
                <span className="text">Philadelphia Coffeeshops</span>
                <input id='search' aria-label='search on map' type='button' value='Find coffeeshops'/>
                    <input aria-label='filter show' className='places-filter' type='text'
                        onChange={(e) => { this.props.updateFilter(e.target.value) }} placeholder='Filter' />
                    <ul id='places-list' aria-label='list places'>
                        {
                            myPlaces && (
                                myPlaces.map((place) => (
                                    <li key={place.id} className='button-list'>
                                        <button className='button' type='button' onClick={this.chosePointer} value={place.id}>
                                            {place.name}</button>
                                    </li>
                                ))
                            )}
                    </ul>
            </nav>
        )
    }

}

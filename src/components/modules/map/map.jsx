import React, { useState, useEffect } from "react";
import L from "leaflet";

import IconsJson from '../../../assets/data/icons.json'
import PinStation from '../../../assets/data/pinStation.json'
import AxiosGet from '../../mixins/axios'

const Map = ({eventsData}) => {

  const [ select, setSelect ] = useState(  )
  const [ init , setInit] = useState(  )

  const setParamsUp = (e) => {
    let newParams = {
      meterRage: 1500
    }
    newParams.eventIds = e
  }

  let formatedParams = setParamsUp()
  const [ params, setParams ] = useState( formatedParams )


  const mapAppFunc = () => {
    
    let circles = [];
    let maker = [];
    let eventsData = [];
    let maker1 = [];
    let nivZoom = 13; // initial zoom level
    let currentView = [48.8620543, 2.3449645];
    setInit(true)

    let mymap = L.map("map_id",{
      scrollWheelZoom: false
    }).setView(currentView, nivZoom); // we initialize the map
    let eventLocation = eventsData; //dummy data in the goal to try  the principle

    let Icon = L.Icon.extend({
      // Création d'icone personalisée
       // Créer une variable suivant une condition
      options :{
        iconSize: [50, 63], // size of the icon
        iconAnchor: [25, 63], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
      }
    }); // We initialise the icon
    let stationIcon = L.Icon.extend({
      // Création d'icone personalisée
      options : {
        iconSize: [30, 34], // size of the icon
        iconAnchor: [25, 34], // point of the icon which will correspond to marker's location
        popupAnchor: [-10, -34] // point from which the popup should open relative to the iconAnchor
      }
    }); // We initialise the icon

    const init = () => {
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZG9uYXdhbHQiLCJhIjoiY2s2aG96NWFnMWNobTNlbnZ2aG9pa2ZpNSJ9.nNX6JxGCXLmb91C0NpSaWw",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> by students from HETIC',
          maxZoom: 18,
          id: "donawalt/ck6hp89630sim1iqoifge5e0x",
          accessToken:
            "pk.eyJ1IjoiZG9uYXdhbHQiLCJhIjoiY2s2aG96NWFnMWNobTNlbnZ2aG9pa2ZpNSJ9.nNX6JxGCXLmb91C0NpSaWw"
        }
      ).addTo(mymap); // We had the tile layer from mapbox

      mymap.dragging.disable();
    };

    const onClickPin = (el, data) => {
      maker[el].on("click", e => {
        nivZoom = 15;
        currentView = [ eventsData[el].Lat, eventsData[el].Lng ];
        mymap.setView(currentView, nivZoom);

        mymap.on("zoomend", function() {
          let mapCenter = mymap.getCenter();
          console.log(mapCenter)
          let pinLocation = L.latLng([ eventsData[el].Lat, eventsData[el].Lng ]);
          let mapCenterLat = (Math.round(mapCenter.lat * 1000) / 1000).toFixed(
            3
          );
          let mapCenterLng = (Math.round(mapCenter.lng * 1000) / 1000).toFixed(
            3
          );
          let pinLocationLat = (
            Math.round(pinLocation.lat * 1000) / 1000
          ).toFixed(3);
          let pinLocationLng = (
            Math.round(pinLocation.lng * 1000) / 1000
          ).toFixed(3);

          if (
            mapCenterLat === pinLocationLat &&
            mapCenterLng === pinLocationLng
          ) {
            eventsData[el].stations = Object.values(PinStation)
            console.log(eventsData[el].stations)
            let eventStations = eventsData[el].stations;
            console.log(eventStations)
            if (eventStations.length > 1) {
              eventStations.map(function(element, index) {
                console.log(element)
                let maker1Value = L.marker([ element.Lat, element.Lng ], {
                  icon: new stationIcon({iconUrl:  require(`../../../assets/icons/sports/station/pin-${index+1}.png`)})
                })
                maker1.push(maker1Value);
                maker1.forEach(element => {
                  mymap.removeLayer(element);
                });
                let zoomlevel = mymap.getZoom();
                if (zoomlevel < 15) {
                  mymap.removeLayer(maker[el]);
                  maker.forEach(element => element.addTo(mymap));
                  mymap.removeLayer(circles[el]);
                  maker1.forEach(element => {
                    mymap.removeLayer(element);
                    maker1 = [];
                  });
                } else if (zoomlevel >= 15) {
                  maker.forEach(element => mymap.removeLayer(element));
                  maker[el].addTo(mymap);
                  mymap.addLayer(circles[el]);
                  maker1.forEach(element => {
                    element.addTo(mymap);
                  });
                }
                console.log("Current Zoom Level =" + zoomlevel);
              });
            } else {
              let zoomlevel = mymap.getZoom();
              if (zoomlevel < 15) {
                maker.forEach(element => element.addTo(mymap));
                mymap.removeLayer(circles[el]);
              } else if (zoomlevel >= 15) {
                maker.forEach(element => mymap.removeLayer(element));
                maker[el].addTo(mymap);
                mymap.addLayer(circles[el]);
              }
            }
          }
        });
      });
    };

    const instance = () => {
      eventLocation.map((element, i) => {
        eventsData.push(element);
        Object.values(IconsJson).forEach(icon => {
          if ( icon.id === eventsData[i].id_federation ) {
            eventsData[0].icon = icon.icon
          }
        });
        let makerValue = L.marker([ eventsData[i].Lat, eventsData[i].Lng ], { icon: new Icon({ iconUrl: require(`../../../assets/icons/sports/map/${eventsData[0].icon}.png`)}) });
        let circleValue = L.circle([ eventsData[i].Lat, eventsData[i].Lng ], {
          color: "blue",
          fillColor: "blue",
          fillOpacity: 0.1,
          radius: 750
        });
        maker.push(makerValue);
          circles.push(circleValue);
          maker[i].addTo(mymap);
          maker[i].bindPopup(
            "<b>" + eventsData[i].name + "</b><br>" + eventsData[i].location
          );
          return onClickPin(i, element);
      });
      
    };

    const main = () => {
      init();
      instance();
    };

    return main(); // Run the main  function
  }

  useEffect(()=> {
    mapAppFunc()
  },[]);
  
  return (
    <div id="map_id" className="map" style={{height: '1000px'}} />
    );
}

export default Map;

import React, { useEffect, useState } from 'react';
import './display.css';
import Axios from 'axios';
import useSound from 'use-sound';
import alarmSound from '../sounds/alarm.mp3';
import normal from '../sounds/normal.mp3';
import { dataRef } from '../Firebase';
import { MdCancel } from "react-icons/md";
import { useSpeechSynthesis } from 'react-speech-kit'; // Import useSpeechSynthesis hook

function Display() {
  const [temp, setTemp] = useState(null);
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState('');
  const [bpm, setBpm] = useState('');
  const [alert, setAlert] = useState(false);
  const [notification, setNotification] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });



  const { speak } = useSpeechSynthesis(); // Initialize the useSpeechSynthesis hook

  const getDatafromDB = () => {
    try {
      dataRef.ref().child('test').on('value', (snapshot) => {
        const getData = snapshot.val();
        if (getData) {
          setTemp(getData.temp);
          setBpm(getData.bpm);
          setAlert(getData.irValue);
          setDistance(getData.distance);
          console.log(distance)
          if (getData.irValue > 1.1) {
            setNotification(true);
          } else {
            setNotification(false);
          }
          if (Number(getData.distance) < 15) {
            speak({ text: 'Obstacle ahead. Turn left or Right .' });
          } 
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  

  useEffect(() => {
    const fetchDataInterval = setInterval(() => {
      getDatafromDB();
    }, 1000);

    return () => clearInterval(fetchDataInterval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          getAddress(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error(error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const getAddress = (latitude, longitude) => {
    Axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
      .then((response) => {
        const results = response.data.address;
        setAddress(results.road);
      })
      .catch((error) => {
        console.error("Error fetching address:", error);
        setAddress('Error fetching address');
      });
  };

  const closeNotification = () => {
    setNotification(false);
  };

  return (
    <>
      {notification &&
        <div className='Notification'>
          <div>
            <span>Alert user Need Help............................!!!!</span>
          </div>
          <div>
            <button className='closeBtn' onClick={closeNotification}><MdCancel/></button>
          </div>
        </div>
      }
      <div className='main'>
        <div className="rate">
          <div>
            <span>Pulse</span>
            <h1>{bpm} bpm</h1>
          </div>
        </div>
        <div className="rate">
          <div>
            <span>Live Location</span> <br />
            <span style={{ color: "green" }}>{address || 'Fetching location...'}</span> <br />
            <span style={{ color: "green" }}>{currentLocation.latitude}, {currentLocation.longitude}</span>
          </div>
        </div>
        <div className="rate">
          <div>
            <span>Temperature</span>
            <h1>{temp}</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default Display;

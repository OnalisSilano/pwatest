
let motionDetected = false;
let alarmTimeout;

function requestMotionAccess() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotionEvent);
        } else {
          document.getElementById('status').textContent = 'Permission for DeviceMotionEvent not granted.';
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices.
    window.addEventListener('devicemotion', handleMotionEvent);
  }
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  const accelerationValue = Math.hypot(acceleration.x, acceleration.y, acceleration.z);

  if (accelerationValue > 1) {
    // Motion detected
    motionDetected = true;
    clearTimeout(alarmTimeout);
    document.getElementById('status').textContent = 'Motion detected!';
    document.getElementById('alarm').style.display = 'none';
    stopAlarm();
  } else {
    // No motion
    motionDetected = false;
    document.getElementById('status').textContent = 'No motion detected.';
    setAlarmTimeout();
  }
}

function setAlarmTimeout() {
  clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(() => {
    if (!motionDetected) {
      // No motion for 30 seconds, trigger alarm
      document.getElementById('status').textContent = 'No motion detected for 30 seconds.';
      document.getElementById('alarm').style.display = 'block';
      playAlarm();
    }
  }, 30000); // 30 seconds
}

function playAlarm() {
  const alarmText = document.getElementById('alarmText');
  alarmText.style.display = 'block';
  const alarmSound = document.getElementById('alarmSound');
  alarmSound.play();
}

function stopAlarm() {
  const alarmText = document.getElementById('alarmText');
  alarmText.style.display = 'none';
  const alarmSound = document.getElementById('alarmSound');
  alarmSound.pause();
  alarmSound.currentTime = 0;
}

const requestPermissionButton = document.getElementById('request-permission-button');
requestPermissionButton.addEventListener('click', requestMotionAccess);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}

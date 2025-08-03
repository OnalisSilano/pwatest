let alarmTimeout;
const threshold = 1; // Motion detection threshold
const alarmDelay = 30000; // 30 seconds

function requestMotionAccess() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleMotionEvent);
          document.getElementById('status').textContent = 'Monitoring for motion...';
          resetAlarmTimer(); // Start the timer as soon as monitoring begins
        } else {
          document.getElementById('status').textContent = 'Permission for DeviceMotionEvent not granted.';
        }
      })
      .catch(console.error);
  } else {
    // For non-iOS 13+ devices
    window.addEventListener('devicemotion', handleMotionEvent);
    document.getElementById('status').textContent = 'Monitoring for motion...';
    resetAlarmTimer(); // Start the timer as soon as monitoring begins
  }
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  const accelerationValue = Math.hypot(acceleration.x, acceleration.y, acceleration.z);

  // If motion is detected, reset the alarm timer
  if (accelerationValue > threshold) {
    document.getElementById('status').textContent = 'Motion detected!';
    // If the alarm is ringing, stop it
    if (document.getElementById('alarm').style.display === 'block') {
        document.getElementById('alarm').style.display = 'none';
        stopAlarm();
    }
    resetAlarmTimer();
  }
}

function resetAlarmTimer() {
  // Clear the existing timer
  clearTimeout(alarmTimeout);

  // Set a new timer
  alarmTimeout = setTimeout(() => {
    // If the timer fires, it means there has been no motion for the specified delay
    document.getElementById('status').textContent = `No motion for ${alarmDelay / 1000} seconds.`;
    document.getElementById('alarm').style.display = 'block';
    playAlarm();
  }, alarmDelay);
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
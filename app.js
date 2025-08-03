let alarmTimeout;
let countdownInterval;
const threshold = 1.2; // Motion detection threshold
const alarmDelay = 30000; // 30 seconds

function requestMotionAccess() {
  console.log("Requesting motion access...");
  const alarmSound = document.getElementById('alarmSound');

  // Pre-load the sound and try to unlock it on the first user gesture.
  alarmSound.load();
  const playPromise = alarmSound.play();
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      // Automatic playback started!
      // Stop the sound immediately.
      alarmSound.pause();
      alarmSound.currentTime = 0;
      console.log("Audio playback unlocked.");
    }).catch(error => {
      // Auto-play was prevented
      console.log("Audio playback unlock failed. Will try again on alarm.");
    });
  }

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log("Motion access granted.");
          window.addEventListener('devicemotion', handleMotionEvent);
          document.getElementById('status').textContent = 'Monitoring for motion...';
          resetAlarmTimer();
        } else {
          console.log("Motion access denied.");
          document.getElementById('status').textContent = 'Permission for DeviceMotionEvent not granted.';
        }
      })
      .catch(console.error);
  } else {
    // For non-iOS 13+ devices
    console.log("Using standard devicemotion event.");
    window.addEventListener('devicemotion', handleMotionEvent);
    document.getElementById('status').textContent = 'Monitoring for motion...';
    resetAlarmTimer();
  }
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const accelerationValue = Math.hypot(acceleration.x, acceleration.y, acceleration.z);
  document.getElementById('acceleration-value').textContent = `Acceleration: ${accelerationValue.toFixed(5)}`;

  if (accelerationValue > threshold) {
    if (document.getElementById('status').textContent !== 'Motion detected!') {
        document.getElementById('status').textContent = 'Motion detected!';
    }
    if (document.getElementById('alarm').style.display === 'block') {
        document.getElementById('alarm').style.display = 'none';
        stopAlarm();
    }
    resetAlarmTimer();
  } else {
    if (document.getElementById('status').textContent !== 'Monitoring for motion...') {
        document.getElementById('status').textContent = 'Monitoring for motion...';
    }
  }
}

function resetAlarmTimer() {
  clearTimeout(alarmTimeout);
  clearInterval(countdownInterval);
  console.log("Alarm timer reset.");

  let remainingTime = alarmDelay;
  document.getElementById('countdown').textContent = `Time until alarm: ${(remainingTime / 1000).toFixed(3)}s`;

  countdownInterval = setInterval(() => {
    remainingTime -= 10;
    if (remainingTime >= 0) {
        document.getElementById('countdown').textContent = `Time until alarm: ${(remainingTime / 1000).toFixed(3)}s`;
    }
  }, 10);

  alarmTimeout = setTimeout(() => {
    console.log("Timer expired. Attempting to play alarm.");
    clearInterval(countdownInterval);
    document.getElementById('status').textContent = `No motion for ${alarmDelay / 1000} seconds.`;
    document.getElementById('alarm').style.display = 'block';
    playAlarm();
  }, alarmDelay);
}

function playAlarm() {
  console.log("playAlarm() called.");
  const alarmText = document.getElementById('alarmText');
  alarmText.style.display = 'block';
  const alarmSound = document.getElementById('alarmSound');
  alarmSound.currentTime = 0; // Reset time to the beginning

  const playPromise = alarmSound.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      console.log("Alarm sound playing successfully.");
    }).catch(error => {
      console.error("Failed to play alarm sound:", error);
      alert("Could not play alarm sound. Please interact with the page again.");
    });
  }
}

function stopAlarm() {
  console.log("stopAlarm() called.");
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
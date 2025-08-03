let alarmTimeout;
let countdownInterval;
const threshold = 12; // Motion detection threshold
const alarmDelay = 30000; // 30 seconds

// Element references
const statusEl = document.getElementById('status');
const countdownEl = document.getElementById('countdown');
const accelerationValueEl = document.getElementById('acceleration-value');
const alarmEl = document.getElementById('alarm');
const alarmTextEl = document.getElementById('alarmText');
const alarmSound = document.getElementById('alarmSound');
const requestPermissionButton = document.getElementById('request-permission-button');
const stopAlarmButton = document.getElementById('stop-alarm-button');

function requestMotionAccess() {
  console.log("Requesting motion access...");

  // Pre-load the sound and try to unlock it on the first user gesture.
  alarmSound.load();
  const playPromise = alarmSound.play();
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      console.log("Audio playback unlocked.");
    }).catch(error => {
      console.log("Audio playback unlock failed. Will try again on alarm.");
    });
  }

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log("Motion access granted.");
          window.addEventListener('devicemotion', handleMotionEvent);
          statusEl.textContent = 'Monitoring for motion...';
          resetAlarmTimer();
        } else {
          console.log("Motion access denied.");
          statusEl.textContent = 'Permission for DeviceMotionEvent not granted.';
        }
      })
      .catch(console.error);
  } else {
    console.log("Using standard devicemotion event.");
    window.addEventListener('devicemotion', handleMotionEvent);
    statusEl.textContent = 'Monitoring for motion...';
    resetAlarmTimer();
  }
  // Hide the request button after it's clicked
  requestPermissionButton.style.display = 'none';
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) return;

  const accelerationValue = Math.hypot(acceleration.x, acceleration.y, acceleration.z);
  accelerationValueEl.textContent = `Acceleration: ${accelerationValue.toFixed(5)}`;

  if (accelerationValue > threshold) {
    // Motion detected, reset the timer
    resetAlarmTimer();
  } else {
    // No motion is detected
    if (statusEl.textContent !== 'Monitoring for motion...' && alarmEl.style.display !== 'block') {
        statusEl.textContent = 'Monitoring for motion...';
    }
  }
}

function resetAlarmTimer() {
  // Stop any currently playing alarm and hide alarm elements
  stopAlarm(false); // Pass false to prevent a recursive loop

  clearTimeout(alarmTimeout);
  clearInterval(countdownInterval);
  console.log("Alarm timer reset.");

  statusEl.textContent = 'Monitoring for motion...';

  let remainingTime = alarmDelay;
  countdownEl.textContent = `Time until alarm: ${(remainingTime / 1000).toFixed(3)}s`;

  countdownInterval = setInterval(() => {
    remainingTime -= 10;
    if (remainingTime >= 0) {
        countdownEl.textContent = `Time until alarm: ${(remainingTime / 1000).toFixed(3)}s`;
    }
  }, 10);

  alarmTimeout = setTimeout(() => {
    console.log("Timer expired. Attempting to play alarm.");
    clearInterval(countdownInterval);
    statusEl.textContent = `No motion for ${alarmDelay / 1000} seconds.`;
    playAlarm();
  }, alarmDelay);
}

function playAlarm() {
  console.log("playAlarm() called.");
  alarmEl.style.display = 'block';
  alarmTextEl.style.display = 'block';
  stopAlarmButton.style.display = 'block'; // Show the stop button
  alarmSound.currentTime = 0;

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

function stopAlarm(shouldResetTimer = true) {
  console.log(`stopAlarm() called. Reset timer: ${shouldResetTimer}`);
  alarmEl.style.display = 'none';
  alarmTextEl.style.display = 'none';
  stopAlarmButton.style.display = 'none'; // Hide the stop button
  alarmSound.pause();
  alarmSound.currentTime = 0;

  if (shouldResetTimer) {
    // After stopping the alarm, go back to monitoring
    resetAlarmTimer();
  }
}

// Event Listeners
requestPermissionButton.addEventListener('click', requestMotionAccess);
stopAlarmButton.addEventListener('click', () => stopAlarm(true));

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}
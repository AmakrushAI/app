
export function recordUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(saveUserLocation);
    }
}

function saveUserLocation(position: any) {
    sessionStorage.setItem('userLat', position.coords.latitude);
    sessionStorage.setItem('userLong', position.coords.longitude);
}


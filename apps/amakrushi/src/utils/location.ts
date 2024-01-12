import { toast } from 'react-hot-toast';

export async function recordUserLocation() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(saveUserLocation);
        }
        let apiRes: any = await fetch('https://api.ipify.org?format=json');
        apiRes = await apiRes.json();
        if (apiRes?.ip) {
            let locationRes: any = await fetch(`https://geoip.samagra.io/city/${apiRes.ip}`);
            locationRes = await locationRes.json();
            sessionStorage.setItem('city', locationRes.city);
            sessionStorage.setItem('state', locationRes.regionName);
        }
    } catch (err) {
        console.log(err)
        toast.error('Unable to record user location')
    }
}

function saveUserLocation(position: any) {
    sessionStorage.setItem('latitude', position.coords.latitude);
    sessionStorage.setItem('longitude', position.coords.longitude);
}


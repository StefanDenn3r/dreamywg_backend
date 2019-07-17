import http = require('http');

export async function convertAddressToCoordinate(address){
    // TODO API key should be stored in config
    const urlParam = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}=AIzaSyBPLTJT4_5icxwmLgW8YyXvN7BdTprCPj4`
    let response = await http.get(urlParam)
    console.log(response);
}
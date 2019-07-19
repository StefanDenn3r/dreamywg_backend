import http = require('http');

export async function convertAddressToCoordinate(address){
    // TODO API key should be stored in config
    const urlParam = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}=AIzaSyCoKWfHbsSmyyM3PUpoEifplwkk2iZihJE`
    let response = await http.get(urlParam)
    console.log(response);
}
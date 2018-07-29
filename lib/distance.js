const _ = require('lodash');
const request = require('request');

const google_api = 'https://maps.googleapis.com/maps/api/distancematrix';
const Distances = require('../models')['Distances'];

const validateParams = function(a) {
  if (a.constructor !== Array) {
    return false;
  }
  if (a.length != 2) {
    return false;
  }
  if (isNaN(a[0]) || isNaN(a[1])) {
    return false;
  }
  return a;
};

const getData = function(origin, destination) {
  let path =
    '/json?origins=' +
    origin[0] +
    ',' +
    origin[1] +
    '&destinations=' +
    destination[0] +
    ',' +
    destination[1] +
    '&key=' +
    'AIzaSyBx69JIDelx4NJRQPNsLZE7uQlL1ErP_Mo';

  return new Promise((resolve, reject) => {
    request(google_api + path, function(error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      // console.log('body:', body); // Print the HTML for the Google homepage.
      if (response.statusCode == 200) {
        body = JSON.parse(body);
        let distance = body['rows'][0].elements[0].distance.value;
        let time = body['rows'][0].elements[0].duration.value;
        return resolve({
          distance,
          time
        });
      } else {
        return resolve(null);
      }
    });
  });
};

let distanceService = {
  getDistance: function(a, b) {
    if (!validateParams(a) || !validateParams(b)) {
      return Promise.resolve(null);
    }
    return Distances.findOne({
      where: { origin: JSON.stringify(a), destination: JSON.stringify(b) }
    }).then(distance => {
      if (distance === null) {
        return getData(a, b).then(data => {
          return distanceService.saveDistance({
            origin: JSON.stringify(a),
            destination: JSON.stringify(b),
            distance: data.distance,
            time: data.time
          });
        });
      } else return Promise.resolve(distance);
    });
  },
  list: function() {
    return Distances.findAll();
  },
  saveDistance: function(params) {
    return Distances.create(params);
  },
  test: function() {
    return Distances.destroy({ where: { id: [1, 2, 3] } });
  }
};
module.exports = distanceService;

const _ = require('lodash');
const Promise = require('bluebird');

const Routes = require('../models')['Routes'];
let distanceService = require('./distance');

let validateParams = function(params) {
  if (!('token' in params)) return false;
  if (!('path' in params)) return false;
  if (params['path'].constructor !== Array) return false;
  if (params['path'].length < 2) return false;
  params['path'] = JSON.stringify(params['path']);
  params['status'] = 'in progress';
  params['distance'] = -1;
  params['time'] = -1;
  return params;
};

let route = {
  getToken: function(token) {
    return Routes.findOne({ where: { token } });
  },
  createToken: function(token, path) {
    let params = validateParams({ token, path });
    if (params !== false) return Routes.create(params);
    else return Promise.resolve(null);
  },
  updateRoute: function(params) {
    return Routes.update(params, { where: { token: params.token } });
  },
  shortestPath: function(start, waypoints) {
    if (waypoints.length == 1) return Promise.resolve(waypoints);
    return new Promise((resolve, reject) => {
      Promise.map(waypoints, function(waypoint) {
        return route.shortestPath(waypoint, _.without(waypoints, waypoint));
      }).then(paths => {
        Promise.map(paths, value => {
          return route.getPathDistance(start, value);
        }).then(values => {
          let failed = _.indexOf(values, null);
          if (failed !== -1) {
            resolve(null);
          }
          let min = _.min(values);
          resolve(
            _.concat(
              [waypoints[_.indexOf(values, min)]],
              paths[_.indexOf(values, min)]
            )
          );
        });
      });
    });
  },
  getPathDistance: function(start, waypoints) {
    var all = [];
    all.push(
      distanceService
        .getDistance(start, waypoints[0])
        .then(distance => distance['distance'])
    );

    for (let i = 1; i < waypoints.length; ++i)
      all.push(
        distanceService
          .getDistance(waypoints[i - 1], waypoints[i])
          .then(distance => distance['distance'])
      );

    return Promise.all(all).then(values => {
      return _.sum(values);
    });
  },
  getPathTime: function(start, waypoints) {
    var all = [];
    all.push(
      distanceService
        .getDistance(start, waypoints[0])
        .then(distance => distance['time'])
    );

    for (let i = 1; i < waypoints.length; ++i)
      all.push(
        distanceService
          .getDistance(waypoints[i - 1], waypoints[i])
          .then(distance => distance['time'])
      );

    return Promise.all(all).then(values => {
      return _.sum(values);
    });
  }
};

module.exports = route;

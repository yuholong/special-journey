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
    // return waypoints (without start) in order as shortest distance from start
    if (waypoints.length == 1) return Promise.resolve(waypoints);
    return new Promise((resolve, reject) => {
      Promise.map(waypoints, function(waypoint) {
        return route.shortestPath(waypoint, _.without(waypoints, waypoint));
      }).then(paths => {
        Promise.map(paths, path => {
          return route.getPathDetails(start, path);
        }).then(details => {
          let values = _.map(details, 'distance');
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
  getPathDetails: function(start, waypoints) {
    var all = [];
    all.push(
      distanceService.getDistance(start, waypoints[0]).then(distance => {
        if (distance == null) return null;
        return { distance: distance['distance'], time: distance['time'] };
      })
    );

    for (let i = 1; i < waypoints.length; ++i)
      all.push(
        distanceService
          .getDistance(waypoints[i - 1], waypoints[i])
          .then(distance => {
            if (distance == null) return null;
            return { distance: distance['distance'], time: distance['time'] };
          })
      );

    return Promise.all(all).then(values => {
      return {
        distance: _.sumBy(values, 'distance'),
        time: _.sumBy(values, 'time')
      };
    });
  }
};

module.exports = route;

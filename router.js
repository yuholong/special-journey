var express = require('express');
var router = express.Router();
const md5 = require('md5');
const _ = require('lodash');

let routeService = require('./lib/route');

let calculatePath = function(token, locations) {
  let start = locations[0];
  let waypoints = _.without(locations, start);
  return routeService
    .getToken(token)
    .then(route => {
      if (route === null) {
        return routeService.createToken(token, locations);
      } else if (route['status'] != 'success') {
        return Promise.resolve(route);
      } else return Promise.resolve(null); // token existed and status is success -> done
    })
    .then(route => {
      if (route === null) return; // shortest path calculated before, no work to be done
      routeService.shortestPath(start, waypoints).then(path => {
        if (path === null)
          return routeService.updateRoute({
            token,
            status: 'failure'
          });
        return routeService.getPathDetails(start, path).then(details => {
          routeService.updateRoute({
            token,
            status: 'success',
            path: JSON.stringify(_.concat([start], path)),
            distance: details['distance'],
            time: details['time']
          });
        });
      });
    });
};

router.use(express.json(), express.urlencoded({ extended: true }));

router.post('/route', function(req, res) {
  if (req.body.constructor !== Array)
    return res.send({ error: 'Input body is invalid.' });
  if (req.body.length < 2)
    return res.send({ error: 'There is no dropoff locations provided.' });
  let start = req.body[0];
  let waypoints = _.without(req.body, start);
  waypoints.sort();
  let token = md5(JSON.stringify({ start, waypoints }));
  res.send(token);
  calculatePath(token, req.body);
});

router.get('/route/:token', function(req, res) {
  let token = req.params.token;
  return routeService.getToken(token).then(route => {
    if (route === null) return res.send({ error: 'Invalid token.' });
    if (route.status == 'failure')
      res.send({
        status: 'failure',
        error: 'Google API rate limit exceeded.'
      });
    else
      res.send({
        status: route.status,
        path: JSON.parse(route.path),
        total_distance: route.distance,
        total_time: route.time
      });
  });
});
module.exports = router;

'use strict';

const express = require('express');
const md5 = require('md5');
const _ = require('lodash');

const PORT = 3000;

const app = express();
let distanceService = require('./lib/distance');
let routeService = require('./lib/route');

app.use(express.json(), express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  return distanceService.list().then(all => {
    res.send(all);
  });
  // res.send(md5('Hello world'));
});

app.post('/route', function(req, res) {
  if (req.body.constructor !== Array)
    return res.send({ error: 'Input body is invalid.' });
  if (req.body.length < 2)
    return res.send({ error: 'There is no dropoff locations provided.' });
  let start = req.body[0];
  let waypoints = _.without(req.body, start);
  waypoints.sort();
  let token = md5(JSON.stringify({ start, waypoints }));
  res.send(token);
  // After sending the token back, start the calculation of the shortest path
  routeService
    .getToken(token)
    .then(route => {
      if (route === null) {
        return routeService.createToken(token, req.body);
      } else if (route['status'] != 'success') {
        return Promise.resolve(route);
      } else return Promise.resolve(null);
    })
    .then(route => {
      if (route === null) return; // shortest path calculated before, no work to be done
      routeService.shortestPath(start, waypoints).then(path => {
        if (path === null)
          return routeService.updateRoute({
            token,
            status: 'failure'
          });
        let _path = _.concat([start], path);
        return routeService
          .getPathDetails(start, _.without(path, start))
          .then(details => {
            routeService.updateRoute({
              token,
              status: 'success',
              path: JSON.stringify(_path),
              distance: details['distance'],
              time: details['time']
            });
          });
      });
    });
});

app.get('/route/:token', function(req, res) {
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

app.listen(PORT);
console.log(process.env.NODE_ENV);
console.log('Running on http://localhost:' + PORT);

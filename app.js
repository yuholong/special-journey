'use strict';

const express = require('express');
const app = express();

const router = require('./router');

const PORT = 3000;

app.use('/', router);

app.listen(PORT);
console.log('environment: ' + process.env.NODE_ENV);
console.log('Running on http://localhost:' + PORT);

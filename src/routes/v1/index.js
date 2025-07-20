const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const logRoute = require('./logs.route');
const hrRoute = require('./hr.route');
const designationRoute = require('./designation.route');
const projectRoute = require('./project.route');



const attendanceRoute = require('./attendance.route');

const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/logs',
    route: logRoute,
  },
  {
    path: '/attendance',
    route: attendanceRoute,
  },
  {
    path: '/hr',
    route: hrRoute,
  },
  {
    path: '/designation',
    route: designationRoute,
  },
  {
    path: '/project',
    route: projectRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

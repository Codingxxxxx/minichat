module.exports = {
  serverErrorHandle: require('./500.middleware'),
  requestLog: require('./request-log.middleware'),
  checkAuth: require('./auth.middleware')
}
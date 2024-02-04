const nunjucks = require('nunjucks');
const { AppConfig } = require('../const');

const html = nunjucks.configure('views', {
  noCache: true,
  throwOnUndefined: AppConfig.NODE_ENV === 'development'
})

module.exports = html;


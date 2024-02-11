const { Logger } = require('../libs');

/**
 * 
 * @param {import('express').Errback} err 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = async function (err, req, res, next) {
  // fields that should not be logged
  const excludeFields = [
    'password',
    'creditcard'
  ]

  let requestBody = {};
  // remove sensitive fields before logging
  if (req.body && Object.keys(req.body).length > 0) {
    requestBody = Object.entries(req.body)
      .filter(([key]) => {
        return !excludeFields.some(field => field.toLowerCase() === key.toLowerCase());
      });

    requestBody = Object.fromEntries(requestBody);    
  }

  const message = `Server Error 500\nBody: ${JSON.stringify(requestBody, null, 2)}\nParams: ${JSON.stringify(req.params, null, 2)}\nQueryString: ${JSON.stringify(req.query, null, 2)}\n`;
  Logger.error(message, err);
  res.sendStatus(500);
}
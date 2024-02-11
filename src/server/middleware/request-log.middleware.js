const { Logger } = require('../libs');

/**
 * Log request metadata 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = async function (req, res, next) {
  try {
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

    const meatadata = {
      method: req.method,
      url: req.url,
      body: requestBody,
      queryString: req.query,
      params: req.params
    }
    console.log(meatadata)
    Logger.info('Request metadata', meatadata)

    next();
  } catch (error) {
    next(error);
  }
}
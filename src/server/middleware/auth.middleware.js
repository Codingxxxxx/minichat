const { Auth } = require('../libs');

/**
 * Check authentication
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = async function(req, res, next) {
  try {
    // validate token
    const accessToken = (req.get('Authorization') || '').split(' ')[1];

    if (!accessToken) return res.sendStatus(401);
    
    const payload = await Auth.decodeJWT(accessToken).catch(() => {});

    if (!payload) return res.sendStatus(401);

    res.locals = {
      userId: payload.userId,
      username: payload.username
    }

    next();
  } catch (error) {
    next(error);
  }
}
const router = require('express').Router();
const { Validator, Auth, Mail, Logger, HTML } = require('./../libs');
const { redisClient } = require('../libs').RedisClient;
const { API, AppConfig, Redis } = require('./../const');
const { UserService } = require('../services');
const moment = require('moment');

router.post('/signin', async (req, res, next) => {
  try {
    if (!Validator.validateSignIn(req.body)) return res.status(400).json({
      code: API.ERROR_VALIDATION,
      data: {
        errors: Validator.validateSignIn.errors
      }
    })

    const user = await UserService.getUserByUsername(req.body.username);
    
    if (!user) return res.status(400).json({
      code: API.ERROR_USER_INVALID
    })

    // check user password
    const [derivedPassword, salt] = await Auth.hashPassword(req.body.password, user.salt);
    
    if (derivedPassword !== user.password) return res.status(400).json({
      code: API.ERROR_USER_INVALID
    })

    // create login history
    await UserService.addLoginHistory(user._id, {
      loginAt: Date.now(),
      ip: req.ip,
      address: '',
      userAgent: req.get('User-Agent')
    })

    const accessToken = await Auth.signJWT({ username: user.username, userId: user._id });
    const refreshToken = await Auth.signRefreshToken();

    res.status(200).json({
      data: {
        auth: {
          accessToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    next(error);
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    if (!Validator.validateSignUp(req.body)) return res.status(400).json({
      code: API.ERROR_VALIDATION,
      data: {
        errors: Validator.validateSignUp.errors
      }
    })

    // check if username is used
    if (await UserService.getUserByUsername(req.body.username.trim())) return res.status(400).json({
      code: API.ERROR_USERNAME_TAKEN
    })

    const { username, password, email } = req.body;
    const [derivedPassword, salt] = await Auth.hashPassword(password);

    const user = await UserService.create({
      username,
      email,
      password: derivedPassword,
      salt
    })

    const token = await Auth.createRandomToken();

    await UserService.createUserVerificationToken({
      userId: user._id,
      token,
      expirationDate: moment().add(15, 'minute') // expire in 15 minutes from now
    })
    
    HTML.render('pages/mail/user-verification.html', {
      username,
      verificationLink: AppConfig.USER_VERIFICATION_URL + `?token=${token}`
    }, (error, html) => {
      if (error) return Logger.error(`failed to render html template`, error);
      Mail.sendMail({
        to: email.trim(),
        subject: 'Account verification required',
        html
      })  
      .catch(error => {
        Logger.error(`Failed to send verification email to ${email.trim()}`, error);
      })
    })
    
    res.status(201).json();
  } catch (error) {
    next(error);
  }
})

router.get('/verify', async (req, res, next) => {
  try {
    if (!req.query.token) return res.sendStatus(400);
    const userVerificationRecord = await UserService.getUserByToken(req.query.token);

    // invalid token
    if (!userVerificationRecord) return res.sendStatus(400)
    
    const { _id, userId } = userVerificationRecord;

    await UserService.setUserIsVerified(userId, true);
    await UserService.removeVerificationToken(_id);
    res.status(200).json();
  } catch (error) {
    next(error);
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.body;
    if (!accessToken || !refreshToken) return res.sendStatus(400);

    // switch database
    await redisClient.select(Redis.Database.JWT_CACHE);

    const payloadRefreshToken = await Auth.decodeRefreshToken(refreshToken).catch(() => {}); // ignore error
    
    if (payloadRefreshToken) {
      const expirationTime = moment.unix(payloadRefreshToken.exp);
      const expiresIn = expirationTime.diff(moment(), 'seconds');
      await redisClient.setEx(`jwt-refresh-${refreshToken}`, expiresIn, '');
    }

    const payloadAccessToken = await Auth.decodeJWT(accessToken).catch(() => {}); // also ignore error

    if (payloadAccessToken) {
      const expirationTime = moment.unix(payloadAccessToken.exp);
      const expiresIn = expirationTime.diff(moment(), 'seconds');
      await redisClient.setEx(`jwt-access-${accessToken}`, expiresIn, '');
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
})

router.post('/revoke', async (req, res, next) => {
  try {
    const isValid = req.body.accessToken && req.body.refreshToken;
    if (!isValid) return res.sendStatus(400);

    const { accessToken, refreshToken } = req.body;

    const payloadRefreshToken = await Auth.decodeRefreshToken(refreshToken).catch(() => {}); // ignore error

    // if payloadRefreshToken is empty, it means the refresh token is already expired
    if (!payloadRefreshToken) return res.sendStatus(400);

    const payloadAccessToken = await Auth.decodeJWT(accessToken, true).catch(() => {}); // also ignore error

    // invalid access token
    if (!payloadAccessToken) return res.sendStatus(400);
    
    await redisClient.select(Redis.Database.JWT_CACHE);
    
    // check if access token and refresh token are in black list
    const isTokenInBlackList = await redisClient.exists(`jwt-refresh-${refreshToken}`) || await redisClient.exists(`jwt-access-${refreshToken}`);
    if (isTokenInBlackList) return res.sendStatus(400);
    
    // set refresh token to blacklist 
    let expirationTime = moment.unix(payloadRefreshToken.exp);
    let expiresIn = expirationTime.diff(moment(), 'seconds');
    // lower than 1 mean it is expired
    if (expiresIn > 0) await redisClient.setEx(`jwt-refresh-${refreshToken}`, expiresIn, '');

    // set access token to blacklist 
    expirationTime = moment.unix(payloadAccessToken.exp);
    expiresIn = expirationTime.diff(moment(), 'seconds');
    // lower than 1 mean it is expired
    if (expiresIn > 0) await redisClient.setEx(`jwt-access-${accessToken}`, expiresIn, '')
    
    // issue new tokens
    const [newAccessToken, newRefreshToken] = await Promise.all([
      Auth.signJWT({ username: payloadAccessToken.username, userId: payloadAccessToken.userId }),
      Auth.signRefreshToken()
    ])

    res.status(200).json({
      data: {
        auth: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    })
  } catch (error) {
    next(error);
  }
})

module.exports = router;
const router = require('express').Router();
const { Validator, Auth, Mail, Logger, HTML } = require('./../libs');
const { API, AppConfig } = require('./../const');
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

    const accessToken = await Auth.signJWT({ username: user.username });
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
      if (error) return Logger.error(`failed to render html template ${templatePath}`, error);
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

module.exports = router;
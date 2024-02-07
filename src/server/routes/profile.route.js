const router = require('express').Router();
const { API } = require('../const');
const { UserService } = require('../services');
const { checkAuth } = require('../middleware');

router.get('/profile', checkAuth, async (req, res, next) => {
  try {
    const user = await UserService.getUserById(res.locals.userId);

    if (!user) return res.status(400).json({
      code: API.ERROR_RESOURCE_NOTFOUND
    })

    res.status(200).json({
      data: {
        user
      }
    })
  } catch (error) {
    next(error);
  }
})

router.post('/profile/avatar', checkAuth, async (req, res, next) => {
  try {
    
  } catch (error) {
    next(error);
  }
})

module.exports = router;
const router = require('express').Router();
const { API } = require('../const');
const { FileUtil, Validator, Logger } = require('../libs');

router.post('/upload/avatar', async (req, res, next) => {
  try {
    const avatar = Array.isArray(req.files.avatar) ? req.files.avatar[0] : (req.files.avatar || {});

    const validationSchema = {
      avatar: {
        size: FileUtil.byteToMb(avatar.size),
        mimetype: (avatar.mimetype || '').toLowerCase()
      }
    }

    if (!Validator.validateUserAvatar(validationSchema)) return res.status(400).json({
      code: API.ERROR_VALIDATION,
      data: {
        errors: Validator.validateUserAvatar.errors
      }
    })

    const fileData = await FileUtil
      .renameTmpFile(avatar)
      .catch(error => {
        Logger.error('failed to rename file', error);
        throw error;
      });

    res.status(200).json({
      data: {
        file: fileData
      }
    })
  } catch (error) {
    next(error);
  }
})

module.exports = router;
const router = require('express').Router();
const { API, AppConfig } = require('../const');
const { UserService } = require('../services');
const { checkAuth } = require('../middleware');
const { Validator, S3, Logger } = require('../libs');
const fs = require('fs');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

router.get('/profile', checkAuth, async (req, res, next) => {
  try {
    const user = await UserService.getUserById(res.locals.userId);

    if (!user) return res.status(400).json({
      code: API.ERROR_RESOURCE_NOTFOUND
    })

    if (user.avatar) {
      user.avatar.fileUrl = S3.createAvatarUrl(user._id, user.avatar.fileUrl);
    } else {
      user.avatar = {};
      user.avatar.fileUrl = S3.createRandomAvatarUrl(user.username.toLowerCase());
    }

    res.status(200).json({
      data: {
        user
      }
    })
  } catch (error) {
    next(error);
  }
})

router.put('/profile/avatar', checkAuth, async (req, res, next) => {
  try {
    if (!Validator.validateUserAvatar(req.body)) return res.status(400).json({
      code: API.ERROR_VALIDATION,
      data: {
        errors: Validator.validateUserAvatar.errors
      }
    })

    // remove previous avatar from s3
    const user = await UserService.getUserById(res.locals.userId);

    if (user.avatar) {
      const deleteParams = new DeleteObjectCommand({
        Bucket: AppConfig.S3_BUCKET,
        Key: `user/avatar/${user._id}/${user.avatar.fileUrl}`
      })
  
      await S3
        .client
        .send(deleteParams)
        .catch(error => {
          Logger.error('failed to delete object s3', error);
          throw error;
        });
    }

    // upload new avatar object to s3
    const { originalFileName, randomName, size, mimetype } = req.body.avatar;

    const uploadParams = new PutObjectCommand({
      Bucket: AppConfig.S3_BUCKET,
      Key: `user/avatar/${user._id}/${randomName}`,
      Body: fs.createReadStream(`tmp/${randomName}`),
      ContentType: mimetype
    });

    const data = await S3
      .client
      .send(uploadParams)
      .catch(error => {
        Logger.error('failed to upload file to s3', error);
        throw error;
      });
    
    Logger.info('response from s3', data); 

    // update avatar in db
    await UserService.updateAvatar(user._id, {
      filename: originalFileName,
      fileUrl: randomName,
      mimetype,
      size
    })

    res.status(200).json({
      data: {
        avatarUrl: S3.createAvatarUrl(user._id, randomName)
      }
    });
  } catch (error) {
    next(error);
  }
})

module.exports = router;
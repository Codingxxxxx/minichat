module.exports = {
  type: 'object',
  properties: {
    avatar: {
      type: 'object',
      properties: {
        size: {
          type: 'number',
          maximum: 2 // 3mb
        },
        mimetype: {
          type: 'string',
          enum: [
            'image/png',
            'image/jpg',
            'image/jpeg'
          ]
        }
      },
      required: [
        'size',
        'mimetype'
      ]
    }
  },
  required: [
    'avatar'
  ]
}
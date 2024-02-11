module.exports = {
  type: 'object',
  properties: {
    avatar: {
      type: 'object',
      properties: {
        originalFileName: {
          type: 'string'
        },
        randomName: {
          type: 'string'
        },
        size: {
          type: 'number'
        },
        mimetype: {
          type: 'string'
        }
      },
      required: ['originalFileName', 'randomName', 'size', 'mimetype']
    }
  },
  required: ['avatar']
}
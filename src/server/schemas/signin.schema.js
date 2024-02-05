module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  },
  required: [
    'username',
    'password'
  ]
}
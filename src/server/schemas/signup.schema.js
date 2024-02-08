module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      maxLength: 15
    },
    password: {
      type: 'string',
      minLength: 6
    },
    email: {
      type: 'string',
      format: 'email'
    }
  }
}
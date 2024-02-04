module.exports = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      maxLength: 15
    },
    password: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email'
    }
  }
}
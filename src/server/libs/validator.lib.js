const Ajv = require('ajv').default;
const ajv = new Ajv({
  allErrors: true
})
require('ajv-formats').default(ajv);

const {
  SignupSchema
} = require('../schemas');

module.exports = {
  validateSignUp: ajv.compile(SignupSchema)
}
const router = require('express').Router();
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const $RefParser = require('json-schema-ref-parser');

const swaggerPath = '../../../swagger.yaml';
const swaggerDocument = YAML.load(path.resolve(__dirname, swaggerPath));

$RefParser.dereference(swaggerDocument)
    .then(swaggerDocumentResolved => {
        router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumentResolved, {
            explorer: true
        }))
    })

module.exports = router;
const router = require('express').Router();
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const $RefParser = require('json-schema-ref-parser');

const swaggerPath = 'swagger.yaml'
const apiPath = 'swagger/api.yaml';
const { paths } =YAML.load(apiPath);

Promise.all(
    paths.map(path => $RefParser.dereference(path))
)
.then(docs => {
  $RefParser
    .dereference(swaggerPath)
    .then(swaggerConfig => {
        // join api paths
        const allApiPaths = docs.reduce((acu, val) => {
            if (!acu) acu = {};
            acu = { ...acu, ...val };
            return acu;
        })

        swaggerConfig.paths = allApiPaths;

        router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig, {
            explorer: true
        }));
    })
})

module.exports = router;
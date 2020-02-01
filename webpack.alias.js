const path = require('path');

module.exports = {
    'node_modules': path.join(__dirname, 'node_modules'),
    'src': path.join(__dirname, 'src'),
    'actions': path.join(__dirname, 'src/actions'),
    'components': path.join(__dirname, 'src/components'),
    'reducers': path.join(__dirname, 'src/reducers'),
    'scenarios': path.join(__dirname, 'src/scenarios'),
    'assets': path.join(__dirname, 'assets'),
    'templates': path.join(__dirname, 'src/scenarios/templates'),
    'libs': path.join(__dirname, 'src/libs'),
    'worker': path.join(__dirname, 'src/worker'),
};
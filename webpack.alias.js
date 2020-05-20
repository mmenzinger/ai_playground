const path = require('path');

module.exports = {
    '@src': path.join(__dirname, 'src'),
    '@store': path.join(__dirname, 'src/store'),
    '@localdb': path.join(__dirname, 'src/localdb'),
    '@util': path.join(__dirname, 'src/util'),
    '@sandbox': path.join(__dirname, 'src/sandbox'),
    '@shared-styles': path.join(__dirname, 'src/component/shared-styles.css'),
    '@component': path.join(__dirname, 'src/component'),
    '@worker': path.join(__dirname, 'src/worker'),
    '@modal': path.join(__dirname, 'src/component/modal'),
    '@element': path.join(__dirname, 'src/component/element'),
    '@page': path.join(__dirname, 'src/component/page'),
    '@scenario': path.join(__dirname, 'src/scenario'),

    'node_modules': path.join(__dirname, 'node_modules'),
    'mobx': path.join(__dirname + '/node_modules/mobx/lib/mobx.es6.js'),
};
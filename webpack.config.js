var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    externals: {
        serialport: 'serialport',
        'jazz-midi': 'jazz-midi',
    },
    node: { fs: 'empty' } //cargo cult
};

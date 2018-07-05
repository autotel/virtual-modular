var path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    externals: {
        // serialport: 'serialport',
        // 'jazz-midi': 'jazz-midi',
    },
    output: {
        libraryTarget: 'this',
        library: 'environment',
    },
    node: { fs: 'empty' } //cargo cult
};

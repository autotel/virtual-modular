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
    target:'node',
    node: { fs: 'empty' } //I don't know how, it fixes a problem
};

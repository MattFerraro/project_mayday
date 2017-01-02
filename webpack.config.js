module.exports = {
    entry: ["./src/mayday.es6"],
    output: {
        path: "build",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test:   /\.es6/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.es6']
    },
    externals: {
        'winston': 'require("winston")'
    }
};

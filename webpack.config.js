module.exports = [{
        entry: ["./src/mayday.es6"],
        output: {
            path: "build",
            filename: "bundle.js"
        },
        devtool: '#inline-source-map',
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
    },
    {
        entry: ["./src/visualizer.es6"],
        output: {
            path: "build",
            filename: "visualizer.js"
        },
        devtool: '#inline-source-map',
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
        }
    },
    {
        entry: ["./src/interactive.es6"],
        output: {
            path: "build",
            filename: "interactive.js"
        },
        devtool: '#inline-source-map',
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
        }
    }
];

const webpack = require("webpack");
const option = require("../webpack/webpack.config");
const compiler = webpack(option);
compiler.run();
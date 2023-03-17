/* eslint-disable no-undef */
const path = require("path");
const SFTPPlugin = require("./plugin/sftpPlugin");
module.exports = {
	mode: "development",
	entry: path.resolve(__dirname, "../test", "index.js"),
	output: {
		path: path.resolve(__dirname, "../dist/"),
		filename: "dir/bundle.js"
	},
	plugins: [
		new SFTPPlugin({
			config: {
				host: "***",
				user: "***",
				password: "***",
			},
			to:"***"
		})
	]
};
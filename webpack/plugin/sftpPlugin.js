const { connectConfig } = require("./ssh/sshconfig");
const {UploadDir} = require("./ssh/ssh");
class SFTPPlugin {
	apply(compiler) {
		compiler.hooks.afterEmit.tapAsync("sftp", (compilation,next) => {
			try {
				const serverPath = "********"
				UploadDir(connectConfig,compiler.options.output.path,serverPath,function(err){
					if(err) throw err;
					next();
				});
			} catch (error) {
				console.log(error);
			}
		});
	}
}

module.exports = SFTPPlugin;
const {UploadDir} = require("./ssh/ssh");
class SFTPPlugin {

	constructor(initialData) {
		this.config = initialData.config;
        this.to = initialData.to;
	}

	apply(compiler) {
		compiler.hooks.afterEmit.tapAsync("sftp", (compilation,next) => {
			try {
				UploadDir(this.config,compiler.options.output.path,this.to,function(err){
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
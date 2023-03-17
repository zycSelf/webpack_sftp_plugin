
const {Client} = require("ssh2");
const fs = require("fs");
const path = require("path");
const events = require("events");

let  emitter = new events.EventEmitter();
function funcEmitter(type,todo,callback){
	emitter.emit(type,todo,callback);
}
emitter.on("next",function(todo,callback) {
	if(todo.length > 0) {
		let fn = todo.shift();
		fn(function(err,result) {
			if(err) {
				callback(err);
				throw err;
			}else {
				if(result) console.log(result);
				funcEmitter("next",todo,callback)
			}
		});
	}else {
		callback(null);
	}
});

function connect(config,callback) {
	let con = new Client();
	con.on("ready",function(){
		console.log("connectSuccess");
		callback(con);
	}).on("error",function(err) {
		throw err;
	}).on("end",function() {
		//
	}).on("close",function() {
		//
	}).connect(config)
}

function DoShell(config,command,callback) {
	connect(config,function(con){
		con.shell(function(err,stream){
			if(err){
				console.log("shell error" , err);
			}else {
				stream.on("close",function() {
					con.end();
					callback(err);
				}).on("data",function(data) {
					console.log(`${data}`)
				}).end(command)
			}
		});
	});
}

function UploadFile(config,packingPath,serverPath,callback) {
	connect(config,(con) => {
		con.sftp(function(err,sftp){
			if(err) {
				con.end();
				throw err
			}
			sftp.fastPut(packingPath, serverPath, (err) => {
				con.end();
				if(err) {
					throw err
				}else {
					console.log("uploadSuccess")
					callback(null);
				}
			});
		});
	});
}

function generateList(packingPath,dirList,fileList) {
	const content = fs.readdirSync(packingPath);
	for(let i =0;i<content.length;i++) {
		let fullPath = path.join(packingPath,content[i]);
		if(fs.statSync(fullPath).isDirectory()) {
			dirList.push(fullPath);
			generateList(fullPath,dirList,fileList);
		}else {
			fileList.push(fullPath)
		}
	}
}
function UploadDir(config,packingPath,serverPath,callback) {
	const dirList = []
	const fileList = []
	generateList(packingPath,dirList,fileList);
	dirList.forEach(function(dir,index) {
		dirList.splice(index,1,function(next) {
			let target = path.join(serverPath,dir.slice(packingPath.length+1));
			let command = `mkdir -p ${target}\nexit\n`;
			DoShell(config,command,next);
		})
	});
	fileList.forEach(function(file,index){
		fileList.splice(index,1,function(next) {
			let target = path.join(serverPath,file.slice(packingPath.length+1));
			console.log("upload" + target);
			UploadFile(config,file,target,next);
		})
	});
	funcEmitter("next",dirList,function(err){
		if(err) {
			throw err;
		}else {
			funcEmitter("next",fileList,callback)
		}
	})
}


module.exports.UploadDir = UploadDir;
module.exports.UploadFile = UploadFile;
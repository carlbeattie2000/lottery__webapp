const fs = require("fs");
const { dirname } = require("path");

function writeLatestLogFile(type, msg) {
	if (!type || !msg) return false;

	const path = dirname(require.main.filename) + "/logs/";
	const date = new Date();

	const loggingTypes = {
		"error": {
			filePattern: `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_error.log`,
			path: "errors/",
		},
		"warning": {
			filePattern: `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_warning.log`,
			path: "warnings/"
		},
		"info": {
			filePattern: `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_info.log`,
			path: "info/"
		}
	}

	const selectedLoggingType = loggingTypes[type];

	if (!selectedLoggingType) return false;

	if (!fs.existsSync(path+selectedLoggingType.path)) {
		fs.mkdirSync(path+selectedLoggingType.path);
	}

	const fullFilePath = path + selectedLoggingType.path + selectedLoggingType.filePattern;

	const timeNow = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

	if (!fs.existsSync(fullFilePath)) {
		fs.writeFileSync(fullFilePath, `[${timeNow}] ${msg} \n`)
		return
	}

	fs.appendFileSync(fullFilePath, `[${timeNow}] ${msg} \n`);
}

function log({type, msg, consoleLog=false, email=false}) {
	if (!type) return;

	if (consoleLog) {
		console.log(`[${type.toUpperCase()}] ${msg}`);
	}

	if (email) {

	}

	writeLatestLogFile(type, msg);
}

module.exports = log;
const fs = require("fs");
const { dirname } = require("path");

const topPath = dirname(require.main.filename) + "/";

const folderStructures = [
	{
		name: "data",
		subFolder: {
			name: "images",
			subFolder: {
				name: "verifaction"
			}
		}
	}
]

function createFolders(basePath, struct) {
	if (!fs.existsSync(basePath+struct.name)) {
		fs.mkdirSync(basePath+struct.name)
	}

	if (!struct.hasOwnProperty("subFolder")) {
		return
	}

	return createFolders(basePath+struct.name+"/", struct.subFolder);
}

for (let struct of folderStructures) {
	createFolders(topPath, struct);
}
/* eslint-disable */
const os = require('os');
if (os.platform() === "linux") {
	module.exports = {
		development: {
			db: "localhost:27017/haka?authSource=admin",
			dbUser: 'villager',
			dbPwd: '4given4get'
		},
		production: {
			db: "localhost:27017/haka?authSource=admin",
			dbUser: 'villager',
			dbPwd: '4given4get'
		}
	};
} else {
	module.exports = {
		development: {
			db: "localhost:27017/Pages?authSource=admin",
			dbUser: 'villager',
			dbPwd: '4given4get'
		},
		production: {
			db: "localhost:27017/Pages?authSource=admin",
			dbUser: 'villager',
			dbPwd: '4given4get'
		}
	};
}
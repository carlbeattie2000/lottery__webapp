const { Schema, model } = require("mongoose");
const crypto = require("crypto");

const userSchema = new Schema({
	first_name: {
		type: String,
		required: true
	},
	middle_names: {
		type: String,
		required: false,
		default: ""
	},
	last_name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	password_salt: {
		type: String,
		default: ""
	},
	dob: {
		type: Date,
		required: true
	},
	balance: {
		type: Number,
		default: 0
	},
	spend_limit: {
		type: Number,
		default: 500
	},
	games: {
		type: Array,
		default: []
	},
	transactions: {
		type: Array,
		default: [
			{
				start_date: Date.now(),
				end_date: Date.now() + (process.env.DAY_IN_MILLISECONDS * 30),
				monthly_spent: 0,
				monthly_winnings: 0,
				monthly_losses: 0,
				transaction_history: []
			}
		]
	},
	winnings: {
		type: Number,
		default: 0
	},
	confirmed: {
		type: Boolean,
		default: false
	},
	blacked_listed: {
		type: Boolean,
		default: false
	}
}, { collection: "users" })

userSchema.pre("save", function(next) {
	if (!this.isModified("password") && !this.isNew) {
		return next()
	}

	this.password_salt = crypto.randomBytes(16).toString("hex");

	this.password = crypto.pbkdf2Sync(this.password, this.password_salt, 1000, 512, "sha256").toString("hex");

	next();
})

userSchema.method("comparePassword", function(password) {
	const isPasswordAMatch = this.password === crypto.pbkdf2Sync(password, this.password_salt, 1000, 512, "sha256").toString("hex");

	return isPasswordAMatch
})

const usersModel = model("users", userSchema);

module.exports = usersModel;
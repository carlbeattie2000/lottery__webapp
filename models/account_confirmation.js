const { Schema, model } = require("mongoose");
const crypto = require("crypto");

const accountConfirmationSchema = new Schema({
	reference: {
		type: String,
		default: crypto.randomBytes(14).toString("hex")
	},
	account_id: {
		type: String,
		required: true,
		unique: true
	},
	image_urls: {
		type: Array,
		required: true
	},
	document_type: {
		type: String,
		required: true
	},
	date_requested: {
		type: Date,
		default: Date.now()
	}
}, { collection: "accountConfirmations" })

const accountConfirmationModel = model("accountConfirmations", accountConfirmationSchema);

module.exports = accountConfirmationModel;


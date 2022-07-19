const { Schema, model } = require("mongoose");

const lotteryEntriesSchema = new Schema({
	lottery_id: {
		type: String,
		required: true
	},
	start_date: {
		type: Date,
		required: true
	},
	end_date: {
		type: Date,
		required: true
	},
	entries: {
		type: Array,
		default: []
	},
	drawn: {
		type: Boolean,
		default: false
	},
	jackpot: {
		type: Number,
		required: true
	}
}, { collection: "lotteryEntries" })

const lotteryEntriesModel = model("lotteryEntries", lotteryEntriesSchema);

module.exports = lotteryEntriesModel;

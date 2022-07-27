const { isValidObjectId } = require("mongoose");
const usersModel = require("../models/user.js");
const accountVerficationModel = require("../models/account_confirmation.js");
const { URL } = require("url");
const log = require("../utils/logger");

/* 

	Transaction amount should allways be postive

*/
async function newTransactionHelper({
	userDetails,
	transaction_method,
	transaction_description,
	transaction_amount,
}) {
	const methods = {
		"deposit": {
			"monthly_spent": transaction_amount,
			"monthly_losses": -transaction_amount,
			"balance_change": transaction_amount
		},
		"withdrawal": {
			"monthly_spent": 0,
			"monthly_lossess": transaction_amount,
			"balance_change": -transaction_amount 
		},
		"payment": {
			"monthly_spent": 0,
			"monthly_lossess": 0,
			"balance_change": -transaction_amount
		}
	}

	const methodUsing = methods[transaction_method];

	if (!methodUsing) {
		return {
			error: true,
			code: 500,
			msg: "Server unable to process request, please try again later"
		}
	}

	if (Date.now() > userDetails.transactions[0].end_date) {
		await usersModel.findByIdAndUpdate(userDetails._id, {
			$push: {
				"transactions": {
					start_date: Date.now(),
					end_date: Date.now() + (process.env.DAY_IN_MILLISECONDS * 30),
					monthly_spent: 0,
					monthly_winnings: 0,
					monthly_losses: 0,
					transaction_history: []
				}
			}
		});
	}

	const updatedUser = await usersModel.findByIdAndUpdate(userDetails._id,
		 {
		 	$inc: {
		 		"transactions.0.monthly_spent": methodUsing.monthly_spent || 0,
		 		"transactions.0.monthly_losses": methodUsing.monthly_losses || 0
		 	},
			$push: {
				"transactions.0.transaction_history": {
					type: transaction_method,
					description: transaction_description,
					amount: methodUsing.balance_change,
					balance_before: userDetails.balance,
					balance_after: userDetails.balance + methodUsing.balance_change
				}
			},
			balance: userDetails.balance + methodUsing.balance_change
		}, {new: true});

	return {
		error: false,
		code: 200,
		data: updatedUser
	}
}

async function register({
	first_name, 
	middle_names,
	last_name,
	email,
	password,
	dob }) 
{
	if (!first_name || !last_name || !email || !password || !dob) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	if ((first_name.length || middle_names.length || last_name.length || email.length || password.length) > 150) {
		return {
			error: true,
			code: 401,
			msg: "Exceded max characters in a string"
		}
	}

	if (!dob instanceof Date) {
		return {
			error: true,
			code: 401,
			msg: "Date of birth is not a valid date"
		}
	}

	// age verification

	/* 
		GET current year & GET users birth year

		VAR current year - VAR users birthyear
			IS this larger than age requirement
				IF YES then user has passed the age checks

				IF NO is it equal to the 
	*/

	try {
		const user = new usersModel({
			first_name: first_name,
			middle_names: middle_names,
			last_name: last_name,
			email: email,
			password: password,
			dob: dob
		})

		const userRegistered = await user.save();

		return {
			error: false,
			code: 200,
			data: userRegistered
		}
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "We were unable to process your request at this time, please try again later"
		}
	}
}

async function login({
	email,
	password }) 
{
	if (!email || !password) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	if ((email.length || password.length) > 150) {
		return {
			error: true,
			code: 401,
			msg: "Exceded max characters in a string"
		}
	}

	try {
		const usersAccountFound = await usersModel.findOne({ email });

		if (!usersAccountFound) {
			return {
				error: true,
				code: 404,
				msg: "Invalid login details"
			}
		}

		const isPasswordAMatch = usersAccountFound.comparePassword(password);

		if (!isPasswordAMatch) {
			return {
				error: true,
				code: 404,
				msg: "Invalid login details"
			}
		}

		const usersAccountFoundToObject = usersAccountFound.toObject();

		delete usersAccountFoundToObject.password;
		delete usersAccountFoundToObject.password_salt;

		return {
			error: false,
			code: 200,
			data: usersAccountFoundToObject
		}
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "We were unable to process your request at this time, please try again later"
		}
	}
}

async function setCap({
	id,
	newCap }) 
{
	if (!id || !newCap) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	if (!isValidObjectId(id) || id.length > 150) {
		return {
			error: true,
			code: 401,
			msg: "Invalid object or invalid account details"
		}
	}

	if (newCap < 0 || newCap > process.env.MAX_LOTTERY_CAP) {
		return {
			error: true,
			code: 401,
			msg: "Max cap limit can't exceded " + process.env.MAX_LOTTERY_CAP
		}
	}

	try {
		const userUpdated = await usersModel.findByIdAndUpdate(id, { spend_limit: newCap }, { new: true })

		return {
			error: false,
			code: 200,
			data: userUpdated
		}
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "We were unable to process your request at this time, please try again later"
		}
	}
}

async function uploadAccountConfirmationDocuments({ id, document_type, image_urls }) {
	const validDocumentTypes = {
		"licence": {
			images_required: 2
		},
		"passport": {
			images_required: 1
		}
	};

	if (!id || !document_type || !image_urls || typeof image_urls !== "object" || image_urls.length === 0) {
		return {
			error: true,
			code: 401,
			msg: "Missing/Invalid fields"
		}
	}

	if (!validDocumentTypes[document_type] || image_urls.length !== validDocumentTypes[document_type].images_required) {
		return {
			error: true,
			code: 401,
			msg: "Missing/ Invalid fields"
		}
	}

	if (!isValidObjectId(id)) {
		return {
			error: true,
			code: 401,
			msg: "Invalid account id"
		}
	}

	const allowedHosts = [`localhost:${process.env.PORT || 2001}`];

	try {
		for (let url of image_urls) {
			const parsedURL = new URL(url);

			if (!allowedHosts.includes(parsedURL.host) || !parsedURL.pathname.includes("/images/verifaction")) {
				return {
					error: true,
					code: 401,
					msg: "Please upload your images with us, don't provide links"
				}
			}
		}
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "INVALID_URL"
		}
	}

	try {
		const newConfirmation = new accountVerficationModel({
			account_id: id,
			image_urls: image_urls,
			document_type: document_type
		})

		const confirmationSaved = await newConfirmation.save();

		return {
			error: false,
			code: 200,
			data: confirmationSaved
		}

	} catch (err) {
		log({type: "error", msg: error});

		if (err.code === 11000) {
			return {
				error: true,
				code: 401,
				msg: "You have already uploaded your confirmation documents, please wait for your account verifaction to be processed"
			}
		}

		return {
			error: true,
			code: 500,
			msg: "Server was unable to process your request, please try again later"
		}
	}

}

async function deposit({ id, amount }) {
	if (!id || !amount) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	if (!isValidObjectId(id)) {
		return {
			error: true,
			code: 404,
			msg: "Invalid user details"
		}
	}

	try {
		const userDetails = await usersModel.findById(id);

		if (!userDetails) {
			return {
				error: true,
				code: 404,
				msg: "User not found"
			}
		}

		const monthlySpentPlusDeposit = userDetails.transactions[0].monthly_spent + amount;

		if (userDetails.balance + amount > userDetails.spend_limit || monthlySpentPlusDeposit > userDetails.spend_limit) {
			return {
				error: true,
				code: 400,
				msg: "You have exceded your monthly cap"
			}
		}

		const newUserTransaction = await newTransactionHelper({
			userDetails: userDetails,
			transaction_method: "deposit",
			transaction_description: "deposit from bank account",
			transaction_amount: amount
		})

		return {
			error: true,
			code: 200,
			data: newUserTransaction
		}
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "We're currently unable to process your request, please try again later"
		}
	}
}

/* 
	@id - The users account id from mongodb
	@cost - The cost of the game
	@quantity - The amount of lines/games the player is playing

	This method allows us to check and then remove funds from a players account, if the player can afford the game then we take the required amount
	from the account and update the document stored in mongodb.

	First we make sure all the params have been passed in, if not we return a user error.
	Secondly we make sure the player can't play a single line/game that cost more than what we set in the .env
	Then we make sure the id passed is a valid mongodb objectid
	Once we have done the above when attempt to find the users object, if we don't we return a not found error.
	Then we calculate the total costm which is the cost of a single game * the quantity of games/lines being played, if it is
	we again return a user error, informing them that they need to deposit funds
	Finally before removing/confirming the funds have been paid, we check to see if the player has reached their spending cap

*/
async function payForGame({ id, cost, quantity }) {
	if (!id || !cost) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	if (cost > process.env.MAX_GAME_COST) {
		return {
			error: true,
			code: 500,
			msg: "We're currently unable to process your request, please try again later"
		}
	}

	if (!isValidObjectId(id)) {
		return {
			error: true,
			code: 401,
			msg: "Invalid account details"
		}
	}

	try {
		const userDetails = await usersModel.findById(id);

		if (!userDetails) {
			return {
				error: true,
				code: 404,
				msg: "User not found"
			}
		}

		const totalGamesCost = cost * quantity;

		if (userDetails.balance < totalGamesCost || !userDetails.confirmed) {
			return {
				error: true,
				code: 400,
				msg: "Deposit funds into your account"
			}
		}
		
		const addUserTransaction = await newTransactionHelper({
			userDetails: userDetails,
			transaction_method: "payment",
			transaction_description: "game payment",
			transaction_amount: totalGamesCost
		})

		return addUserTransaction
	} catch (err) {
		log({type: "error", msg: err});

		return {
			error: true,
			code: 500,
			msg: "We're currently unable to process your request, please try again later"
		}
	}
}

module.exports = {
	register,
	login,
	setCap,
	uploadAccountConfirmationDocuments,
	deposit,
	payForGame
}
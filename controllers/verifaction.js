const { unlink } = require("fs");
const { dirname } = require("path");

const verifactionModel = require("../models/account_confirmation");
const userModel = require("../models/user");

const { isValidObjectId } = require("mongoose");
const emailUtil = require("../utils/emails");
const log = require("../utils/logger");

async function findVerifactionRequestById(id) {
	if (!id || !isValidObjectId(id)) return {
		error: true,
		code: 400,
		msg: "INVALID_ID"
	}

	const foundVerifactionRequest = await verifactionModel.findById(id);

	if (!foundVerifactionRequest) {
		return {
			error: true,
			code: 404,
			msg: "DOCUMENT_NOT_FOUND"
		}
	}

	return {
		error: false,
		code: 200,
		data: foundVerifactionRequest
	}
}

async function getVerifactionDocuments(page=0) {
	page -= 1; // Allows users to start at page 1 instead of 0

	const documentsPerPage = 20;

	const documentsFound = await verifactionModel.find().limit(documentsPerPage).skip(documentsPerPage * page);

	if (documentsFound.length === 0) {
		return {
			error: true,
			code: 404,
			msg: "DOCUMENTS_NOT_FOUND"
		}
	}

	return {
		error: false,
		code: 200,
		data: documentsFound
	}
}

async function confirmVerifactionRequest(requestId) {
	if (!requestId) {
		return {
			error: true,
			code: 400,
			msg: "MISSING_INPUT"
		}
	}

	if (!isValidObjectId(requestId)) {
		return {
			error: true,
			code: 400,
			msg: "INVALID_DOCUMENT_ID"
		}
	}

	const verifactionDocument = await verifactionModel.findById(requestId);

	if (!verifactionDocument) {
		return {
			error: true,
			code: 404,
			msg: "REQUEST_DOCUMENT_NOT_FOUND"
		}
	}

	const accountDocument = await userModel.findById(verifactionDocument.account_id);

	if (!accountDocument) {
		return {
			error: true,
			code: 404,
			msg: "ACCOUNT_DOCUMENT_NOT_FOUND"
		}
	}

	// Sign off at bottom of email should be the admin currently logged in accepting the request
	emailUtil.sendEmail(accountDocument.email, 
		`[Lucky Lotto] ${accountDocument.first_name} your account has been verified!`,
		`Dear ${accountDocument.first_name} ${accountDocument.last_name},
		We've reviewed the account document's you sent us, we're happy to confirm we can verify
		they're correct.

		You can now visit our website and enter this weeks lucky lotto draw.

		Good Luck,

		Carl
		Lucky Lotto Support Team

		<h1>Be Aware. Be Gamble Aware.</h1>`);

	// Delete stored images
	const imagesPath = dirname(require.main.filename) + "/data/images/verifaction/";

	for (let verifactionImage of verifactionDocument.image_urls) {
		const fileName = verifactionImage.split("http://localhost:2001/data/images/verifaction/")[1];

		try {
			await unlink(imagesPath+fileName, () => {});
		} catch (err) {
			log({type: "error", msg: err});
		}

	}

	await verifactionDocument.remove();

	accountDocument.confirmed = true;

	await accountDocument.save();

	return {
		error: false,
		code: 204
	}
}

async function declineVerifactionRequest(requestId) {
	if (!requestId) {
		return {
			error: true,
			code: 400,
			msg: "MISSING_INPUT"
		}
	}

	if (!isValidObjectId(requestId)) {
		return {
			error: true,
			code: 400,
			msg: "INVALID_DOCUMENT_ID"
		}
	}

	const verifactionDocument = await verifactionModel.findById(requestId);

	if (!verifactionDocument) {
		return {
			error: true,
			code: 404,
			msg: "REQUEST_DOCUMENT_NOT_FOUND"
		}
	}

	const accountDocument = await userModel.findById(verifactionDocument.account_id);

	if (!accountDocument) {
		return {
			error: true,
			code: 404,
			msg: "ACCOUNT_DOCUMENT_NOT_FOUND"
		}
	}

	// Sign off at bottom of email should be the admin currently logged in accepting the request
	emailUtil.sendEmail(accountDocument.email, 
		`[Lucky Lotto] ${accountDocument.first_name} we're unable to verify your account!`,
		`Dear ${accountDocument.first_name} ${accountDocument.last_name},
		We've reviewed the account document's you sent us, we're afraid we've been unable to verify the 
		document's and have concluded them to be illegitimate.

		Your account has now been deactivated, but this doesn't mean you're permanently blocked out from using our services. 
		We now require you to send us some additional information to our support email with the reference #${accountDocument._id}.

		What we need from you
			- Photo/scan of a form of photo ID front and back
			- Photo of yourself holding the same ID (only the front)
			- Proof of address (energy bill, etc.)

		Please allow us 14 working days to look at any new information you send us. We will then decide the outcome 
		based on the evidence reviewed.

		Thank You,

		Carl
		Lucky Lotto Support Team

		<h1>Be Aware. Be Gamble Aware.</h1>`);

	// Delete stored images
	const imagesPath = dirname(require.main.filename) + "/data/images/verifaction/";

	for (let verifactionImage of verifactionDocument.image_urls) {
		const fileName = verifactionImage.split("http://localhost:2001/data/images/verifaction/")[1];

		try {
			await unlink(imagesPath+fileName, () => {});
		} catch (err) {
			log({type: "error", msg: err});
		}

	}

	await verifactionDocument.remove();

	accountDocument.blacked_listed = true;

	await accountDocument.save();

	return {
		error: false,
		code: 204
	}
}

async function userHasRequestedVerifaction(user_id="") {
	const userRequestFound = await verifactionModel.findOne({ account_id: user_id }).select("_id");

	if (!userRequestFound) return false

	return true
}

module.exports = {
	findVerifactionRequestById,
	getVerifactionDocuments,
	confirmVerifactionRequest,
	declineVerifactionRequest,
	userHasRequestedVerifaction
}
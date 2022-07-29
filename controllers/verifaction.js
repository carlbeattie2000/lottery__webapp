const verifactionModel = require("../models/account_confirmation");
const userModel = require("../models/user");

const { isValidObjectId } = require("mongoose");
const emailUtil = require("../utils/emails");

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
	email.sendEmail(accountDocument.email, 
		`[Lucky Lotto] ${accountDocument.first_name} your account has been verified!`,
		`Dear ${accountDocument.first_name} ${accountDocument.last_name},
		We've reviewed the account document's you sent us, we're happy to confirm we can verify
		they're correct.

		You can now visit our website and enter this weeks lucky lotto draw.

		Good Luck,

		Carl
		Lucky Lotto Support Team

		<h1>Be Aware. Be Gamble Aware.</h1>`)
	// Delete stored images

	await verifactionDocument.remove();

	accountDocument.confirmed = true;

	await accountDocument.save();

	return {
		error: false,
		code: 204
	}
}

module.exports = {
	findVerifactionRequestById,
	getVerifactionDocuments,
	confirmVerifactionRequest
}
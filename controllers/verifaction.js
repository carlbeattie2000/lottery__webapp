const verifactionModel = require("../models/account_confirmation");
const userModel = require("../models/user");
const { isValidObjectId } = require("mongoose");

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

	// Send email/notifaction to the user informing them there account has been accepted
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
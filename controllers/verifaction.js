const verifactionModel = require("../models/account_confirmation");
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

module.exports = {
	findVerifactionRequestById,
	getVerifactionDocuments
}
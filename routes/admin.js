const express = require("express");
const verifactionController = require("../controllers/verifaction");
const { resolve } = require("path");
const { existsSync } = require("fs");

const router = express.Router();

// router.get("/*", (req, res, next) => {
// 	if (!req.session.admin) {
// 		return res.sendStatus(401);
// 	}

// 	next()
// })

router.get("/verifaction_requests/:page?", async (req, res) => {
	const page = req.params.page || 1;

	const verifactionDocumentsFound = await verifactionController.getVerifactionDocuments(page);

	res.status(verifactionDocumentsFound.code).json(verifactionDocumentsFound);
})

router.get("/verifaction_request/:id", async (req, res) => {
	const id = req.params.id;

	if (!id) {
		return res.sendStatus(400);
	}

	const verifactionDocument = await verifactionController.findVerifactionRequestById(id);

	return res.status(verifactionDocument.code).json(verifactionDocument);
})

router.get("/verifaction_images/:image_name", async (req, res) => {
	const imageName = req.params.image_name;

	if (!imageName) {
		return res.sendStatus(400);
	}

	const resolvedPath = resolve("data/images/verifaction/" + imageName);

	if (!existsSync(resolvedPath)) {
		return res.sendStatus(404);
	}

	res.sendFile(resolvedPath);
})

router.put("/confirm_account/:request_id", async (req, res) => {
	const requestId = req.params.request_id;

	if (!requestId) {
		return res.sendStatus(400);
	}

	const removedDocument = await verifactionController.confirmVerifactionRequest(requestId);

	res.status(removedDocument.code).json(removedDocument);
})

router.put("/decline_account/:request_id", async (req, res) => {
	const requestId = req.params.request_id;

	if (!requestId) return res.sendStatus(400);

	const removedDocument = await verifactionController.declineVerifactionRequest(requestId);

	res.status(removedDocument.code).json(removedDocument);
})

module.exports = router;
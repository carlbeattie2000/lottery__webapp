const usersController = require("../controllers/users.js");
const authMiddleware = require("../utils/auth_middleware.js");

const express = require("express");

const router = express.Router();

router.post("/login", async (req, res) => {
	if (!req.body) {
		return res.status(401).json({
			error: true,
			code: 401,
			msg: "Missing fields"
		})
	}

	const {
		email = null,
		password = null,
 	} = req.body;

 	const isUserValid = await usersController.login({
 		email: email,
 		password: password
 	})

 	if (isUserValid.error) {
 		return res.status(isUserValid.code).json(isUserValid)
 	}

 	req.session.user = isUserValid.data;
 	req.session.loggedin = true;

 	return res.status(isUserValid.code).json(isUserValid);
})

router.post("/register", async (req, res) => {
	if (!req.body) {
		return res.status(401).json({
			error: true,
			code: 401,
			msg: "Missing fields"
		})
	}

	const {
		first_name = null,
		middle_names = null,
		last_name = null,
		email = null,
		password = null,
		dob = null
	} = req.body;

	const userRegistered = await usersController.register({
		first_name: first_name,
		middle_names: middle_names,
		last_name: last_name,
		email: email,
		password: password,
		dob: dob
	})

	return res.status(userRegistered.code).json(userRegistered);
})

router.post("/updateCap", async (req, res) => {
	if (!req.body) {
		return res.status(401).json({
			error: true,
			code: 401,
			msg: "Missing fields"
		})
	}

	const {
		id = null,
		newCap = null
	} = req.body;

	const userCapUpdated = await usersController.setCap({
		id: id,
		newCap: newCap
	})

	return res.status(userCapUpdated.code).json(userCapUpdated);
})

// Testing routes / routes in development

router.put("/pay_for_game", async (req, res) => {
	const id = req.query.id;

	const paymentAccepted = await usersController.payForGame({id: id, cost: 50, quantity: 4});

	return res.status(paymentAccepted.code).json(paymentAccepted);
})

router.put("/deposit", async (req, res) => {
	const id = req.query.id;

	const paymentAccepted = await usersController.deposit({ id: id, amount: 50 });

	return res.status(paymentAccepted.code).json(paymentAccepted);
})

router.post("/verify", async (req, res) => {
	if (!req.body) {
		return {
			error: true,
			code: 401,
			msg: "Missing fields"
		}
	}

	const {
		id = null,
		document_type = null,
		image_urls = null
	} = req.body;

	const verifactionUploaded = await usersController.uploadAccountConfirmationDocuments({
		id,
		document_type,
		image_urls
	})

	return res.status(verifactionUploaded.code).json(verifactionUploaded);
})

module.exports = router;
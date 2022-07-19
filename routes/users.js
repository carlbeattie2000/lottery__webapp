const usersController = require("../controllers/users.js");
const authMiddleware = require("../utils/auth_middleware.js");
const formidable = require("formidable");
const fs = require("fs");

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

router.post("/create_verfication_request", async (req, res) => {
	const validImageMimeTypes = ["image/jpeg", "image/png"];
	const maximumImageSizeInBytes = 5 * 1e+6;

	const uploadDirectory = __dirname + "../../data/images/verifaction/";

	const form = formidable({
		multiples: true,
		uploadDir: uploadDirectory
	})

	try {
		const formParsed = await new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) {
					if (files) {
						for (let key of Object.keys(files)) {
							fs.rm(files[key].filepath);
						}
					}

					reject({
						error: true,
						code: 500,
						msg: "We are unable to process your request, please try again later"
					});
					return
				}

				const imageUrls = [];
				const filePaths = [];

				for (let key of Object.keys(files)) {
					const file = files[key];

					if (file.size > maximumImageSizeInBytes || !validImageMimeTypes.includes(file.mimetype) && file.size !== 0) {
						reject({
							error: true,
							code: 400,
							msg: "Image size exceeded maximum / Image not valid format"
						})
					}

					const newFileName = file.newFilename + "." + file.originalFilename.split(".")[1];

					fs.rename(uploadDirectory+file.newFilename, uploadDirectory+newFileName, () => {});

					filePaths.push(uploadDirectory+newFileName);

					if (file.size == 0)	continue

					imageUrls.push("http://localhost:2001/data/images/verifaction/"+newFileName);
				}

				resolve({
					fields,
					imageUrls,
					filePaths
				})
			})
		})

		const verifactionUploaded = await usersController.uploadAccountConfirmationDocuments({
			id: formParsed.fields.user_id,
			document_type: formParsed.fields.document_type,
			image_urls: formParsed.imageUrls
		})
		
		if (verifactionUploaded.error) {
			for (let path of formParsed.filePaths) {
				fs.rm(path);
			}
		}

		return res.status(verifactionUploaded.code).json(verifactionUploaded);
	} catch (err) {
		return res.status(err.code).json(err);
	}
})

router.get("/verify_form", (req, res) => {
	res.send(
	`
		<form action="/api/create_verfication_request" method="POST" enctype="multipart/form-data">
			<input type="file" name="front">
			<input type="file" name="back">
			<input type="text" name="user_id">
			<input type="text" name="document_type">
			<button type="submit">UPLOAD</button>
		</form>
	`
	)
})

module.exports = router;
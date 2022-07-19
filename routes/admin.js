const express = require("express");

const router = express.Router();

router.get("/*", (req, res, next) => {
	if (!req.session.admin) {
		return res.sendStatus(401);
	}

	next()
})

router.get("/verifaction_requests", async (req, res) => {

})

router.put("/confirm_account", async (req, res) => {

})

module.exports = router;
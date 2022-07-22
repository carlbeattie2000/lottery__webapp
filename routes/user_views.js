const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
	res.render("index");
})

router.get("/login", (req, res) => {

})

router.get("/home", (req, res) => {

})

router.get("/profile", (req, res) => {

})

router.get("/profile/settings", (req, res) => {

})

router.get("/profile/deposit", (req, res) => {

})

router.get("/profile/withdraw", (req, res) => {

})

router.get("/my_games", (req, res) => {

})

router.get("/browse_games", (req, res) => {

})

router.get("/game/id", (req, res) => {
	
})

router.get("/results", (req, res) => {

})

router.get("/ticket/id", (req, res) => {

})
 
module.exports = router;
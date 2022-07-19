const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

require("dotenv").config();

const PORT = process.env.PORT || 2001;
const app = express();

const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

mongoose.connect(process.env.MONGOOSE_CONNECTION_URI);

// App using setup
app.set("view engine", "ejs");
app.use(session({
	secret: "catpleasechange",
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 60000 * 2
	}
}))
app.use(express.json());
app.use(express.urlencoded({extended: true }));
app.use(express.static(__dirname + "/public"));

app.use("/api", userRouter);
app.use("/admin", adminRouter);

app.get("public/images/verifaction/*", (req, res, next) => {
	if (!req.session.admin) {
		return res.sendStatus(401);
	}

	next();
})

app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`);
})

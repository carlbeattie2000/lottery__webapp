const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const createRequiredFolders = require("./utils/create_needed_folders");
const log = require("./utils/logger");

require("dotenv").config();

const PORT = process.env.PORT || 2001;
const app = express();

const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const userViewsRouter = require("./routes/user_views");

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
app.use("/", userViewsRouter);

app.get("*", (req, res) => {
	log({type: "info", msg: `User tried to use path:[${req.path}]`});
	
	res.render("404", {path: req.path});
})

app.listen(PORT, () => {
	console.log(`Server running on PORT ${PORT}`);
})

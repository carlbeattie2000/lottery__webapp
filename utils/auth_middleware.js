function userAuthed (req, res, next, adminRoute=false) {
	if (adminRoute) {
		if (!req.session.admin) {
			return res.sendStatus(401)
		}
	}

	const user = req.session.user;

	if (user.blacked_listed) {
		return res.sendStatus(401)
	}
}

module.exports = userAuthed;
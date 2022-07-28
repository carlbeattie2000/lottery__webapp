const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_EMAIL,
		pass: process.env.GMAIL_PASS
	}
})

async function sendEmail(to, subject, msg) {
	const mailOptions = {
		from: "support@luckylotto.com",
		to,
		subject,
		text: msg
	}

	const messageSent = await transporter.sendMail(mailOptions);

	return messageSent
}

module.exports = {
	sendEmail
}
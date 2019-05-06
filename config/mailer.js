"use strict";

module.exports = {
	sendMail : function (message) 
	{
		const nodemailer = require('nodemailer');
		
		const transporterPtcl =  nodemailer.createTransport({
		  pool: true,
		  host: process.env.SMTP_HOST,
		  port: process.env.PORT_MAIL,
		  secure: true, 
		  auth: {
		    user: process.env.USER_MAIL,
		    pass: process.env.PASS_MAIL
		  }
		});

		transporterPtcl.sendMail({
		    from: '"' + message.sender.name + '" <' + process.env.USER_MAIL + '>', 
		    to: process.env.DEST_MAIL, 
		    subject: "[PPC CHOICE]: Contato de usuario", 
		    text: '"' + message.content + '"', 
		    html: "<b>" + message.content + "</b>"
		  })
	}	
}


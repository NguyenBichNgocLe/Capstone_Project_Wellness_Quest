"use strict";
require("dotenv").config();

const server = require("express")();

const { cookieSession } = require("./config/session");
const port = process.env.BACKEND_PORT;
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");


const { userRouter } = require("./api/routes/userRoutes");
const { challengeRouter } = require("./api/routes/challengeRoutes");
const { databaseInit } = require("./config/relations");
databaseInit().then(() => {
	//requiring database initialization first before anything else
	const { isUser } = require("./config/auth");

	server.use(cookieSession);
	server.use(morgan("dev"));
	server.use(
		cors({
			credentials: true,
			origin: [process.env.SERVER_IP, "localhost"].filter(host => !!host).map(host => `http://${host}:8081`),
		}),
	);
	// server.use(helmet());
	// server.use(helmet.hidePoweredBy());

	server.get("/", async (req, res) => {
		res.sendStatus(418);
	});
	server.use("/users", userRouter);
	server.use("/challenges", isUser, challengeRouter);
	
	if(process.env.NODE_ENV=="prod") {
		const https = require("https");
		const fs = require("fs");
		const key = process.env.HTTPS_Key;
		const cert = process.env.HTTPS_Cert;
		const ca = process.env.HTTPS_CA;

		//TLS/SSL key and cert
		const options = {
			key: fs.readFileSync(key),
			cert: fs.readFileSync(cert),
			ca: fs.readFileSync(ca)
		}

		//Creates a HTTPS server
		const httpsServer = https.createServer(options, server);
		httpsServer.listen(port, "0.0.0.0", () => {
			console.log(`HTTPS_Server listening on port ${port}`);
		});
	}
	else {
		server.listen(port, "0.0.0.0", () => {
			console.log(`HTTP_Server listening on port ${port}`);
		});
	}

});

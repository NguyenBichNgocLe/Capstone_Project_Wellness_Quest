"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");

const expect = chai.expect;

chai.use(chaiHttp);
const api = "localhost:4848";

describe("User route /users", () => {
	let agent;
	let deleted = false;

	before(async () => {
		agent = chai.request.agent(api);
	});

	const user = {
		email : Date.now() + "@email.com",
		username: Date.now() + "username",
		first_name: Date.now() + "first_name",
		last_name: Date.now() + "last_name",
		password: Date.now() + "password",
	}

	it("POST /register Should register new user", async () => {
		const res = await agent.post("/users/register").send(user);
		expect(res).to.have.status(200);
		expect(res.text).to.equal(`{"response":"User ${user.username} created"}`);
	});

	it("POST /login Should login", async () => {
		const res = await agent.post("/users/login").send(user);
		expect(res).to.have.status(200);
		expect(res.body.text).to.equal("User logged in");
		const cookie = res.header["set-cookie"][0];
		expect(cookie).to.match(/connect\.sid=s%/);
		agent.jar.setCookie(cookie);
	});

	it("POST /logout Should logout", async () => {
		const res = await agent.post("/users/logout");
		expect(res).to.have.status(200);
		expect(res.text).to.equal("User logged out");
	});

	it("DELETE /delete Should delete the newly created account", async () => {
		let res = await agent.post("/users/login").send(user);
		expect(res).to.have.status(200);
		expect(res.body.text).to.equal("User logged in");
		const cookie = res.header["set-cookie"][0];
		expect(cookie).to.match(/connect\.sid=s%/);
		agent.jar.setCookie(cookie);
		res = await agent.delete("/users/delete");
		expect(res).to.have.status(204);
		deleted = true;
	});

	after(async () => {
		if (!deleted) await agent.delete("/users/delete");
		agent.close();
	});
});

"use strict";

function isUser(req, res, next) {
    if (!isLoggedIn(req.session)) res.status(403).send({ error: "User is not logged in"});
    else next();
}

function isLoggedIn(session) {
    const { user_id, username } = session;
    return user_id && username;
}

module.exports = {
    isLoggedIn,
    isUser
};
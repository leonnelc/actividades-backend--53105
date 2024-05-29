const express = require("express");
const router = express.Router();
const session = require("express-session");
const UserManager = require("../controllers/UserManager");
const um = new UserManager();
const validator = require("email-validator");

function getUsername(email){
    let username = email.split("@")[0];
    username = username[0].toUpperCase() + username.substring(1);
    return username;
}
router.post("/login", async (req, res) => {
    let email = req.body.email?.trim().toLowerCase() ?? false;
    let password = req.body.password ?? false;
    if (!password){
        req.session.invalidLogin = {message:"Invalid password"};
        return res.redirect("/login");
    }
    if (!validator.validate(email)){
        req.session.invalidLogin = {message:"Invalid email"}
        return res.redirect("/login");
    }
    const result = await um.login(email, password);
    if (!result.result){
        req.session.invalidLogin = {message:result.message};
        return res.redirect("/login");
    }
    req.session.loggedIn = true;
    req.session.loginSuccess = true;
    req.session.user = result.user;
    req.session.username = getUsername(result.user.email);
    let counter = Number(req.signedCookies.count);
    res.cookie("count", counter+1, {maxAge:86400000, signed:true}) // 86400000 ms = 24 hours
    req.session.save( (err) => {
        if (err){
            return res.render("message", {error:true, message:err.message});
        }
        res.redirect("/login"); 
    } )
})
router.post("/register", async (req, res) => {
    console.log(req.body);
    let email = req.body.email?.trim().toLowerCase() ?? false;
    let age = Number(req.body.age);
    let first_name = req.body.first_name?.trim() ?? false;
    let last_name = req.body.last_name?.trim() ?? false;
    let password = req.body.password ?? false;
    if (age <= 0){
        req.session.invalidRegister = {message:"Invalid age"};
        return res.redirect("/register");
    }
    if (!first_name){
        req.session.invalidRegister = {message:"First name is required"};
    }
    if (!last_name){
        req.session.invalidRegister = {message:"Last name is required"}
    }
    if (!password){
        req.session.invalidRegister = {message:"Password is required"};
        return res.redirect("/register");
    }
    if (!validator.validate(email)){
        req.session.invalidRegister = {message:"Invalid email"}
        return res.redirect("/register");
    }
    const result = await um.addUser({email, password, age, first_name, last_name});
    if (result.error){
        req.session.invalidRegister = {message:result.message};
        return res.redirect("/register");
    }
    req.session.registerSuccess = true;
    res.redirect("/register");
})

module.exports = router;
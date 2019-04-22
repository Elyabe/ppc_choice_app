const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');

router.post( '/db/department/', (req, res, next) => {
	//res.send("department");
});

router.get('/db/department/', ensureAuthenticated, (req, res) => { 
	res.send("department");
});

router.get('/db/department/new/', ensureAuthenticated, (req, res) => { 
	res.send("department new");
});

router.get('/db/department/update/', ensureAuthenticated, (req, res) => { 
	res.send("department update");
});

router.get('/db/department/delete/', ensureAuthenticated, (req, res) => { 
	res.send("department delete");
});

router.get('/db/department/view/', ensureAuthenticated, (req, res) => { 
	res.send("department view");
});







module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');

router.post( '/db/corresponding-matrix/', (req, res, next) => {
	//res.send("department");
});

router.get('/db/corresponding-matrix/', ensureAuthenticated, (req, res) => { 
	res.send("corresponding-matrix");
});

router.get('/db/corresponding-matrix/new/', ensureAuthenticated, (req, res) => { 
	res.send("corresponding-matrix new");
});

router.get('/db/corresponding-matrix/update/', ensureAuthenticated, (req, res) => { 
	res.send("corresponding-matrix update");
});

router.get('/db/corresponding-matrix/delete/', ensureAuthenticated, (req, res) => { 
	res.send("corresponding-matrix delete");
});

router.get('/db/corresponding-matrix/view/', ensureAuthenticated, (req, res) => { 
	res.send("corresponding-matrix view");
});







module.exports = router;
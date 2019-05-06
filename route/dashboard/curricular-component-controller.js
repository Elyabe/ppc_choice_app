const express = require('express');
const router = express.Router();
const db = require('../../config/db-functions');
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

const { ensureAuthenticated } = require('../../config/auth');
const passport = require('passport');

router.post( '/db/curricular-component/', (req, res, next) => {
	res.send("curricular-component");
});

router.get('/db/curricular-component/', ensureAuthenticated, (req, res) => { 
	res.send("curricular-component");
});

router.get('/db/curricular-component/new/', ensureAuthenticated, (req, res) => { 
	res.send("curricular-component new");
});

router.get('/db/curricular-component/update/', ensureAuthenticated, (req, res) => { 
	res.send("curricular-component update");
});

router.get('/db/curricular-component/delete/', ensureAuthenticated, (req, res) => { 
	res.send("curricular-component delete");
});

router.get('/db/curricular-component/view/', ensureAuthenticated, (req, res) => { 
	res.send("curricular-component view");
});







module.exports = router;
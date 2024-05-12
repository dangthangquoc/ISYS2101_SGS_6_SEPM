const express = require('express');
const { checkUser } = require('../middleware/authMiddleware');
const dealController = require('../controllers/dealControllers');

const router = express.Router();

router.get('/deal', checkUser, (req, res) => {
  res.render('deal', { query: req.query });
});

router.post('/getDeals', checkUser, dealController.getDeals);

module.exports = router;

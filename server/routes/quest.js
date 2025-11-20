const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getQuests, claimReward } = require('../controllers/questController');

router.get('/', authMiddleware, getQuests);
router.post('/claim', authMiddleware, claimReward);

module.exports = router;
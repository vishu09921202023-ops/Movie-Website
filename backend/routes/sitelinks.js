const express = require('express');
const SiteLink = require('../models/SiteLink');

const router = express.Router();

// Public: GET /api/sitelinks/public
router.get('/public', async (req, res) => {
  try {
    const links = await SiteLink.find({ isActive: true }, { sort: { row: 1, order: 1 } });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

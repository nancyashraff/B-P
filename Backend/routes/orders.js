const express = require('express');
const router  = express.Router();
const { getOrders, getOrderById } = require('../controllers/ordersController');
//const { getDeliveryPrice }        = require('../utils/bosta');

router.get('/:userId',      getOrders);
router.get('/order/:id',    getOrderById);

router.get('/delivery-price/:city', async (req, res) => {
  try {
    const data = await getDeliveryPrice(req.params.city);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
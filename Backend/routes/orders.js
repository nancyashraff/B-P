const express = require('express');
const router  = express.Router();
const { getOrders, getOrderById } = require('../controllers/ordersController');

router.get('/:userId',      getOrders);
router.get('/order/:id',    getOrderById);
module.exports = router;
const axios = require('axios');

const BOSTA_API = 'https://app.bosta.co/api/v2';
const headers   = {
  'Authorization': process.env.BOSTA_API_KEY,
  'Content-Type':  'application/json'
};

// Get delivery price based on city
const getDeliveryPrice = async (city) => {
  try {
    const res = await axios.get(`${BOSTA_API}/pricing/delivery-price`, {
      headers,
      params: { dropOffCity: city }
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Could not get delivery price');
  }
};

// Create a delivery order on Bosta
const createDelivery = async (order) => {
  try {
    const payload = {
      type: 10, // 10 = SEND (deliver to customer)
      specs: {
        packageDetails: {
          itemsCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
          description: order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
        }
      },
      receiver: {
        firstName:   order.phone, // or split name if you collect it
        phone:       order.phone,
      },
      dropOffAddress: {
        city:        order.address.governorate,
        firstLine:   `${order.address.street}, ${order.address.building}, ${order.address.apartment}`,
      },
      businessReference: order._id.toString(),
      cod: order.total, // cash on delivery amount
    };

    const res = await axios.post(`${BOSTA_API}/deliveries`, payload, { headers });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Could not create Bosta delivery');
  }
};

module.exports = { getDeliveryPrice, createDelivery };
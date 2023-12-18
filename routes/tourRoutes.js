const express = require('express');
const { getAllTours, addNewTour, getTour, updateTour, checkID } = require('../controllers/tourController');

const router = express.Router();

//thêm middle xử lí cho param id
router.param('id', checkID);

router.route('/api/v1/tours').get(getAllTours).post(addNewTour);
router.route('/api/v1/tours/:id').get(getTour).patch(updateTour);

module.exports = router;

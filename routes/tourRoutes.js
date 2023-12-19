const express = require('express');
const {
  getAllTours,
  addNewTour,
  getTour,
  updateTour,
  checkID,
  checkBody,
} = require('../controllers/tourController');

const router = express.Router();

//thêm middle xử lí cho param id
router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, addNewTour);
router.route('/:id').get(getTour).patch(updateTour);

module.exports = router;

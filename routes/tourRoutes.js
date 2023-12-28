const express = require('express');
const {
  getTop5Tours,
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

router.route('/top-5-cheap').get(getTop5Tours, getAllTours);

router.route('/').get(getAllTours).post(checkBody, addNewTour);
router.route('/:id').get(getTour).patch(updateTour);

module.exports = router;

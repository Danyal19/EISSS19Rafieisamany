const express = require('express');
const request=require('request');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    request(`${process.env.SERVER}/find/${req.query.user}`, //Query Param kommt von HTML Form
      function(err,response,body) {
          const b=JSON.parse(body);
          res.render('map', {
            title: 'Trainingspartner finden',
            user: b.user,
            agg:b.agg
          });
      });
});

module.exports = router;

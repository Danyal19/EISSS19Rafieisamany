const express = require('express');
const db=require('../public/nodeScripts/database');
const router = express.Router();

/* GET users listing. */
router.get('/:name', async function (req, res, next) {
  try {
    let user = await db.getUser(req.params.name);
    const agg = await db.getInRadius(user);
    res.status(200).json({user,agg});
  } catch (e) {
    console.log(e);
    res.status(500).json(e);}
});

router.get('/user/:id', async function (req, res, next) {
  try {
    let x = await db.getUserByID(req.params.id);
    const user=x.toObject();
    user.statistic=user.statistics[user.statistics.length-1];
    res.status(200).json({user});
  } catch (e) {
    console.log(e);
    res.status(500).json(e);}
});

module.exports = router;

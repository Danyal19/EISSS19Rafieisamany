const express = require('express');
const db = require("../public/nodeScripts/database");
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index',{title:'Login'});
});

router.post('/', async function (req, res, next) {
  if(req.body.user)
    res.redirect(`/user/${req.body.user}`);
  else
    next(new Error('No Body defined'));
});

router.get('/user/:name', async function (req, res, next) {
  try {
    let user = await db.getUser(req.params.name);
    const coords=user.pos.coordinates;
    const x=await db.getInRadius(user);
    const nearby=x.map((n)=>{return n.pos.coordinates});
    res.render('map',{title:'Personen in der Umgebung',name:user.vorname,coords:coords,nearby:nearby,key:process.env.API_KEY});
  }catch (e) {next(e)}
});

module.exports = router;

const express = require('express');
const db = require("../public/nodeScripts/database");
const router = express.Router();

/* GET users listing. */
router.post('/', async function (req, res, next) {
  try {
    const b=req.body;
    const t=calcTime(b.time)/60;
    const userStat=await db.saveStatistic(b.user,t,calcDist(b.m,t+getRandomInt(0,60,-1)),b.sport);
    const chalStat=await db.saveStatistic(b.chal, t,calcDist(b.m,t+getRandomInt(0,60,-1)), b.sport);
    const misc={
      dist:b.m/1000,
      goal: t};
    res.status(200).json({userStat,chalStat,misc});
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

router.post('/points', async function (req, res, next) {
  try {
    const winner=[];
    let url;
    if(req.body.looser){
      await db.addPoints(req.body.winner,req.body.points);
      url=`?w=${req.body.winner}&l=${req.body.looser}`;
    }
    else{
      await db.asyncForEach(req.body.winner, async (w) => {
        winner.push(await db.addPoints(w,req.body.points))
      });
      url=`?w=${winner[0]}&w=${winner[1]}`;
    }
    const misc=req.body.misc;
    res.status(200).send(`${url}&p=${req.body.points}&dist=${misc.dist}&goal=${misc.goal}`);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});
module.exports = router;

function calcTime(t) {
  const time=t.split(':');
  const mins=parseInt(time[0])*60;
  return mins + parseInt(time[1]);
}

function calcDist(dist,t){
  //Minuten -> Stunden
  const h=t/60;
  //Zufallszahl auf Distanz addieren
  dist+=getRandomInt(10,20,dist*h);
  //Geschwindigkeit berechnen
  const kmh=dist/h;
  //Return auf 2 Nachkommstellen gerundete kmh/Distanz
  return Math.round(kmh/dist).toFixed(2);
}

//Generierung einer Zufallszahl in einem gegebenen Intervall, mit Angabe einer Zahl, die als Returnwert nicht zulässig ist
function getRandomInt(min, max,num) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const res=Math.floor(Math.random() * (max - min + 1)) + min;
  if(res===num)
    getRandomInt(min,max,num);
  else
    return res;
}

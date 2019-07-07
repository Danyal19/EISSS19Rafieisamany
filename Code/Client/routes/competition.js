const express = require('express');
const request=require('request');
const router = express.Router();

/* GET users listing. */
router.get('/:user/:challenged', function(req, res, next) {
    res.render('compete.hbs',{title:'Herausforderung definieren',user:req.params.user,chal:req.params.challenged});
});

router.post('/', function(req, res, next) {
    request.post({
        url:`${process.env.SERVER}/compete`,
        body:req.body,
        json:true
        },
        function(err,response,body) {
            const dist=req.body.m;
            const misc=body.misc;
            const stat1={distance:body.userStat.statistic.distance,time:body.userStat.time};
            const stat2={distance:body.chalStat.statistic.distance,time:body.chalStat.time};
            if(JSON.stringify(stat1)===JSON.stringify(stat2))
                updatePoints(res,[body.userStat.id,body.chalStat.id],null,dist,body.misc);
            else{
               let winner,looser;
                if(stat1.distance>stat2.distance){
                    winner=body.userStat.id;
                    looser=body.chalStat.id;
                }
                else{
                    winner=body.chalStat.id;
                    looser=body.userStat.id;
                }
                updatePoints(res,[winner],looser,dist,misc);
            }
        });
});

router.get('/display', function(req, res, next) {
    const q=req.query;
    if(typeof q.w!=='string'){
        request(`${process.env.SERVER}/find/user/${q.w[0]}`,
            function(err,response,body){
                const w1=JSON.parse(body);
                request(`${process.env.SERVER}/find/user/${q.w[1]}`,
                    function(err,response,body){
                        const w2=JSON.parse(body);
                        res.render('statistics',{title:'Herausforderungs Ergebnis',winner:[w1.user,w2.user],looser:false,points:q.p,dist:q.dist,goal:q.goal});
                    });
            });
    }
    else{
        let winner,looser;
        request(`${process.env.SERVER}/find/user/${q.w}`,
            function(err,response,body){
                winner=JSON.parse(body);
                winner=winner.user;
                request(`${process.env.SERVER}/find/user/${q.l}`,
                    function(err,response,b){
                        looser=JSON.parse(b);
                        looser=looser.user;
                        res.render('statistics',{title:'Herausforderungs Ergebnis',winner:winner,looser:looser,points:q.p,dist:q.dist,goal:q.goal});
                    });
            });
    }
});

function updatePoints(res,winner,looser,points,misc){
    request.post({
            url:`${process.env.SERVER}/compete/points`,
            body:{winner,looser,points,misc},
            json:true
        },
        function(err,response,body){
            res.redirect(`/compete/display${body}`);
        });
}

module.exports = router;

const mongo=require('mongoose');
const geolib = require('geolib');
const User=require('../models/User');

module.exports={
    connect:connect,
    asyncForEach:asyncForEach,
    getUser:getUser,
    getUserByID:getUserByID,
    getInRadius:getInRadius,
    saveStatistic:saveStatistic,
    addPoints:addPoints,
};

async function connect() {
    try {
        await mongo.connect(`${process.env.CONNECTION}/${process.env.DB}`);
        console.log(`Erfolgreich mit ${process.env.DB} verbunden`);
    }catch (e) {console.error(e)}
}

function getUserByID(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({_id:id});
            resolve(user)
        } catch (e) {reject(e)}
    });
}


function getUser(name) {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({$or:[
                    {vorname: name},
                    {nachname: name},
                    {user: name},
                    {email: name}
                    ]});
            resolve(user)
        } catch (e) {reject(e)}
    });
}

function getInRadius(user) {
    return new Promise(async (resolve, reject) =>{
        try {
            let calcDist = function (dist) {
                const num=Math.round(dist * 100) / 100;
                if(parseInt(num / 1000)===0){
                    return `${num} m`;
                }
                else{
                    return `${Math.round(num / 10)/100} km`
                }
            };
           let agg=await User.aggregate([{
               $geoNear: {
                   near: user.pos,
                   distanceField: "distance",
                   spherical: true,
                   maxDistance: 5000
               }
           },{ $match: {vorname:{$ne:user.vorname}}}]);
           agg.forEach((a)=>{
                a.distance=calcDist(a.distance);
            });
            resolve(agg);
       }catch (e){reject(e)}
    });
}

async function saveStatistic(id, time, distance, sport) {
    try {
        const user = await getUserByID(id);
        const run = time.toString().split('.');
        const today = new Date();
        const startTime = `${today.getHours()} : ${today.getMinutes()}`;
        const endTime = `${today.getHours() + parseInt(run[0])} : ${today.getMinutes() + parseInt(run[1])}`;
        const dest = geolib.computeDestinationPoint(user.pos.coordinates, distance, 1);
        const statistic = {
            sport: sport,
            distance: distance,
            time: time,
            startTime: startTime,
            endTime: endTime,
            start: user.pos,
            destination: {
                index: { type: '2dsphere', sparse: false },
                coordinates:Object.values(dest).reverse(),
                type:'Point'
            }
        };
        if(user.statistics)
            user.statistics.push(statistic);
        else
            user.statistics=[statistic];
        await user.save();
        return {id,statistic};
    }catch (e) {return e}
}

async function addPoints(id,points) {
    try {
        const user = await getUserByID(id);
        user.points=parseInt(user.points)+parseInt(points);
        await user.save();
        return user._id;
    }catch (e) {return e}
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

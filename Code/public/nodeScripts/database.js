const mongo=require('mongoose');
const User=require('../models/User');

module.exports={
    connect:connect,
    getUser:getUser,
    getInRadius:getInRadius
};

async function connect() {
    try {
        await mongo.connect(`${process.env.CONNECTION}/${process.env.DB}`);
        console.log(`Erfolgreich mit ${process.env.DB} verbunden`);
    }catch (e) {console.error(e)}
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
            let milesToRadian = function (miles) {
               let earthRadiusInMiles = 3959;
               return miles / earthRadiusInMiles;
           };
           let query = {
               "pos": {
                   $geoWithin: {
                       $centerSphere: [user.pos.coordinates, milesToRadian(5)]
                   }
               }
           }; //alle user in umgebung werden gesucht ne=not equel ich werde nicht mit ausgefiltert
           let users = await User.find(query).where('vorname').ne(user.vorname).select('-_id');
           resolve(users);
       }catch (e){reject(e)}
    });
}

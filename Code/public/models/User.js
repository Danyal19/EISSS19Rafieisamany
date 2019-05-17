const mongo=require('mongoose');

let schema = new mongo.Schema({
    vorname:{type:String,required:true},
    nachname: {type: String,required: true},
    email:{type: String,required: true},
    user:{type:String,required:true},
    alter:{type:Number,required:true},
    status:{type:String,required:true},
    interessen:[{type:String,required:true}],
    ziele:[{type:String,required:true}],
    pos: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            index: { type: '2dsphere', sparse: false },
            type: [Number],
            required: true
        }
    }
},{ collection: 'Users' });

module.exports=mongo.model('User', schema);

var mongoose = require("mongoose");

var userdataSchema = mongoose.Schema({
    fname:String,
    lname:String,
    address:String,
    bloodgroup: String,
    mobilenumber:String,
    orders:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }
    ]
});


module.exports = mongoose.model('UserData',userdataSchema);
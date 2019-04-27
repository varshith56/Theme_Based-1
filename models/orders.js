var mongoose = require("mongoose");

var orderSchema = mongoose.Schema({
    fname:String,
    mobilenumber:String,
});


module.exports = mongoose.model('Order',orderSchema);
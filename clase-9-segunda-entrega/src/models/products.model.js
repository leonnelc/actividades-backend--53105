const mongo = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const stringRequired = {type: String, required:true};
const numRequired = {type: Number, required:true};
const productsSchema = new mongo.Schema({
    title: stringRequired,
    description: stringRequired,
    category: stringRequired,
    price: numRequired,
    stock: numRequired,
    thumbnails: {type:[String], default:[], required:true},
    status: {type:Boolean, default: true, required:true},
    code: {
        type: String,
        required:true,
        unique:true
    }
});

productsSchema.plugin(mongoosePaginate);


const Products = mongo.model("Products", productsSchema);

module.exports = Products;

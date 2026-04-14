const mongoose = require("mongoose"); 
const treatmentSchema = new mongoose.Schema({ 
  visit_id: String, 
  type: String, // CPT //CDT 
  code: String, 
  description: String, 
  cost: Number
 }); 
 
 module.exports = mongoose.model("Treatment", treatmentSchema);
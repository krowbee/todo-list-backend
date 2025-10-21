const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description:{type: String, required:true},
    completed: {type: Boolean, default: false},
    userId: {type: mongoose.Schema.ObjectId, ref: "User", required: true},
    dueTo: {type: Date, required:true}
}, {timestamps: true})

module.exports = mongoose.model("Task", taskSchema);
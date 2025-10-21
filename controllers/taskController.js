const Task = require("../models/Task");

exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            title: req.body.title,
            description: req.body.description,
            userId: req.user._id,
            dueTo: req.body.dueTo
        })
        res.status(201).json(task);
    } catch (err) {
        return res.status(500).json({ message: "Error creating task", error: err })
    }
}

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ "userId": req.user._id });
        res.json(tasks);
    } catch (err) {
        console.log(err);
    }
}

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { "_id": req.params.taskId, "userId": req.user._id },
            req.body,
            { new: true }
        )

        if (!task) return res.status(403).json("Forbidden or task not found")

        res.status(200).json({ message: "resource updated succesfully" })
    } catch (err) {
        return res.status(500).json({ message: "Error updating task", error: err })
    }
}

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({"_id":req.params.taskId, "userId":req.user._id})
        if (!task) return res.status(404).json("Task not found")
        res.status(200).json({ message: "resource deleted succesfully" })
    } catch (err) {
        res.status(500).json({ message: "Error deleting task" })
    }
}
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController")

router.route("/")
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

router.route("/:taskId")
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask)

module.exports = router;
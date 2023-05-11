const express = require("express");
const bodyParser = require("body-parser");
const day = require(__dirname + '/date.js');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


const uri = "mongodb+srv://test1:test1@cluster0.vl89vse.mongodb.net/toDoListDB?retryWrites=true&w=majority";

const taskSchema = new mongoose.Schema({
    task: String,
    complete: Boolean,

});

const Task = mongoose.model("Task", taskSchema);

const dateSchema = new mongoose.Schema({
    date: String,
    tasks: [taskSchema]
});

const Date = mongoose.model("Date", dateSchema);

async function add(task,date) {
    await mongoose.connect(uri);

    const taskToAdd = new Task({
        task: task,
        complete: false,
    });

    const dates = await Date.find({date: date});
    
    if (dates.length === 0) {
        const dateToAdd = new Date({
            date: date,
            tasks: [taskToAdd]
        });
        await dateToAdd.save();
    } else {
        await Date.updateOne({date:date}, {$push: {tasks: taskToAdd}});
    };

};

async function update(task,date,checked) { //rather than update on task string update on object id
    await mongoose.connect(uri);
    if (checked) {
        await Date.updateOne({'tasks._id': task, 'date':date},{$set: {'tasks.$.complete': true}});
    } else {
        await Date.updateOne({'tasks._id': task, 'date':date},{$set: {'tasks.$.complete': false}});
    };
};

async function log(date) {
    await mongoose.connect(uri);
    let dates = await Date.find({date:date})
    if (dates.length === 0) {
        let newDate = new Date({
            date: date,
            tasks: []
        });
        await newDate.save();
    };
    let dateToRender = await Date.findOne({date:date});
    let tasks = dateToRender.tasks;
    return tasks;
};




app.get("/", function (req,res) {
    let date = day.getDate();

    log(date).then(function(tasks) {
        res.render("list", {weekday: date, tasks: tasks});
    });
});


app.post('/', function (req,res) {
    
    let toAdd = req.body['task-input'];
    let date = day.getDate();

    add(toAdd,date).then(function(){
        res.redirect('/');
    });
});

app.post('/update', function(req,res) {
    let checked = req.body['checked'];
    let index = req.body['index'];
    let date = req.body['date'];
    let task = req.body['task_id'];

    update(task, date, checked).then(function() {
        res.redirect('/');
    });

    
})


app.listen(port, function () {
    console.log("listening on port ${port}");
});

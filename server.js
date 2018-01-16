var express = require("express");
var app = express();
var session = require("express-session");
var bp = require("body-parser");
var path = require("path");
var mongoose = require("mongoose");
var port = 8000;
mongoose.Promise = require('bluebird');
mongoose.connect("mongodb://localhost/message_board");

var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 4 },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamp: true })

var CommentSchema = new mongoose.Schema({
    _message: { type: Schema.Types.ObjectId, ref: 'Message' },
    name: { type: String, required: true, minlength: 4 },
    text: { type: String, required: true },
}, { timestamps: true });


mongoose.model("Message", MessageSchema);
mongoose.model("Comment", CommentSchema);
var Message = mongoose.model("Message");
var Comment = mongoose.model("Comment");


app.use(bp.urlencoded());
app.use(express.static(path.join(__dirname, "/client")));
app.use(session({ secret: "key" }));

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    Message.find({}, function(err, messages) {
        res.render("index", { messages: messages })
    })

})
app.post("/process_message", function(req, res) {
    var message = new Message({ name: req.body.name, text: req.body.message })
    message.save(function(err) {
        if (err) {
            console.log('something went wrong');
        } else {
            console.log('successfully added a message');
            res.redirect('/');
        }
    })
})

app.post("/process_comment/:id", function(req, res) {
    console.log(Message[0]);
    Message.findById(req.params.id, function(err, message) {
        // console.log(message);
        var comment = new Comment({ _message: req.params.id, name: req.body.name, text: req.body.comment })
        console.log("*******", comment);
        message.comments.push(comment);
        console.log("***************", message.comments);
        comment.save(function(err) {
            if (err) {
                console.log('Error');
            } else {
                console.log("Comment Saved!");
                message.save(function(err) {
                    if (err) {
                        console.log('Error');
                    } else {
                        console.log("Comment Saved in messages!");
                        res.redirect('/');
                    };

                });
            }
        });
    });
});

app.listen(port, function() {
    console.log("Listening on Port:8000!")
})
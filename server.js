/*
    nodejs basic image hosting example.
    Robert Miller
*/

const express = require("express");
const db = require("diskdb");
const fs = require("fs");
const shortId = require("shortid");

//connecting too database
db.connect("fileData", ["data"]);

//setting up multer too handle multipart form data
const multer = require("multer");
const upload = multer({dest: 'uploads'});

//starting express
const app = express();
const port = 8080;

//serve main page
app.use(express.static("public"));

//handle uploads
app.post('/upload', upload.single("photo"),  function(req, res){
    let uniqueId = shortId.generate(); //create id for image

    //store image data as JSON
    db.data.save({
        id: uniqueId,
        path: req.file.path
    });

    //redirect client too image
    res.redirect("image/" + uniqueId);
});

//handle downloads
app.get("/image/:id", function(req, res){

    //find image by id and save in imageData
    let imageData = db.data.find({
        id: req.params.id
    });

    //get read image and send too client
    fs.readFile(imageData[0].path, function(err, data){
        //handle read errors
        if(err){
            res.send("An error occured");
            console.log(err);
        };

        //if image is able too be read send too client
        res.send("<img alt='Embedded Image' src='data:image/png;base64," + data.toString("base64") + "'>");
    });
    
});


app.listen(port, function(){
    console.log("server listening on port: " + port);
});
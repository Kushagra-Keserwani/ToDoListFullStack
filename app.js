//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
const day = date.getDate();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vishu:Test123@cluster0.pm1eu.mongodb.net/toDoListDB", {useNewUrlParser:true});

const itemSchema  = new mongoose.Schema({
  name: {
    type: String,
    required:true
  }
});

const Item = mongoose.model("Item", itemSchema);

const i1 = new Item({
  name:"Wake up Early",
})
const i2 = new Item({
  name:"Yoga",  
})
const i3 = new Item({
  name:"Breakfast",  
})


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {



Item.find({}, function(err, items){
  if(err){
    console.log(err);
  }else{
    // items.forEach(function(item){
    //   console.log(item.name);
    // });

    if(items.length===0){
      Item.insertMany([i1,i2,i3], function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle: day, newListItems: items});
    }
 }
});

  

});


const listSchema = new mongoose.Schema({
  name: String,
  items : [itemSchema]
});
const List = mongoose.model("List", listSchema);


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  

  

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){

        const L1 = new List({
          name: customListName,
          items: [i1, i2, i3]
        });

        L1.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
    
  });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


  const customListName = req.body.button;

  const i =new Item({
    name: itemName
  });

  if(customListName==day){
    i.save();
    res.redirect("/");
  }else{
 

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      
    
      foundList.items.push(i);
      foundList.save();
    }
  });



  res.redirect("/"+customListName);
  }


});

app.post("/delete", function(req, res){
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == day){
    Item.findByIdAndDelete(itemID, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted the item.");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, function (err, found){

    if(!err){
      res.redirect("/"+listName);
    }
      
     });
  }

  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});

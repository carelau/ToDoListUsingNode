//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var capitalize = require('lodash.capitalize');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery',false);
// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});
mongoose.connect("mongodb+srv://cranberry:Tryingserver2023@cluster0.d8kozek.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1  = new Item ({
  name: "Welcome to you todolist!"
});

const item2  = new Item ({
  name: "Hit the + button to add a new item."
});

const item3  = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
// if(err){
//   console.log(err);
// }
//   else {
//     console.log("Successfully saved all the items to todolistDB");
//   }
// });



app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){
  if(foundItems.length === 0 ) {
    Item.insertMany(defaultItems, function(err){
    if(err){
      console.log(err);
    }
    else {
      console.log("Successfully saved all the items to todolistDB");
    }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
});
  // Item.find(function(err, items){
  //   if(err){
  //     console.log(err);
  //   } else {
  //     mongoose.connection.close();
  //     // console.log(fruits);
  //     items.forEach(item => console.log(item.name));
  //   }
  // });

  // res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem  = new Item ({
  name: item
  });

  if (listName === "Today"){
      newItem.save();
      res.redirect("/");
  } else {
    List.findOne({name: listName }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


  // const item = req.body.newItem;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName ==="Today"){
  Item.findByIdAndDelete(checkedItemId, function (err, docs) {
    if (!err){
      console.log("Successfully deleted item.");
      res.redirect("/");
    } 
  });
} else {
  List.findOneAndUpdate({name:listName}, {$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}

});

app.get("/:customListName", function(req,res){
  const customListName = capitalize(req.params.customListName);
  //we get an object back - one document

  List.findOne({name: customListName }, function (err, foundList) {
    if (!err){
      if(!foundList)
      {
        //Create a new list
        console.log("Doesn't exist!");
          const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        console.log("Exists!");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
})


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

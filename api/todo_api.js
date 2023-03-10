import Todo from "../model/Todo_model.js";
import express from "express";
import auth from "../middleware/auth.js";
import authOwner from "../middleware/authOwner.js";
import authAdmin from "../middleware/authAdmin.js";
import deleteTodosJob from "../cron.js";
import Result from "../model/Result_model.js";

const todoApp = express.Router();

//GET TODOS
//@access privet

todoApp.get("/", authAdmin, async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET ONE TODO
//@access private

//get todo of one user
todoApp.get("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ user: req.params.id });
    res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF TODO
//@access private

//get todo of one user
todoApp.get("/get/me", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ user: req.user.id });
    res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF collections
//@access private

//get one todo of a collection
todoApp.get("/get/me/collections/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ user: req.user.id });
    const collections = todo.collections;
    res.status(200).json(collections);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF TODO
//@access private

//get one todo of a collection
todoApp.get("/get/me/:id/:collection_id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ user: req.user.id });
    const collections = todo.collections;
    let theTodo = collections.find((collection) => collection._id.toString() === req.params.collection_id);
    if (theTodo) {
      theTodo.todos = theTodo.todos.sort((a, b) => {
        return a.done - b.done;
      });
    }

    res.status(200).json(theTodo);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//POST NEW COLLECTION
//@access private

//add new collection with just the name but not todo
todoApp.post("/collection/:id", authOwner, async (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "please enter collection name" });
  if (!req.body.icon) return res.status(400).json({ error: "please select collection icon" });
  console.log(req.body);
  try {
    let todo = await Todo.findOne({ user: req.user.id });
    let collections = todo.collections;
    //if collection name is exist
    let collectionNames = [];

    collections.forEach((collection) => {
      collectionNames.push(collection.name);
    });
    if (collectionNames.includes(req.body.name)) {
      return res.status(400).json({ error: "There is collection with this name" });
    }
    //push new collection
    collections.push({
      name: req.body.name,
      icon: req.body.icon,
    });
    await todo.save();
    const newCollection = collections.find((collection) => collection.name === req.body.name);
    res.status(200).json(newCollection);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//PUT  COLLECTION
//@access private

//update collection name
todoApp.put("/collection/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;
  let { name, icon } = req.body;
  if (!name) return res.status(400).json({ error: "please enter collection name" });
  if (!icon) return res.status(400).json({ error: "please select your icon" });

  try {
    let todo = await Todo.findOne({ user: req.user.id });
    let collections = todo.collections;
    //find collection

    let collection = collections.find((collection) => collection._id.toString() === collection_id);
    //if there is no such collection
    if (!collection) return res.status(400).json({ error: "there is no such collection" });
    //change collection name
    //if he provide new name
    if (name) collection.name = name;
    if (icon) collection.icon = icon;

    await todo.save();
    res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//update collection favorite
todoApp.put("/collection/favorite/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;

  try {
    let todo = await Todo.findOne({ user: req.user.id });
    let collections = todo.collections;
    //find collection

    let collection = collections.find((collection) => collection._id.toString() === collection_id);
    //if there is no such collection
    if (!collection) return res.status(400).json({ error: "there is no such collection" });
    //change collection name
    //if he provide new name
    collection.isFav = !collection.isFav;

    await todo.save();
    res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//DELETE  COLLECTION
//@access private

//delete collection
todoApp.delete("/collection/one/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;

  try {
    let todo = await Todo.findOne({ user: req.user.id });
    let collections = todo.collections;

    //find the index of remove
    const removeIndex = collections.map((collection) => collection._id.toString()).indexOf(collection_id);
    //check if there is such collection
    if (removeIndex === -1) return res.status(400).json({ error: "There is no such collection" });
    collections.splice(removeIndex, 1);

    await todo.save();
    res.status(200).json(collection_id);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//DELETE ALL COLLECTION
//@access private

//delete collection
todoApp.delete("/collection/all/:id", authOwner, async (req, res) => {
  try {
    let todo = await Todo.findOne({ user: req.user.id });
    todo.collections = [];
    await todo.save();
    res.status(200).json(todo.collections);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//POST NEW TODO
//@access private

//add new todo
todoApp.post("/todo/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;
  let { todoItem, icon } = req.body;
  if (!todoItem) return res.status(400).json({ error: "please enter todo" });
  if (!icon) return res.status(400).json({ error: "please select Icon" });

  try {
    const todo = await Todo.findOne({ user: req.user.id });
    if (!todo) return res.status(400).json({ error: "there is no such todos" });
    //get collections
    let collections = todo.collections;

    //find the collection that I want to push todo
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same todo
    let todos = collection.todos;

    let todoIndex = todos.map((todo) => todo.content).indexOf(todoItem);
    if (todoIndex !== -1) {
      return res.status(400).json({ error: "There is todo with this content" });
    }

    //push new todo to the collection
    todos.push({
      content: todoItem,
      icon: icon,
    });
    await todo.save();
    const newTodo = todos.find((todo) => todo.content === todoItem);
    res.status(200).json(newTodo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//PUT TODO
//@access private

//put a todo done/undone
todoApp.put("/todo/done/:id/:collection_id/:todo_id", authOwner, async (req, res) => {
  let { collection_id, todo_id } = req.params;

  try {
    const todo = await Todo.findOne({ user: req.user.id });
    if (!todo) return res.status(400).json({ error: "there is no such todos" });
    //get collections
    let collections = todo.collections;

    //find the collection that I want to push todo
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same todo
    let todos = collection.todos;
    let todoIndex = todos.map((todo) => todo._id.toString()).indexOf(todo_id);
    if (todoIndex === -1) {
      return res.status(400).json({ error: "There is no todo with this content" });
    }
    //push new todo to the collection
    todos[todoIndex].done = !todos[todoIndex].done;
    const currentDate = new Date();
    const options = { weekday: "long", timeZone: "Asia/Baghdad" };
    const currentDay = currentDate.toLocaleString("en-US", options);
    const result = await Result.findOne({ user: req.user.id });
    const week = result.completedTodo;
    const theDay = week.find((day) => day.day === currentDay);

    if (todos[todoIndex].done) {
      theDay.count++;
    } else {
      theDay.count--;
    }
    await result.save();
    await todo.save();

    res.status(200).json(todos[todoIndex]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//PUT TODO
//@access private

//put a todo
todoApp.put("/todo/:id/:collection_id", authOwner, async (req, res) => {
  let { id, collection_id } = req.params;
  let { todoItem, oldTodo, icon } = req.body;
  if (!oldTodo) return res.status(400).json({ error: "please enter old todo" });
  if (!icon) return res.status(400).json({ error: "please select your icon" });

  try {
    const todo = await Todo.findOne({ user: req.user.id });
    if (!todo) return res.status(400).json({ error: "there is no such todos" });
    //get collections
    let collections = todo.collections;

    //find the collection that I want to push todo
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same todo
    let todos = collection.todos;
    let todoIndex = todos.map((todo) => todo.content).indexOf(oldTodo);
    if (todoIndex === -1) {
      return res.status(400).json({ error: "There is no todo with this content" });
    }
    //push new todo to the collection
    todos[todoIndex].content = todoItem;
    todos[todoIndex].icon = icon;
    await todo.save();
    res.status(200).json(todos[todoIndex]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//DELETE TODO
//@access private

//delete a todo
todoApp.delete("/todo/one/:id/:collection_id/:todo_id", authOwner, async (req, res) => {
  let { collection_id, todo_id } = req.params;

  try {
    const todo = await Todo.findOne({ user: req.user.id });
    if (!todo) return res.status(400).json({ error: "there is no such todos" });
    //get collections
    let collections = todo.collections;

    //find the collection that I want to push todo
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is todo with oldTodo content
    let todos = collection.todos;
    let todoIndex = todos.map((todo) => todo._id.toString()).indexOf(todo_id);
    if (todoIndex === -1) {
      return res.status(400).json({ error: "There is no todo with this content" });
    }
    //splice todo from todo array
    todos.splice(todoIndex, 1);
    await todo.save();
    res.status(200).json(todo_id);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//DELETE ALL TODO
//@access private

//delete all todo
todoApp.delete("/todo/all/:id/:collection_id", authOwner, async (req, res) => {
  try {
    let todo = await Todo.findOne({ user: req.user.id });
    let collections = todo.collections;
    let theCollection = [];
    collections.forEach((collection) => {
      if (collection._id.toString() === req.params.collection_id) {
        collection.todos = [];
        theCollection = collection;
        return;
      }
    });

    await todo.save();
    res.status(200).json(theCollection.todos);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

export default todoApp;

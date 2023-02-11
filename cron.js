import cron from "cron";
import Todo from "./model/Todo_model.js";
import auth from "./middleware/auth.js";
const deleteTodosJob = new cron.CronJob("0 0 0 * * *", auth, async () => {
  const todo = await Todo.findOne({ user: req.user.id });
  if (todo) {
    const collections = todo.collections;
    collections.forEach((collection) => {
      collection.todos = [];
    });
    await todo.save();
  }
});

deleteTodosJob.start();

export default deleteTodosJob;

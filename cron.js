import cron from "cron";
import Todo from "./model/Todo_model.js";

const deleteTodosJob = new cron.CronJob("0 0 0 * * *", async (userId) => {
  const todo = await Todo.findOne({ user: userId });
  const collections = todo.collections;
  collections.forEach((collection) => {
    collection.todos = [];
  });
  await todo.save();
});

deleteTodosJob.start();

export default deleteTodosJob;

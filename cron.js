import cron from "cron";
import Todo from "./model/Todo_model.js";
import auth from "./middleware/auth.js";
import Result from "./model/Result_model.js";
import User from "./model/User_model.js";
import { sendPlanNotification, sendTodoNotification } from "./nodemailer.js";
import Plan from "./model/Plan_model.js";
const deleteTodosJob = new cron.CronJob("0 0 0 * * *", auth, async () => {
  const todo = await Todo.findOne({ user: req.user.id });
  if (todo) {
    const collections = todo.collections;
    collections.forEach((collection) => {
      collection.todos = [];
    });
    await todo.save();
  }

  const currentDate = new Date();
  const options = { weekday: "long", timeZone: "Asia/Baghdad" };
  const dayOfWeek = currentDate.toLocaleString("en-US", options);
  //if it's monday so , we will  delete the chart
  if (dayOfWeek === "Thursday") {
    const userResult = await Result.findOne({ user: req.user.id });
    if (userResult) {
      //refresh the todos and the plans
      const todos = userResult.completedTodo;
      const plans = userResult.completedPlan;
      //loop through them and make  each day empty

      todos.forEach((todo) => {
        todo.count = 0;
      });
      plans.forEach((plan) => {
        plan.count = 0;
      });
    }
  }
});

deleteTodosJob.start();

const notifyUserJob = new cron.CronJob("0 0 20 * * *", auth, async () => {
  const user = await User.findById(req.user.id);
  const todo = await Todo.findOne({ user: req.user.id });
  if (todo && user) {
    const collections = todo.collections;
    collections.forEach((collection) => {
      if (collection.todos.length !== 0) {
        return sendTodoNotification(user.email);
      }
    });
  }

  const plan = await Plan.findOne({ user: req.user.id });
  if (plan && user) {
    const collections = plan.collections;
    collections.forEach((collection) => {
      if (collection.plans.length !== 0) {
        return sendPlanNotification(user.email);
      }
    });
  }
});

notifyUserJob.start();

export default deleteTodosJob;

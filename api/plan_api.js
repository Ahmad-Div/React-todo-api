import Plan from "../model/Plan_model.js";
import express from "express";
import auth from "../middleware/auth.js";
import authOwner from "../middleware/authOwner.js";
import authAdmin from "../middleware/authAdmin.js";
import Result from "../model/Result_model.js";

const planApp = express.Router();

//GET PlanS
//@access privet

planApp.get("/", authAdmin, async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET ONE Plan
//@access private

//get Plan of one user
planApp.get("/:id", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ user: req.params.id });
    res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF Plan
//@access private

//get Plan of one user
planApp.get("/get/me", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ user: req.user.id });
    res.status(200).json(plan);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF collections
//@access private

//get one todo of a collection
planApp.get("/get/me/collections/:id", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ user: req.user.id });
    const collections = plan.collections;
    res.status(200).json(collections);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//GET SELF PLAN
//@access private

//get one todo of a collection
planApp.get("/get/me/:id/:collection_id", auth, async (req, res) => {
  try {
    const plan = await Plan.findOne({ user: req.user.id });
    const collections = plan.collections;
    const thePlan = collections.find((collection) => collection._id.toString() === req.params.collection_id);
    if (thePlan) {
      thePlan.plans = thePlan.plans.sort((a, b) => {
        return a.done - b.done;
      });
    }
    res.status(200).json(thePlan);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//POST NEW COLLECTION
//@access private

//add new collection with just the name but not Plan
planApp.post("/collection/:id", authOwner, async (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: "please enter collection name" });
  try {
    let plan = await Plan.findOne({ user: req.user.id });
    let collections = plan.collections;
    //if collection name is exist
    if (collections.some((collection) => collection.name) === req.body.name) {
      return res.status(400).json({ error: "There is collection with this name" });
    }
    //push new collection
    collections.push({
      name: req.body.name,
    });
    await plan.save();
    const newCollection = collections.find((collection) => collection.name === req.body.name);
    res.status(200).json(newCollection);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//PUT  COLLECTION
//@access private

//update collection name
planApp.put("/collection/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;
  let { name } = req.body;
  if (!name) return res.status(400).json({ error: "please enter collection name" });

  try {
    let plan = await Plan.findOne({ user: req.user.id });
    let collections = plan.collections;
    //find collection

    let collection = collections.find((collection) => collection._id.toString() === collection_id);
    //if there is no such collection
    if (!collection) return res.status(400).json({ error: "there is no such collection" });
    //change collection name
    //if he provide new name
    if (name) collection.name = name;

    await plan.save();
    res.status(200).json(collection);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//DELETE  COLLECTION
//@access private

//add new collection with just the name but not Plan
planApp.delete("/collection/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;

  try {
    let plan = await Plan.findOne({ user: req.user.id });
    let collections = plan.collections;

    //find the index of remove
    const removeIndex = collections.map((collection) => collection._id.toString()).indexOf(collection_id);
    //check if there is such collection
    if (removeIndex === -1) return res.status(400).json({ error: "There is no such collection" });
    collections.splice(removeIndex, 1);

    await plan.save();
    res.status(200).json(collection_id);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

//POST NEW Plan
//@access private

//add new Plan
planApp.post("/plan/:id/:collection_id", authOwner, async (req, res) => {
  let { collection_id } = req.params;
  let { planItem } = req.body;
  if (!planItem) return res.status(400).json({ error: "please enter Plan" });
  try {
    const plan = await Plan.findOne({ user: req.user.id });
    if (!plan) return res.status(400).json({ error: "there is no such Plans" });
    //get collections
    let collections = plan.collections;

    //find the collection that I want to push Plan
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same Plan
    const plans = collection.plans;

    let planIndex = plans.map((plan) => plan.content).indexOf(planItem);
    if (planIndex !== -1) {
      return res.status(400).json({ error: "There is Plan with this content" });
    }

    //push new Plan to the collection
    plans.push({
      content: planItem,
    });
    await plan.save();

    //we have to enable auto delete 24 hour job
    // deletePlansJob(req.user.id);
    const newPlan = plans.find((plan) => plan.content === planItem);
    res.status(200).json(newPlan);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//PUT Plan
//@access private

//put a Plan done/undone
planApp.put("/plan/done/:id/:collection_id/:plan_id", authOwner, async (req, res) => {
  let { collection_id, plan_id } = req.params;

  try {
    const plan = await Plan.findOne({ user: req.user.id });
    if (!plan) return res.status(400).json({ error: "there is no such Plans" });
    //get collections
    let collections = plan.collections;

    //find the collection that I want to push Plan
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same Plan
    const plans = collection.plans;
    let planIndex = plans.map((plan) => plan._id.toString()).indexOf(plan_id);
    if (planIndex === -1) {
      return res.status(400).json({ error: "There is no Plan with this content" });
    }
    //push new Plan to the collection
    plans[planIndex].done = !plans[planIndex].done;

    const currentDate = new Date();
    const options = { weekday: "long", timeZone: "Asia/Baghdad" };
    const currentDay = currentDate.toLocaleString("en-US", options);
    const result = await Result.findOne({ user: req.user.id });
    const week = result.completedTodo;
    const theDay = week.find((day) => day.day === currentDay);

    if (plans[planIndex].done) {
      theDay.count++;
    } else {
      theDay.count--;
    }
    await result.save();
    await plan.save();
    res.status(200).json(plans[planIndex]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//put a Plan done/undone
planApp.put("/plan/:id/:collection_id", authOwner, async (req, res) => {
  let { id, collection_id } = req.params;
  let { planItem, oldPlan } = req.body;
  if (!oldPlan) return res.status(400).json({ error: "please enter old Plan" });
  try {
    const plan = await Plan.findOne({ user: req.user.id });
    if (!plan) return res.status(400).json({ error: "there is no such Plans" });
    //get collections
    let collections = plan.collections;

    //find the collection that I want to push Plan
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is the same Plan
    const plans = collection.plans;
    let planIndex = plans.map((plan) => plan.content).indexOf(oldPlan);
    if (planIndex === -1) {
      return res.status(400).json({ error: "There is no Plan with this content" });
    }
    //push new Plan to the collection
    plans[planIndex].content = planItem;
    await plan.save();
    res.status(200).json(plans[planIndex]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//DELETE Plan
//@access private

//delete a Plan
planApp.delete("/Plan/:id/:collection_id/:plan_id", authOwner, async (req, res) => {
  let { plan_id, collection_id } = req.params;

  try {
    const plan = await Plan.findOne({ user: req.user.id });
    if (!plan) return res.status(400).json({ error: "there is no such Plans" });
    //get collections
    let collections = plan.collections;

    //find the collection that I want to push Plan
    let collection = collections.find((collection) => collection._id.toString() === collection_id);

    if (!collection) return res.status(400).json({ error: "there is no such collection" });

    //we have to search if there is Plan with oldPlan content
    const plans = collection.plans;
    let planIndex = plans.map((plan) => plan._id.toString()).indexOf(plan_id);
    if (planIndex === -1) {
      return res.status(400).json({ error: "There is no Plan with this content" });
    }
    //splice Plan from Plan array
    plans.splice(planIndex, 1);
    await plan.save();
    res.status(200).json(plan_id);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default planApp;

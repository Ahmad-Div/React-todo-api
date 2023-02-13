import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    collections: [
      {
        name: {
          type: String,
          required: [true, "name is required"],
        },
        plans: [
          {
            content: {
              type: String,
              required: true,
            },
            done: {
              type: Boolean,
              default: false,
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
  { timestamps: true }
);

PlanSchema.post("validate", function (error, doc, next) {
  if (error) {
    const errors = {};
    for (const field in error.errors) {
      errors[field] = error.errors[field].message;
    }
    next(errors);
  } else {
    next();
  }
});

const Plan = new mongoose.model("plan", PlanSchema);

export default Plan;

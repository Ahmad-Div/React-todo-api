import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    completedTodo: [
      {
        day: {
          type: String,
          required: [true, "day is required"],
        },
        count: {
          type: Number,
          required: [true, "count  is required"],
        },
      },
    ],
    completedPlan: [
      {
        day: {
          type: String,
          required: [true, "day is required"],
        },
        count: {
          type: Number,
          required: [true, "count  is required"],
        },
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
  { timestamps: true }
);

ResultSchema.post("validate", function (error, doc, next) {
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

const Result = new mongoose.model("result", ResultSchema);

export default Result;

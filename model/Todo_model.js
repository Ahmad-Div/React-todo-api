import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    collections: [
      {
        name: {
          type: String,
          unique: [true, "name must be unique"],
          required: [true, "name is required"],
        },
        todos: [
          {
            content: {
              type: String,
              required: true,
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

TodoSchema.post("validate", function (error, doc, next) {
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

const Todo = new mongoose.model("todo", TodoSchema);

export default Todo;

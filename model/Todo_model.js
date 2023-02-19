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
          required: [true, "name is required"],
        },
        isFav: {
          type: Boolean,
          default: false,
        },
        icon: {
          type: String,
          required: true,
        },
        todos: [
          {
            content: {
              type: String,
              required: true,
            },
            done: {
              type: Boolean,
              default: false,
            },
            icon: {
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

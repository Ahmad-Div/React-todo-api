import User from "../model/User_model.js";
import jwt from "jsonwebtoken";

const authOwner = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ error: "not authorized" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(req.params.id);

    if (!user) return res.status(401).json({ error: "not authorized" });

    if (user.id !== decode.user.id) return res.status(401).json({ error: "it's not you authorized" });

    req.user = decode.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "not authorized" });
  }
};

export default authOwner;

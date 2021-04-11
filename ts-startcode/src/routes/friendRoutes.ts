import { Router } from "express";
const router = Router();
import { ApiError } from "../errors/apiError";
import FriendFacade from "../facades/friendFacade";
const debug = require("debug")("friend-routes");

let facade: FriendFacade;

router.use(async (req, res, next) => {
  if (!facade) {
    const db = req.app.get("db");
    debug("Database used: " + req.app.get("db-type"));
    facade = new FriendFacade(db);
  }
  next();
});

// This does NOT require authentication in order to let new users create themself
router.post("/", async function (req, res, next) {
  try {
    let newFriend = req.body;
    facade.addFriend(newFriend);
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(new ApiError(err.message, 400));
    }
  }
});

router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriends();
  const friendsDTO = friends.map((friend) => {
    const { firstName, lastName, email } = friend;
    return { firstName, lastName, email };
  });
  res.json(friendsDTO);
});

router.put("/:email", async function (req: any, res, next) {
  try {
    const email = req.params.userid;
    let newFriend = req.body;
    facade.editFriend(email, newFriend);
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(err.message, 400));
  }
});

router.get("/find-user/:email", async (req: any, res, next) => {
  const userId = req.params.userid;
  try {
    facade.getFrind(userId);
  } catch (err) {
    debug(err);
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(err.message, 400));
  }
});

export default router;

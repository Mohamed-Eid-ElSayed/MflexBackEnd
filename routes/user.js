import express from "express";
import { deleteUser, updateUser, addToFavorites, addToWatchlist, getFavoritesAndWatchlist } from "../controllers/user.js";
import verifyToken from "../utils/veriyToken.js";

const router = express.Router();

router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.post("/addtofavorites/:id/:movieId", verifyToken, addToFavorites);
router.post("/addtowatchlist/:id/:movieId", verifyToken, addToWatchlist);
router.get("/getfavoritesandwatchlist/:id", verifyToken, getFavoritesAndWatchlist);

export default router;
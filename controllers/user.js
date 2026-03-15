import User from "../models/user.js";
import errorHandler from "../utils/errorHandler.js";
import { validateUserUpdate } from "../utils/validateUserUpdate.js";
import bcrypt from "bcryptjs";

const updateUser = async (req, res, next) => {
    const { id } = req.params;

    if (req.user.id != id) {
        return next(errorHandler(403, "You are not allowed to update another user"));
    }

    const validated = validateUserUpdate(req.body);
    if (validated.error) {
        return next(errorHandler(400, validated.error));
    }

    const keys = Object.keys(validated);
    if (keys.length === 0) {
        const user = await User.findById(id).select("-password");
        if (!user) return next(errorHandler(404, "User not found"));
        return res.status(200).json(user._doc);
    }

    try {
        if (validated.email) {
            const existingEmail = await User.findOne({ email: validated.email, _id: { $ne: id } });
            if (existingEmail) {
                return next(errorHandler(400, "Email already in use by another account"));
            }
        }
        if (validated.username) {
            const existingUsername = await User.findOne({ username: validated.username, _id: { $ne: id } });
            if (existingUsername) {
                return next(errorHandler(400, "Username already in use by another account"));
            }
        }

        const updateFields = { ...validated };
        if (updateFields.password) {
            updateFields.password = await bcrypt.hash(updateFields.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return next(errorHandler(404, "User not found"));
        }

        const { password: pass, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(403, "You are not allowed to delete another user"));
    }

    try {
        await User.findByIdAndDelete(req.params.id);

        res.clearCookie("access_token");

        res.status(200).json("User deleted successfully");
    } catch (err) {
        next(err);
    }
};


const addToFavorites = async (req, res, next) => {
    const { id, movieId } = req.params;

    if (req.user.id != id) return next(errorHandler(403, "Log In to your own account to like for your own movies!"));

    try {
        const user = await User.findById(id);
        const favoriteMovies = user.favoriteMovies;
        const movie = favoriteMovies.find((m) => m == movieId);

        // responsible for removing a movieId from the array
        if (movie) {
            const response = await User.updateOne({ _id: id }, { $pull: { favoriteMovies: movieId } });
            res.status(200).json({ ...response, isLiked: false });
            return;
        }

        await User.updateOne({ _id: id }, { $push: { favoriteMovies: { $each: [movieId] } } });

        res.status(200).json({ isLiked: true });
    } catch (err) {
        next(err);
    }
}

const addToWatchlist = async (req, res, next) => {
    const { id, movieId } = req.params;

    if (req.user.id != id) return next(errorHandler(403, "Log In to your own account to like for your own movies!"));

    try {
        const user = await User.findById(id);
        const watchlist = user.watchlist;

        const movie = watchlist.find((m) => m == movieId);

        if (movie) {
            const response = await User.updateOne({ _id: id }, { $pull: { watchlist: movieId } });
            res.status(200).json({ ...response, partOfWatchlist: false });
            return;
        }

        await User.updateOne({ _id: id }, { $push: { watchlist: { $each: [movieId] } } });

        res.status(200).json({ partOfWatchlist: true });
    } catch (err) {
        next(err);
    }
}

const getFavoritesAndWatchlist = async (req, res, next) => {
    const { id } = req.params;

    if (req.user.id != id) return next(errorHandler(403, "Sorry mate login to your own account to see your reactions"));

    try {
        const user = await User.findById(id);

        if (!user) {
            return next(errorHandler(404, "Sorry user not found"));
        }

        const { favoriteMovies, watchlist } = user._doc;

        res.status(200).json({ favoriteMovies, watchlist });
    } catch (err) {
        next(err);
    }
}

export {
    updateUser,
    deleteUser,
    addToFavorites,
    addToWatchlist,
    getFavoritesAndWatchlist
}
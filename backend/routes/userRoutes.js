import express from "express";
const router = express.Router();
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} from "../controller/userController.js";
import {protect, admin} from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

//protect = for logged in users
//admin = for admin

router.post('/register', upload.single('profileImg'), registerUser);
router.route('/').post(protect,admin, upload.single('profileImg'), registerUser).get(protect,admin,getUsers);
router.post('/logout',logoutUser);
router.post('/login',authUser);
router.route('/profile').get(protect,getUserProfile).put(protect, upload.single('profileImg'), updateUserProfile);
router.route('/:id').delete(protect,admin,deleteUser).get(protect,admin,getUserById).put(protect,admin, upload.single('profileImg'), updateUser);


export default router;

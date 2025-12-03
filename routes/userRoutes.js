import express from 'express';
import { signup, login, getAllUsers, deleteUser, updateUserProfile } from '../Controllers/userController.js';

const router = express.Router();

router.route('/').get(getAllUsers); // GET /api/users
router.post('/signup', signup);    // POST /api/users/signup
router.post('/login', login);      // POST /api/users/login
router.route('/:id').delete(deleteUser).put(updateUserProfile); // DELETE /api/users/:id and PUT /api/users/:id

export default router;
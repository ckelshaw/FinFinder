import express from 'express';
import { createUser } from '../../controllers/users/userController.js';

const router = express.Router();
// Endpoint to create a new user, with clerk_user_id, username, first_name, last_name
router.post('/', createUser);

export default router;
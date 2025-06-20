import express from 'express';
import passwordsController from '../../controllers/passwords.controller';
import validateSchemaYup from '../../middlewares/validate.middleware';
import passwordsValidation from '../../validations/passwords.validation';
import {authenticateToken} from '../../middlewares/auth.middleware';

const router = express.Router();

router.put("/change-password", authenticateToken, validateSchemaYup(passwordsValidation.changePasswordSchema), passwordsController.handleChangePassword);
// router.post("/reset", passwordsController.handleResetPassword);
export default router;
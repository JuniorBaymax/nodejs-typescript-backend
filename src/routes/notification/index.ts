import { ProtectedRequest } from 'app.request.js';
import express from 'express';
import { Message } from 'firebase-admin/messaging';
import { Types } from 'mongoose';
import authentication from '../../auth/authentication.js';
import { SuccessMsgResponse } from '../../core/ApiResponse.js';
import User from '../../database/model/User.js';
import UserRepo from '../../database/repository/UserRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import validator, { ValidationSource } from '../../helpers/validator.js';
import firebaseLoader from '../../loaders/firebase.js';
import schema from './schema.js';

const router = express.Router();
const firebaseAdmin = firebaseLoader();
/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

async function sendNotification(
  userId: string,
  event: string,
  notificationPayload: Record<string, unknown>,
) {
  const registrationToken = await UserRepo.getUserFCMToken(
    new Types.ObjectId(userId),
  );

  if (registrationToken) {
    const payload = {
      notification: {
        title: `${event} Updated`,
        body: `${event} has been updated.`,
      },
      data: {
        event,
        ...notificationPayload,
      },
      token: registrationToken,
    };
    try {
      // Send the notification to the specified device
      await firebaseAdmin.messaging().send(payload as Message);
      console.log(`Notification sent successfully to user ${userId}:`, payload);
      return new SuccessMsgResponse('Notification sent successfully!');
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      // Handle errors or implement retry logic as needed
    }
  } else {
    console.warn(
      `No Firebase token found for user ${userId}. Notification not sent.`,
    );
    // Implement one of the fallback approaches mentioned above
  }
}

router.post(
  '/send_firebase_token/:registrationToken',
  validator(schema.firebase, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const registrationToken = req.params.registrationToken;
    const { _id } = req.user;

    await UserRepo.updateInfo({
      _id,
      firebaseToken: registrationToken,
    } as User);

    return new SuccessMsgResponse('success').send(res);
  }),
);

export default router;

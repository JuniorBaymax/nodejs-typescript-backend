import { Server as TServer } from 'http';
import { UserModel } from '../database/model/User.js';

import { Server, Socket } from 'socket.io';

function initializeSocket(server: TServer) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5000',
    },
  });

  io.on('connection', function (socket: Socket) {
    console.log('a user connected', socket.id);

    // Listen for heartbeat events
    socket.on('heartbeat', async (userId: string) => {
      console.log('User is active:', userId);

      socket.emit('online', 'active');
      if (userId) {
        // Update user's last_active_at timestamp in the database
        await UserModel.findByIdAndUpdate(userId, {
          last_active_at: new Date(),
        });
      }
    });

    socket.on('example_message', function (event: string) {
      console.log('message: ' + event);
      //sends the events back to the React app
    });
    socket.on('joinRoom', (userId: string) => {
      socket.join(userId); // Join the user to their room
      console.log(`User ${socket.id} joined room ${userId}`);
    });
    socket.on('disconnect', function () {
      console.log('User Disconnected');
      socket.disconnect();
    });
  });
  return io;
}

export default initializeSocket;

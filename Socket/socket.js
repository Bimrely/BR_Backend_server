import { Server } from 'socket.io';

let io;

function initialize(server) {
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

function emitLikeNotification(articleId) {
  io.emit('likeNotification', { articleId });
}

function emitCommentNotification(articleId) {
  io.emit('commentNotification', { articleId });
}

export {
  initialize,
  emitLikeNotification,
  emitCommentNotification,
};

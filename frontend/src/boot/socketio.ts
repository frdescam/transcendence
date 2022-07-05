import { io } from 'socket.io-client';

// Using socket.io namespaces: https://socket.io/docs/v4/namespaces/
export const chatSocket = io('//' + document.location.hostname + ':8080/chat');
export const gameSocket = io('//' + document.location.hostname + ':8080/game');

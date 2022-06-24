import { io } from 'socket.io-client';

// Using socket.io namespaces: https://socket.io/docs/v4/namespaces/
export const chatSocket = io('http://localhost:8080/chat'); // @TODO: dynamic hostname
export const gameSocket = io('http://localhost:8080/game'); // @TODO: dynamic hostname

import { io } from 'socket.io-client';

const URL =  process.env.NEXT_PUBLIC_SOCKET_URL || "";

export const socket = io(URL, {
	query: {
		deviceId: `phone:7398050181`
	},
	autoConnect: false
});



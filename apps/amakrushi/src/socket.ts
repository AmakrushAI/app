import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
	query: {
		deviceId: `phone:7398050181`
	},
	autoConnect: false
});



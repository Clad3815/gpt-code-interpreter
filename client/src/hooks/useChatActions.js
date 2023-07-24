import { useChat } from "../context/ChatProvider";

const useChatActions = () => {
    const { socket } = useChat();

    const joinRoom = (roomID) => {
        socket.emit('join-room', roomID);
    }

    const leaveRoom = (roomID) => {
        socket.emit('leave-room', roomID);
    }

    const sendMessage = (text, roomID, userName, history, model) => {
        if(! text) {
            return;
        }
                
        socket.emit('send-message', { text, roomID, userName, history, model });
    }

    return {
        joinRoom,
        sendMessage,
        leaveRoom
    }
};

export default useChatActions;
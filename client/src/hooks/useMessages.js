import React, { useEffect, useState } from "react";
import { useChat } from "../context/ChatProvider";


const convertOutputToCode = (data) => {
     return "```Code_Interpreter\n" + data + "\n```";
};

const useMessages = () => {
    const { socket, currentRoom } = useChat();
    const roomMessagesKey = `room-${currentRoom.id}-messages`; // Create key for each room's messages
    const roomHistoryKey = `room-${currentRoom.id}-history`; // Create key for each room's history
    // Provide a fallback value to JSON.parse when the item does not exist in localStorage
    const [messages, setMessages] = useState(JSON.parse(localStorage.getItem(roomMessagesKey)) || []);
    const [history, setHistory] = useState(JSON.parse(localStorage.getItem(roomHistoryKey)) || []);



    useEffect(() => {
        socket.on('receive-message', (newMessage) => {
            setMessages((m) => [...m, newMessage]);
        });

        socket.on('update-history', (newHistory) => {
            setHistory(newHistory);
        });



        // socket.on('update-code-data', ({ messageId, divId, data }) => {
        //     setMessages((m) => m.map((message) => {
        //         if (message.id === messageId) {
        //             return { ...message, codeInterpreter: data };
        //         }
        //         return message;
        //     }));
        // });



        socket.on('update-message', ({ id, newContent, codeInterpreter }) => {
            // Update the message with the given ID
            setMessages((m) => m.map((message) => {
                if (message.id === id) {
                    let newText = message.textWithPlaceholder + newContent;
                    const placeholderText = newText.toString();
                    const sections = [newText];
                    codeInterpreter.forEach(ci => {
                        const placeholder = `<div id="${ci.id}"></div>`;
                        const placeholderIndex = sections.findIndex(section => typeof section === 'string' && section.includes(placeholder));
                        if (placeholderIndex !== -1) {
                            const section = sections[placeholderIndex];
                            const splitSections = section.split(placeholder);
                            sections.splice(placeholderIndex, 1, splitSections[0], { code: ci.code, output: ci.output, running: ci.running, stderr: ci.stderr, stdout: ci.stdout }, splitSections[1]);
                        }
                    });
                    return { ...message, text: sections, textWithPlaceholder: placeholderText, codeInterpreter: codeInterpreter };
                }
                return message;
            }));
        });


        return () => {
            socket.off('receive-message');
            socket.off('update-message');
            socket.off('update-history');
        }
    }, [socket]);


    useEffect(() => {
        localStorage.setItem(roomMessagesKey, JSON.stringify(messages));
        localStorage.setItem(roomHistoryKey, JSON.stringify(history));
    }, [messages, history]);

    useEffect(() => {
        setMessages(JSON.parse(localStorage.getItem(roomMessagesKey)) || []);
        setHistory(JSON.parse(localStorage.getItem(roomHistoryKey)) || []);
    }, [currentRoom]);


    return messages;
}

export default useMessages;

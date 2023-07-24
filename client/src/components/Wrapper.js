import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatProvider';
import ChatContainer from './ChatContainer';
import Login from './Login';

const WrapperContainer = styled.div`
  display: grid;
  height: 100vh;
  place-items: center;
`;

const Wrapper = () => {
    const { userName } = useChat();

    return (
        <WrapperContainer>
            {
                ! userName
                ?
                <Login />
                :
                <ChatContainer />
            }
        </WrapperContainer>
    );
};

export default Wrapper;
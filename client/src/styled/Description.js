import styled from "styled-components";

export const Description = styled.p `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${ props => props.size };
    
    color: ${ props => props.color }
`;
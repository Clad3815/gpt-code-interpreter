import React from 'react';

const RoomItem = ({ src, name, description }) => {
    return (
        <>
            <img src={ src } />

            <div>
                <span>{ name }</span>
                <p>{ description }</p>
            </div>
        </>
    );
};

export default RoomItem;
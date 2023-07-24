import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const ModelSelectionContainer = styled.div`
    display: flex;
    background: #fff;
    width: 30%;
    padding-left: 1.2em;
    border-radius: 1.2em;

    & select {
        width: 85%;
        background: transparent;
        border: none;
    }

    @media (max-width: 820px) {
        display: none;
    }
`;

const ModelSelection = () => {
	const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selectedModel') || 'gpt-3.5-turbo');

	const handleModelChange = (e) => {
		setSelectedModel(e.target.value);
		localStorage.setItem('selectedModel', e.target.value);
	};

	useEffect(() => {
		setSelectedModel(localStorage.getItem('selectedModel') || 'gpt-3.5-turbo');
	}, []);

	return (
		<ModelSelectionContainer>
			<select value={selectedModel} onChange={handleModelChange}>
				<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
				<option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
				<option value="gpt-4">gpt-4</option>
				<option value="gpt-4-32k">gpt-4-32k</option>
			</select>
		</ModelSelectionContainer>
	);
};

export default ModelSelection;

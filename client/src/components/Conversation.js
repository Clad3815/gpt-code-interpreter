import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { getFirstLetter } from '../helpers';
import useMessages from '../hooks/useMessages';
import { useChat } from '../context/ChatProvider';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import parse from 'html-react-parser';

import AnsiToHtml from 'ansi-to-html';


import hljs from 'highlight.js/lib/core'; // import core library
import javascript from 'highlight.js/lib/languages/javascript'; // import the language you need
import python from 'highlight.js/lib/languages/python'; // import the language you need
import 'highlight.js/styles/github.css'; // import the style you want

import { jsonrepair } from 'jsonrepair';

hljs.registerLanguage('javascript', javascript); // register the language
hljs.registerLanguage('python', python); // register the language




const MarkdownContent = styled.div`
    /* Styles for the markdown content */
    color: #333;
    line-height: 1.6;
    word-wrap: break-word;

    h1, h2, h3, h4, h5, h6 {
        margin: 10px 0;
        font-weight: bold;
    }

    h1 {
        font-size: 2em;
    }

    h2 {
        font-size: 1.5em;
    }

    h3 {
        font-size: 1.3em;
    }

    p {
        margin: 10px 0;
    }

    a {
        color: #1a0dab;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    code {
        font-family: monospace;
        background-color: #f8f8f8;
        padding: 2px 5px;
        border-radius: 3px;
    }

    pre {
        padding: 10px;
        border-radius: 3px;
        overflow-x: auto;
    }

    pre code {
        background-color: transparent;
        padding: 0;
        color: white;
    }

    blockquote {
        margin: 10px 0;
        padding-left: 10px;
        border-left: 3px solid #d3d3d3;
    }

    img {
        max-width: 100%;
        height: auto;
    }

    ul, ol {
        margin: 10px 0;
        padding-left: 20px;
    }
    
    table {
        --tw-border-opacity:1;
        border-color:rgba(142,142,160,var(--tw-border-opacity));
        border-collapse:collapse;
        width:100%;
        border:0 solid #d9d9e3;
        box-sizing:border-box;
    }

    
    th, td {
        border:1px solid #d9d9e3; /* Adjust to match your design */
        padding:.5rem;
    }

    th {
        background-color:rgba(236,236,241,.2);
        border-bottom-width:1px;
        border-left-width:1px;
        border-top-width:1px;
        padding:.25rem .75rem
    }

    th:first-child {
        border-top-left-radius:.375rem
    }

    th:last-child {
        border-right-width:1px;
        border-top-right-radius:.375rem
    }

    td {
        border-bottom-width:1px;
        border-left-width:1px;
        padding:.25rem .75rem
    }

    td:last-child {
        border-right-width:1px
    }

    tbody tr:last-child td:first-child {
        border-bottom-left-radius:.375rem
    }

    tbody tr:last-child td:last-child {
        border-bottom-right-radius:.375rem
    }

    a {
        text-decoration-line:underline;
        text-underline-offset:2px
    }
`;


const ConversationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1vh;
    flex: 1;
    padding: 20px;
    overflow: auto;


    /* Custom Scrollbar for Webkit browsers */
    &::-webkit-scrollbar {
        width: 5px;   /* Width of the scrollbar */
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;   /* Color of the tracking area */
    }

    &::-webkit-scrollbar-thumb {
        background: #888;   /* Color of the scroll thumb */
        border-radius: 2px;   /* Rounded scrollbar */
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #555;   /* Color of the scroll thumb on hover */
    }

    /* Custom Scrollbar for Firefox */
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
`;

const MessageContent = styled.div`
    display: flex;
    font-size: 0.8em;
    font-weight: 300;
    padding: 0.8em 1em;
    width: fit-content;
    height: fit-content;
`;

const MessageContainer = styled.div`
    display: flex;
    gap: 20px;
    color: #fff;
    font-size: 1rem;
    flex-direction: ${props => props.isOwner ? 'row-reverse' : 'row'};

    ${MessageContent} {
        background: ${props => props.isOwner ? '#fff' : 'var(--blue-gradient)'};
        border: ${props => props.isOwner ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'};
        color: ${props => props.isOwner ? '#000' : '#fff'};
        box-shadow:  ${props => props.isOwner ? 'rgba(0, 0, 0, 0.15)' : 'rgba(32, 112, 198, 0.4)'} 2px 3px 15px;
        border-radius: ${props => props.isOwner ? '8px 0 8px 8px' : '0 8px 8px 8px'};
    }
`;


const UserProfile = styled.div`
    display: flex;
    position: relative;
    height: 100%;

    &::before {
        content: '${props => getFirstLetter(props.content) }';
        display: grid;
        place-content: center;
        padding: 0.5em;
        width: 1.3em;
        height: 1.3em;
        border-radius: 50%;
        background: var(--secondry-color-dark-palette);
    }
`
const BotMessage = styled.div`
    width: fit-content;
    margin: 0 auto;
    padding: 0.85em 1.7em;
    font-size: 0.7em;
    text-align: center;
    border-radius: 2em;
    background: rgba(0,0,0,0.05);
`;

const CodeBlockHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2d3748;
    color: #e2e8f0;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 0.375rem 0.375rem 0 0;
    font-family: sans-serif;
    position: relative;
    top: 5px;
`;


const CopyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #e2e8f0;
    cursor: pointer;
`;

const CodeBlockContainer = styled.div`
  border-radius: 5px;
  max-width: 1000px;
  overflow: hidden;  /* Ensures the child borders don't peek out */
`;

const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    let lang = 'python'; // default language
    if (match && match[1]) {
        lang = match[1];
    }
    let highlightedCode;
    if (!highlightedCode) {
        try {
            highlightedCode = hljs.highlightAuto(children).value;
        } catch (_) { }
    }

    const [isCopied, setIsCopied] = useState(false);

    const handleCopyClick = () => {
        navigator.clipboard.writeText(children);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    };

    return !inline ? (
        <React.Fragment>
            <CodeBlockContainer>
                <CodeBlockHeader>
                    <span>{lang.toUpperCase()}</span>
                    <CopyButton onClick={handleCopyClick}>
                        {isCopied ? (
                            <>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                </svg>
                                Copy code
                            </>
                        )}
                    </CopyButton>
                </CodeBlockHeader>
            <pre style={{ backgroundColor: "black", padding: "1rem", borderRadius: "5px", overflow: "auto" }} className={className} {...props}>
                <code dangerouslySetInnerHTML={{ __html: highlightedCode || children }} />
            </pre>
            </CodeBlockContainer>
        </React.Fragment>
    ) : (
        <code className={className} {...props} style={{ backgroundColor: "black", color: "white" }}>
            {children}
        </code>
    );
};

const CodeBlockWrapperContainer = styled.div`
    /* Add your styles here */

    .flex {
        display: flex;
    }

    .text-xs {  
        font-size: .75rem;
        line-height: 1rem;
    }

    .rounded {
        border-radius: 5px;
    }

    .p-3 {  
        padding: .75rem;
    }

    .text-gray-900 {  
        --tw-text-opacity: 1;
         color: rgba(32,33,35,var(--tw-text-opacity));
    }

    .bg-gray-100 {
        --tw-bg-opacity:1;
        background-color:rgba(236,236,241,var(--tw-bg-opacity))
    }

    .bg-green-100 {
        --tw-bg-opacity: 1;
        background-color: rgba(210,244,211,var(--tw-bg-opacity));
    }

    .ml-12 {
        margin-left: 3rem;
    }

    .gap-2 {
        gap: 8px;
    }

    .text-gray-600 {
        color: #718096;
    }

    .h-4 {
        height: 16px;
    }

    .w-4 {
        width: 16px;
    }

    .finished {
        background-color: #f5f5f5;
    }
    
    .working {   
        background-color: #78b58a;
    }
    [role="button"], button {
        cursor: pointer;
    }
    .items-center {
        align-items: center;
    }
    
@-webkit-keyframes spin {
 to {
  -webkit-transform:rotate(1turn);
  transform:rotate(1turn)
 }
}
@keyframes spin {
 to {
  -webkit-transform:rotate(1turn);
  transform:rotate(1turn)
 }
}
    .animate-spin {
        -webkit-animation:spin 1s linear infinite;
        animation:spin 1s linear infinite
    }

    .text-center {
        text-align:center
    }

    .shrink-0 {
        flex-shrink:0
    }

    .ml-1 {
        margin-left:.25rem
    }
.h-4 {
 height:1rem
}
.w-4 {
 width:1rem
}
`;

const OutputComponentContainer = styled.div`
    background-color: #000;
    padding: 1rem;
    border-radius: 0.375rem;
    color: #d1d5db;
    font-size: 0.8rem;
    margin: 5px 0;  /* Add vertical margin */
  max-width: 1000px;

    .stdout-stderr-label {
        color: #9ca3af;
        margin-bottom: 0.25rem;
    }

    .stdout-stderr-content {
        overflow: auto;
        color: #fff;
        max-height: 16rem;
        display: flex;
        flex-direction: column-reverse;
    }

    /* Custom Scrollbar for Webkit browsers */
    .stdout-stderr-content::-webkit-scrollbar {
        width: 5px;   /* Width of the scrollbar */
    }

    .stdout-stderr-content::-webkit-scrollbar-track {
        background: #374151;   /* Color of the tracking area */
    }

    .stdout-stderr-content::-webkit-scrollbar-thumb {
        background: #6b7280;   /* Color of the scroll thumb */
        border-radius: 2px;   /* Rounded scrollbar */
    }

    .stdout-stderr-content::-webkit-scrollbar-thumb:hover {
        background: #4b5563;   /* Color of the scroll thumb on hover */
    }

    /* Custom Scrollbar for Firefox */
    .stdout-stderr-content {
        scrollbar-width: thin;
        scrollbar-color: #6b7280 #374151;
    }
`;

const PreContent = styled.pre`
    flex-shrink: 0;
`;


function OutputComponent({ stderr, stdout, output }) {
    const convert = new AnsiToHtml();
    const htmlOutput = convert.toHtml(stderr);

    return (
        <>
            {stderr && (
                <OutputComponentContainer>
                    <div className="stdout-stderr-label">STDERR</div>
                    <div className="stdout-stderr-content">
                        <PreContent dangerouslySetInnerHTML={{ __html: convert.toHtml(stderr) }}></PreContent>
                    </div>
                </OutputComponentContainer>
            )}
            {stdout && (
                <OutputComponentContainer>
                    <div className="stdout-stderr-label">STDOUT</div>
                    <div className="stdout-stderr-content">
                        <PreContent dangerouslySetInnerHTML={{ __html: convert.toHtml(stdout) }}></PreContent>
                    </div>
                </OutputComponentContainer>
            )}
            {output && (
                <OutputComponentContainer>
                    <div className="stdout-stderr-label">RESULT</div>
                    <div className="stdout-stderr-content">
                        <PreContent>{output}</PreContent>
                    </div>
                </OutputComponentContainer>
            )}
            
        </>
    );
}


const CodeBlockWrapper = ({ code, output, stderr, stdout, running }) => {
    const [isVisible, setIsVisible] = useState(false);
    console.log("CodeBlockWrapper: ", output, stderr, stdout, running);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    let codeFormatted;

    let codeJSON;
    try {
        codeJSON = JSON.parse(code);
        codeFormatted = codeJSON.code;
    } catch (e) {
        try {
            codeJSON = JSON.parse(jsonrepair(code));
            codeFormatted = codeJSON.code;
        } catch (e) {
            // console.log(e);
        }
    }

    if (!codeFormatted) {
        codeFormatted = code;
    }

    return (
        <CodeBlockWrapperContainer>
            <div className={`flex items-center text-xs rounded p-3 text-gray-900 ${!running ? 'bg-gray-100' : 'bg-green-100'}`}
            style={{ width: "275px" }}
            >
                <div>{!running ? "Finished working" : 
                (
                    <>
                    <span>Working</span>
                        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-center shrink-0 ml-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                        </>
                )}

                
                </div>
                <div className="ml-12 flex items-center gap-2" role="button" onClick={toggleVisibility}>
                    <div className="text-xs text-gray-600">
                        {isVisible ? 'Hide work' : 'Show work'}
                       
                    </div>
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <polyline points={isVisible ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                    </svg>
                </div>
            </div>
            {isVisible && (
                <>
                    <CodeBlock className={"language-code"}>{codeFormatted}</CodeBlock>
                    
                    <OutputComponent stderr={stderr} stdout={stdout} output={output} />
                </>
            )}
        </CodeBlockWrapperContainer>
    );
};

const Conversation = () => {
    const { socket } = useChat();
    const messages = useMessages();
    const chatConversation = useRef(null);


    const currentUserName = localStorage.getItem('userName');

    return (
        <ConversationContainer ref={chatConversation}>
            {
                messages.map((m) => {
                    const { text, author, socket_id, id } = m;
                    const isBot = (author === 'BOT' && !socket_id);
                    const isOwner = author === currentUserName;

                    return isBot ?
                        <BotMessage>
                            <MarkdownContent>
                                <ReactMarkdown remarkPlugins={[gfm]}>{text}</ReactMarkdown>
                            </MarkdownContent>
                        </BotMessage>
                        :
                        (
                            <MessageContainer key={id} isOwner={isOwner}>
                                <UserProfile content={author} />
                                <MessageContent>
                                    <MarkdownContent>
                                        {Array.isArray(text) ? text.map((section, index) => {
                                            if (typeof section === 'string') {
                                                const replacedText = section
                                                .replace(/sandbox:\/output-img\//g, 'http://localhost:4050/output-img/')
                                                .replace(/sandbox:\//g, 'http://localhost:5008/')

                                                .replace(/\/mnt\/data\//g, '/');
                                                return <ReactMarkdown key={index} components={{ code: CodeBlock }} remarkPlugins={[gfm]}>{replacedText}</ReactMarkdown>
                                            } else {
                                                const { code, output, stderr, stdout, running } = section;
                                                // Render the CodeBlockWrapper component with the code and output
                                                return <CodeBlockWrapper key={index} code={code} output={output} running={running} stderr={stderr} stdout={stdout} />;
                                            }
                                        }) : <ReactMarkdown components={{ code: CodeBlock }} remarkPlugins={[gfm]}>{text}</ReactMarkdown>}
                                    </MarkdownContent>
                                </MessageContent>

                            </MessageContainer>
                        );
                })
            }
        </ConversationContainer>
    );
};

export default Conversation;
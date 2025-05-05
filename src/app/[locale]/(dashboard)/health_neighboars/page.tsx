// app/[locale]/(dashboard)/health_neighbors/page.tsx
"use client"; // This page is a Client Component

import { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css'; // Import the CSS module (corrected import path)

// Define interfaces for the data structure
interface HealthNeighbor {
    id: string;
    name: string;
    similarityScore: number; // A hypothetical score representing health vector similarityScore
    // You could add more details here, like key metrics
}

interface GraphNode {
    id: string;
    name: string;
    isCentral?: boolean; // To identify the main user
    x: number; // X-coordinate for positioning in the SVG
    y: number; // Y-coordinate for positioning in the SVG
}

interface GraphLink {
    source: string; // ID of the source node
    target: string; // ID of the target node
    similarityScore: number; // The similarityScore score for the link
}

interface HealthNeighborsData {
    centralUser: {
        id: string;
        name: string;
    };
    neighbors: HealthNeighbor[];
}

// Interface for a single chat message
interface ChatMessage {
    id: string;
    senderId: string; // ID of the sender
    text: string;
    timestamp: string; // ISO string or similar
}


// --- Mock Data Simulation ---
// In a real application, this data would come from your backend
// after analyzing health vectors and finding similar individuals.
function generateMockHealthNeighborsData(): HealthNeighborsData {
    const centralUser = { id: 'user-0', name: 'You' };
    const neighbors: HealthNeighbor[] = [
        { id: 'user-1', name: 'Neighbor A', similarityScore: parseFloat((Math.random() * (0.9 - 0.6) + 0.6).toFixed(2)) },
        { id: 'user-2', name: 'Neighbor B', similarityScore: parseFloat((Math.random() * (0.85 - 0.5) + 0.5).toFixed(2)) },
        { id: 'user-3', name: 'Neighbor C', similarityScore: parseFloat((Math.random() * (0.95 - 0.7) + 0.7).toFixed(2)) },
    ];

    return {
        centralUser,
        neighbors,
    };
}

// --- Mock Chat Messages Data Simulation ---
// This simulates chat messages that would come from a backend API.
const mockChatMessages: { [neighborId: string]: ChatMessage[] } = {
    'user-1': [
        { id: 'msg-1', senderId: 'user-1', text: 'Hi there!', timestamp: '2024-01-20T10:00:00Z' },
        { id: 'msg-2', senderId: 'user-0', text: 'Hello!', timestamp: '2024-01-20T10:01:00Z' },
        { id: 'msg-3', senderId: 'user-1', text: 'How are you?', timestamp: '2024-01-20T10:02:00Z' },
    ],
    'user-2': [
        { id: 'msg-4', senderId: 'user-2', text: 'Hey!', timestamp: '2024-01-20T11:00:00Z' },
        { id: 'msg-5', senderId: 'user-0', text: 'Hi!', timestamp: '2024-01-20T11:01:00Z' },
    ],
    'user-3': [
        { id: 'msg-6', senderId: 'user-3', text: 'Greetings!', timestamp: '2024-01-20T12:00:00Z' },
    ],
};

// Function to simulate fetching chat messages for a specific neighbor
async function fetchChatMessages(neighborId: string): Promise<ChatMessage[]> {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return mock messages for the given neighbor ID
    return mockChatMessages[neighborId] || [];
}

// Function to simulate sending a chat message
async function sendChatMessage(neighborId: string, messageText: string): Promise<ChatMessage> {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Simulate a response from the backend with the new message
    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`, // Simple unique ID for mock
        senderId: 'user-0', // Assuming the central user is sending
        text: messageText,
        timestamp: new Date().toISOString(),
    };
    // In a real app, you would send the message to your backend here
    // and the backend would handle saving it and potentially broadcasting to the other user.
    console.log(`Simulating sending message "${messageText}" to ${neighborId}`);
    return newMessage;
}


export default function HealthNeighborsPage() {
    const [healthNeighborsData, setHealthNeighborsData] = useState<HealthNeighborsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [texting, setTexting] = useState(false);
    const [selectedNeighborId, setSelectedNeighborId] = useState<string | null>(null); // State to track which neighbor is selected for chat
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // State to store chat messages
    const [currentMessage, setCurrentMessage] = useState(''); // State for the message being typed

    // --- Effect to simulate fetching health neighbors data ---
    useEffect(() => {
        // Simulate a network delay before setting the data
        const simulateFetch = setTimeout(() => {
            const mockData = generateMockHealthNeighborsData();
            setHealthNeighborsData(mockData);
            setIsLoading(false); // Set loading to false after data is "received"
        }, 1000); // Simulate a 1000ms delay

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(simulateFetch);

    }, []); // Empty dependency array means this runs once on mount


    // --- Effect to fetch chat messages periodically ---
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const loadMessages = async (neighborId: string) => {
            try {
                // In a real app, replace this with your actual API call
                const messages = await fetchChatMessages(neighborId);
                setChatMessages(messages);
            } catch (err) {
                console.error("Error fetching chat messages:", err);
                // Handle error (e.g., display an error message in the chat)
            }
        };

        if (selectedNeighborId) {
            // Load initial messages
            loadMessages(selectedNeighborId);

            // Set up interval to fetch new messages every 2 seconds
            intervalId = setInterval(() => {
                console.log(`Fetching new messages for ${selectedNeighborId}...`);
                loadMessages(selectedNeighborId);
            }, 2000); // Fetch every 2 seconds
        }

        // Cleanup function to clear the interval
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

    }, [selectedNeighborId]); // Re-run this effect when selectedNeighborId changes


    // --- Process data for graph visualization ---
    const graphData = useMemo(() => {
        if (!healthNeighborsData) {
            return { nodes: [], links: [] };
        }

        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];

        // Add the central user node
        nodes.push({
            id: healthNeighborsData.centralUser.id,
            name: healthNeighborsData.centralUser.name,
            isCentral: true,
            x: 0, // Placeholder, will be positioned in SVG
            y: 0, // Placeholder, will be positioned in SVG
        });

        // Add neighbor nodes and links to the central user
        healthNeighborsData.neighbors.forEach(neighbor => {
            nodes.push({
                id: neighbor.id,
                name: neighbor.name,
                x: 0, // Placeholder
                y: 0, // Placeholder
            });
            links.push({
                source: healthNeighborsData.centralUser.id,
                target: neighbor.id,
                similarityScore: neighbor.similarityScore,
            });
        });

        // Basic positioning for a radial layout (can be improved)
        const centerX = 250; // Center of the SVG
        const centerY = 250;
        const radius = 150; // Distance of neighbors from the center
        // Ensure we don't divide by zero if there are no neighbors
        const angleStep = healthNeighborsData.neighbors.length > 0 ? (2 * Math.PI) / healthNeighborsData.neighbors.length : 0;

        nodes.forEach((node, index) => {
            if (node.isCentral) {
                node.x = centerX;
                node.y = centerY;
            } else {
                // Position neighbors in a circle around the central user
                // Adjust index for neighbors since the central node is first
                node.x = centerX + radius * Math.cos((index - 1) * angleStep);
                node.y = centerY + radius * Math.sin((index - 1) * angleStep);
            }
        });


        return { nodes, links };

    }, [healthNeighborsData]); // Recalculate when healthNeighborsData changes


    // Function to handle starting a chat with a neighbor
    const start_chat = (id: string) => {
        setTexting(true);
        setSelectedNeighborId(id);
        setChatMessages([]); // Clear previous messages when starting a new chat
        setCurrentMessage(''); // Clear input field
        // The useEffect for fetching messages will be triggered by selectedNeighborId change
    };

    // Function to close the chat
    const close_chat = () => {
        setTexting(false);
        setSelectedNeighborId(null);
        setChatMessages([]); // Clear messages when closing chat
        setCurrentMessage(''); // Clear input field
    };

    // Function to handle input field changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(event.target.value);
    };

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (!currentMessage.trim() || !selectedNeighborId) {
            // Don't send empty messages or if no neighbor is selected
            return;
        }

        const messageText = currentMessage.trim();
        setCurrentMessage(''); // Clear input field immediately

        // Optimistically add the message to the chat
        const tempMessageId = `temp-${Date.now()}`; // Use a temporary ID
        const newMessage: ChatMessage = {
            id: tempMessageId,
            senderId: healthNeighborsData?.centralUser.id || 'user-0', // Assume central user is sender
            text: messageText,
            timestamp: new Date().toISOString(),
        };
        setChatMessages(prevMessages => [...prevMessages, newMessage]);

        try {
            // In a real app, replace this with your actual API call to send the message
            const sentMessage = await sendChatMessage(selectedNeighborId, messageText);
            // Optional: Replace the temporary message with the actual message from the backend response
            // setChatMessages(prevMessages => prevMessages.map(msg => msg.id === tempMessageId ? sentMessage : msg));
        } catch (error) {
            console.error("Error sending message:", error);
            // Handle error (e.g., display a "failed to send" indicator)
            // Optional: Revert the optimistic update or show an error next to the message
            setChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessageId)); // Remove temporary message on error
            // Could add a failed message indicator instead of removing
        }
    };

     // Function to handle sending message on Enter key press
     const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
         if (event.key === 'Enter') {
             event.preventDefault(); // Prevent default form submission if input is in a form
             handleSendMessage();
         }
     };


    // Show loading state
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                 <div className={styles.loadingSpinner}></div>
                 <p>Finding health neighbors...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return <div className={styles.errorContainer}><p>{error}</p></div>;
    }

    // Show message if no data
    if (!healthNeighborsData || healthNeighborsData.neighbors.length === 0) {
        return (
            <div className={styles.container}>
                <h1>Health Neighbors</h1>
                <p>No health neighbor data available.</p>
            </div>
        );
    }

    // Render the graph and chat sections
    return (
        <div className={styles.container}>
            <h1>Health Neighbors</h1>

            <div className={styles.graphAndChatContainer}> {/* Container for graph and chat */}
                <div className={styles.graphContainer}>
                    {/* SVG for the graph visualization */}
                    <svg width="500" height="500" viewBox="0 0 500 500">
                        {/* Render links (lines) */}
                        {graphData.links.map((link, index) => {
                            const sourceNode = graphData.nodes.find(node => node.id === link.source);
                            const targetNode = graphData.nodes.find(node => node.id === link.target);

                            if (!sourceNode || !targetNode) return null; // Should not happen with correct data

                            // Calculate stroke width based on similarityScore (example)
                            const strokeWidth = 1 + link.similarityScore * 5; // Thicker line for higher similarityScore

                            return (
                                <line
                                    key={index}
                                    x1={sourceNode.x}
                                    y1={sourceNode.y}
                                    x2={targetNode.x}
                                    y2={targetNode.y}
                                    className={styles.graphLink}
                                    strokeWidth={strokeWidth}
                                    // You could add tooltip or other interactions here
                                />
                            );
                        })}

                        {/* Render nodes (circles) and labels */}
                        {graphData.nodes.map(node => (
                            <g
                                key={node.id}
                                className={styles.graphNodeGroup}
                                onClick={() => !node.isCentral && start_chat(node.id)} // Only allow clicking on neighbor nodes
                                style={{ cursor: node.isCentral ? 'default' : 'pointer' }} // Change cursor for neighbors
                            >
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={node.isCentral ? 20 : 15} // Larger circle for the central user
                                    className={node.isCentral ? styles.centralNode : styles.neighborNode}
                                    // You could add hover effects or other interactions here
                                />
                                <text
                                    x={node.x}
                                    y={node.y + (node.isCentral ? 30 : 25)} // Position label below the circle
                                    textAnchor="middle" // Center the text
                                    className={styles.nodeLabel}
                                >
                                    {node.name}
                                </text>
                                 {/* Display similarityScore score for neighbors */}
                                 {!node.isCentral && (
                                     <text
                                         x={node.x}
                                         y={node.y + (node.isCentral ? 45 : 40)} // Position similarityScore below name
                                         textAnchor="middle"
                                         className={styles.similarityLabel}
                                     >
                                        Similarity: {graphData.links.find(link => link.target === node.id)?.similarityScore.toFixed(2) || 'N/A'}
                                     </text>
                                 )}
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Chat Section */}
                {texting && selectedNeighborId && (
                    <div className={styles.chat}>
                        <div className={styles.chatHeader}>
                            {/* Find the selected neighbor's name for the chat header */}
                            <h2>Chat with {healthNeighborsData?.neighbors.find(n => n.id === selectedNeighborId)?.name}</h2>
                            <button className={styles.closeChatButton} onClick={close_chat}>X</button>
                        </div>
                        <div className={styles.chatMessages}>
                            {/* Render chat messages */}
                            {chatMessages.length > 0 ? (
                                chatMessages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`${styles.message} ${message.senderId === healthNeighborsData?.centralUser.id ? styles.myMessage : ''}`}
                                    >
                                        {message.text}
                                    </div>
                                ))
                            ) : (
                                <p>No messages yet.</p>
                            )}
                        </div>
                        <div className={styles.chatInput}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={currentMessage}
                                onChange={handleInputChange}
                                onKeyPress={handleInputKeyPress} // Handle Enter key
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

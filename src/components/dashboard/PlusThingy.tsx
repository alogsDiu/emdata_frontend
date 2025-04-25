"use client";

import { motion } from 'framer-motion';
import styles from './PlusThingy.module.css'; // Assuming this CSS module exists

// Interface (optional, kept for context)
interface PlusThingy {
    plusClass?: string;
    horizontalClass?: string;
    verticalClass?: string;
}

// Variants for the PARENT container (controls scale, opacity, and hover state)
const plusContainerVariants = {
    initial: {
        scale: 1,
        opacity: 1 // Initial opacity (fully opaque)
    },
    hover: {
        scale: 1.15,
        opacity: 0.7, // Opacity on hover (e.g., 70% opaque - adjust as needed)
        transition: { type: "spring", stiffness: 300, damping: 15 } // Transition applies to scale and opacity
    }
};

// Variants for the inner bars (controls color - remains unchanged)
const barVariants = {
    initial: {
        backgroundColor: "#000000" // Or your default color from CSS
    },
    hover: {
        backgroundColor: "#3498db", // The blue hover color
        transition: { duration: 0.2 } // Color transition
    }
};

// Component accepting style props
export default function PlusThingy() {
    return (
        // Outer div uses variants for scaling, opacity and triggering hover state
        <div
            className={styles.plus} // Use class from CSS module
        >
            {/* Inner divs inherit the 'hover' state and apply their own variants */}
            <div
                className={styles.plusHorizontal} // Use class from CSS module
            ></div>
            <div
                className={styles.plusVertical}   // Use class from CSS module
            ></div>
        </div>
    )
}
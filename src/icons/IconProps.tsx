import React from 'react';

export default interface IconProps {
    /**  The width in pixels or percentage of the icon. */
    width?: number | string;
    /**  The height in pixels or percentage of the icon. */
    height?: number | string;
    /** Click handler. */
    onClick?: (e: React.MouseEvent) => void;
    /** The class name for the SVG element. */
    className?: string;
    /** Styles for the SVG element. */
    style?: React.CSSProperties;
    fontSize?: 'small';
}

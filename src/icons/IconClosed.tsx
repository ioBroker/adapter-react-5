import React from 'react';
import type IconProps from './IconProps';

// Icon copied from https://github.com/FortAwesome/Font-Awesome/blob/0d1f27efb836eb2ab994ba37221849ed64a73e5c/svgs/regular/
const IconClosed = (props: IconProps): React.JSX.Element => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        onClick={e => props.onClick && props.onClick(e)}
        viewBox="0 0 650 512"
        width={props.width || (props.fontSize === 'small' ? 16 : 20)}
        height={props.height || props.width || (props.fontSize === 'small' ? 16 : 20)}
        className={props.className}
        style={props.style}
    >
        <path
            fill="currentColor"
            d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z"
        />
    </svg>
);

export default IconClosed;

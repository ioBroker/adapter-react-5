import React from 'react';
import PropTypes from 'prop-types';

const IconDevice = props => <svg onClick={e => props.onClick && props.onClick(e)} viewBox="0 0 320 320" width={props.width || 20} height={props.height || props.width || 20} xmlns="http://www.w3.org/2000/svg" className={props.className}>
    <g fill="currentColor">
        <rect rx="32" height="272" width="267" y="25" x="25" strokeWidth="15" stroke="currentColor" fill="none" />
        <ellipse stroke="currentColor" ry="26" rx="26" cy="252" cx="160" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
        <line strokeLinecap="null" strokeLinejoin="null" y2="201.94531" x2="159.5" y1="46.94531" x1="159.5" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="currentColor" fill="none" />
        <rect height="27" width="50" y="140.83068" x="133.5" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="currentColor" fill="#fff" />
        <ellipse stroke="currentColor" ry="26" rx="26" cy="251" cx="241" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
        <line strokeLinecap="null" strokeLinejoin="null" y2="200.94531" x2="240.5" y1="45.94531" x1="240.5" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="currentColor" fill="none" />
        <rect height="27" width="50" y="78.7979" x="214.5" strokeWidth="15" stroke="currentColor" fill="#fff" />
        <ellipse stroke="currentColor" ry="26" rx="26" cy="252" cx="84" fillOpacity="null" strokeOpacity="null" strokeWidth="15" fill="#fff" />
        <line strokeLinecap="null" strokeLinejoin="null" y2="201.94531" x2="83.5" y1="46.94531" x1="83.5" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="currentColor" fill="none" />
        <rect height="27" width="50" y="79.7979" x="57.5" fillOpacity="null" strokeOpacity="null" strokeWidth="15" stroke="currentColor" fill="#fff" />
    </g>
</svg>;

IconDevice.propTypes = {
    onClick: PropTypes.func,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    className: PropTypes.string,
};

export default IconDevice;

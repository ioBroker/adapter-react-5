import React from 'react';
import PropTypes from 'prop-types';

const IconFx = props => <svg onClick={e => props.onClick && props.onClick(e)} style={props.style || {}} viewBox="0 0 95 95" width={props.width || 20} height={props.height || props.width || 20} xmlns="http://www.w3.org/2000/svg" className={props.className}>
    <path
        fill="currentColor"
        d="M93.779,63.676c-0.981-1.082-2.24-1.653-3.639-1.653c-1.145,0-3.953,0.396-5.318,4.062
        c-0.344,0.922-0.443,1.413-0.907,1.363c-0.786-0.078-3.845-3.346-4.845-8.145l-2.482-11.6c1.961-3.177,3.977-5.629,5.988-7.292
        c1.08-0.882,2.314-1.349,3.808-1.43c3.815-0.26,5.203-0.74,6.14-1.399c1.547-1.115,2.397-2.728,2.397-4.542
        c0-1.596-0.604-3.019-1.75-4.115c-1.106-1.059-2.581-1.618-4.26-1.618c-2.468,0-5.239,1.142-8.474,3.49
        c-1.91,1.388-3.935,3.406-6.121,6.111c-0.711-2.653-1.319-3.889-1.771-4.628c-1.396-2.303-3.664-2.303-4.41-2.303l-0.813,0.013
        l-23.045,0.544l1.297-5.506c0.828-3.593,1.915-6.436,3.226-8.45c0.638-0.98,1.614-2.148,2.638-2.148
        c0.387,0,1.152,0.063,2.582,0.36c3.978,0.86,5.465,0.959,6.239,0.959c1.708,0,3.21-0.571,4.347-1.651
        c1.176-1.119,1.797-2.583,1.797-4.233c0-1.29-0.424-3.156-2.445-4.722c-1.396-1.081-3.311-1.629-5.691-1.629
        c-3.568,0-7.349,1.141-11.241,3.39c-3.862,2.232-7.038,5.317-9.438,9.171c-2.105,3.379-3.929,8.124-5.555,14.459H21.877
        l-2.238,8.831h10.186l-7.74,31.116c-1.603,6.443-2.777,8.028-3.098,8.361c-0.875,0.904-2.68,1.094-4.04,1.094
        c-1.683,0-3.477-0.121-5.349-0.361c-1.286-0.157-2.265-0.234-2.991-0.234c-1.878,0-3.423,0.488-4.59,1.448
        C0.716,81.858,0,83.403,0,85.14c0,1.357,0.44,3.309,2.539,4.895c1.434,1.08,3.389,1.628,5.813,1.628
        c6.069,0,11.725-2.411,16.813-7.165c4.947-4.624,8.571-11.413,10.773-20.195l6.119-24.935l20.87,0.354l2.244,9.64l-4.573,6.748
        c-0.824,1.209-2.051,2.701-3.658,4.441c-0.84,0.92-1.398,1.426-1.721,1.689c-1.316-1.608-2.809-2.424-4.432-2.424
        c-1.525,0-2.91,0.625-4.002,1.804c-1.036,1.116-1.583,2.514-1.583,4.038c0,1.83,0.783,3.459,2.264,4.709
        c1.357,1.146,3.034,1.728,4.981,1.728c2.414,0,4.884-0.921,7.344-2.737c2.053-1.519,4.697-4.526,8.074-9.189
        c2.17,6.24,5.248,10.252,6.714,11.927c2.313,2.644,6.049,4.22,9.993,4.22c3.348,0,5.244-1.402,6.916-2.641l0.148-0.109
        c2.926-2.164,3.54-4.545,3.54-6.166C95.174,65.965,94.691,64.679,93.779,63.676z"
    />
</svg>;

IconFx.propTypes = {
    onClick: PropTypes.func,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    className: PropTypes.string,
};

export default IconFx;

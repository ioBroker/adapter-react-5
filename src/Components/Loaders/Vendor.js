/**
 * Copyright 2021-2023 ioBroker GmbH
 *
 * MIT License
 *
 **/
import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
// import './Vendor.css'
const vendorStyles = `
.logo-background-light, .logo-background-colored {
    background: white;
}
.logo-background-dark, .logo-background-blue {
    background: black;
}
`;

/**
 * @typedef {object} LoaderVendorProps
 * @property {string} [themeType] The chosen theme type.
 * @property {string} [theme] The chosen theme.
 *
 * @extends {React.Component<LoaderVendorProps>}
 */
class LoaderVendor extends React.Component {
    /**
     * @param {LoaderVendorProps} props
     */
    constructor(props) {
        super(props);
        if (!window.document.getElementById('vendor-iobroker-component')) {
            const style = window.document.createElement('style');
            style.setAttribute('id', 'vendor-iobroker-component');
            style.innerHTML = vendorStyles;
            window.document.head.appendChild(style);
        }
    }

    render() {
        const theme = this.props.themeType || this.props.theme || 'light';
        return <div
            className={`vendor-logo-back logo-background-${theme}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '10%',
                margin: 'auto',
            }}
        >
            <div style={{ flexGrow: 1 }} />
            <CircularProgress color="secondary" size={200} thickness={5} />
            <div style={{ flexGrow: 1 }} />
        </div>;
    }
}

LoaderVendor.propTypes = {
    themeType: PropTypes.string,
};

/** @type {typeof LoaderVendor} */
const _export = LoaderVendor;
export default _export;

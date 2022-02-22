/**
 * Copyright 2021 ioBroker GmbH
 *
 * MIT License
 *
 **/
import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import './Vendor.css'

/**
 * @typedef {object} LoaderProps
 * @property {string} [key] The key to identify this component.
 * @property {number} [size] The size in pixels of this loader.
 * @property {string} [themeType] The chosen theme type.
 * @property {string} [theme] The chosen theme.
 *
 * @extends {React.Component<LoaderProps>}
 */
class LoaderVendor extends React.Component {
    /**
     * @param {LoaderProps} props
     */
    constructor(props) {
        super(props);
        this.size = this.props.size || 200;
    }

    render() {
        const theme = this.props.themeType || this.props.theme || 'light';
        return <div className={'vendor-logo-back logo-background-' + theme} style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '10%',
            margin: 'auto'
        }}>
            <div style={{flexGrow: 1}}/>
            <CircularProgress color="secondary" size={200} thickness={5}/>
            <div style={{flexGrow: 1}}/>
        </div>;
    }
}

LoaderVendor.propTypes = {
    size: PropTypes.number,
    themeType: PropTypes.string
};

/** @type {typeof LoaderVendor} */
const _export = LoaderVendor;
export default _export;

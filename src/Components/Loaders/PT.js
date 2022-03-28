/**
 * Copyright 2021-2022 ioBroker GmbH
 *
 * MIT License
 *
 **/
import React from 'react';
import PropTypes from 'prop-types';
import './PT.css'

/**
 * @typedef {object} LoaderProps
 * @property {string} [key] The key to identify this component.
 * @property {number} [size] The size in pixels of this loader.
 * @property {string} [themeType] The chosen theme type.
 * @property {string} [theme] The chosen theme.
 *
 * @extends {React.Component<LoaderProps>}
 */
class LoaderPT extends React.Component {
    /**
     * @param {LoaderProps} props
     */
    constructor(props) {
        super(props);
        this.size = this.props.size || 200;
    }

    render() {
        const theme = this.props.themeType || this.props.theme || 'light';
        return <div className={'pt-logo-back logo-background-' + theme}>
            <div className="pt-logo-div" style={{width: this.size, height: this.size}}>
                <div style={{width: 200, height: 200}}>
                    <div className="pt-loader-blue pt-loader-block"/>
                    <div className="pt-loader-green pt-loader-block"/>
                    <div className="pt-loader-red pt-loader-block"/>
                </div>
            </div>
        </div>;
    }
}

LoaderPT.propTypes = {
    size: PropTypes.number,
    themeType: PropTypes.string
};

/** @type {typeof LoaderPT} */
const _export = LoaderPT;
export default _export;
/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import './loader.css'

const styles = theme => ({

});

/**
 * @typedef {object} LoaderProps
 * @property {string} [key] The key to identify this component.
 * @property {number} [size] The size in pixels of this loader.
 * @property {string} [themeType] The chosen theme type.
 * @property {string} [theme] The chosen theme.
 *
 * @extends {React.Component<LoaderProps>}
 */
class Loader extends React.Component {
    render() {
        const size = this.props.size || 234;
        const theme = this.props.themeType || this.props.theme || 'light';
        return <div className={'logo-back logo-background-' + theme}>
            <div className="logo-div" style={{width: size, height: size}}>
                <div className={'logo-top logo-background-' + theme} style={{left: '37%'}}/>
                <div className={'logo-top logo-background-' + theme} style={{left: '57%'}}/>
                <div
                    className={'logo-border logo-background-' + theme + ' logo-animate-wait'}
                    style={{borderWidth: size * 0.132}}
                />
                <div className={'logo-i logo-animate-color-inside-' + theme}/>
                <div className={'logo-i-top logo-animate-color-inside-' + theme} style={{top: '18%'}}/>
                <div className={'logo-i-top logo-animate-color-inside-' + theme} style={{bottom: '18%'}}/>
            </div>
            <div className={'logo-animate-grow logo-animate-grow-' + theme}
                 style={{width: size + 11, height: size + 11}}
            />
        </div>;
    }
}

Loader.propTypes = {
    size: PropTypes.number,
    themeType: PropTypes.string
};

/** @type {typeof Loader} */
const _export = withStyles(styles)(Loader);
export default _export;
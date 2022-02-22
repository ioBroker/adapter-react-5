/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * Licensed under the Creative Commons Attribution-NonCommercial License, Version 4.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://creativecommons.org/licenses/by-nc/4.0/legalcode.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react';
import {ChromePicker} from 'react-color';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import IconDelete from '@mui/icons-material/Delete';

const styles = theme => ({
    color: {
        width: 36,
        height: 14,
        borderRadius: 2,
    },
    delButton: {
        //width: 32,
        //height: 32,
        marginTop: 16,
    },
    swatch: {
        marginTop: 16,
        padding: 5,
        background: '#fff',
        borderRadius: 1,
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
        verticalAlign: 'middle'
    },
    popover: {
        position: 'absolute',
        zIndex: 2,
    },
    cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    textDense: {
        marginTop: 0,
        marginBottom: 0,
    }
});

/**
 * @typedef {object} Rgb
 * @property {number} r The red component of the color (0-255).
 * @property {number} g The green component of the color (0-255).
 * @property {number} b The blue component of the color (0-255).
 * @property {number} a The alpha component of the color (0-255).
 *
 * @typedef {string | Rgb | { rgb: Rgb }} Color Definition of a color.
 *
 * @typedef {object} ColorPickerProps
 * @property {boolean} [disabled] Set to true to disable the color picker.
 * @property {Color} [value] The currently selected color.
 * @property {(rgba: string) => void} [onChange] The color change callback.
 * @property {string} [name] The name.
 * @property {React.CSSProperties} [style] Additional styling for this component.
 * @property {string} [className] The CSS class name.
 * @property {boolean} [openAbove] Open the color picker above the field?
 *
 * @extends {React.Component<ColorPickerProps>}
 */
class ColorPicker extends React.Component {
    /**
     * @param {Readonly<ColorPickerProps>} props
     */
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: this.props.value || this.props.color,
        };
    }

    /**
     * Get the state derived from the given properties and state.
     * @param {{ color: Color; }} props
     * @param {{ color: Color; }} state
     */
    static getDerivedStateFromProps(props, state) {
        const pColor = ColorPicker.getColor(props.value || props.color);
        const sColor = ColorPicker.getColor(state.color);
        if (pColor !== sColor) {
            return {color: props.value || props.color}
        } else {
            return null;
        }
    }

    /**
     * @private
     */
    handleClick = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker});
    };

    /**
     * @private
     */
    handleClose = () => {
        this.setState({displayColorPicker: false});
    };

    /**
     * Convert the given color to hex ('#rrggbb') or rgba ('rgba(r,g,b,a)') format.
     * @param {Color} [color]
     * @param {boolean} [isHex] The returning string should be in hex format
     * @returns {string} the hex or rgba representation of the given color.
     */
    static getColor(color, isHex) {
        if (color && typeof color === 'object') {
            if (color.rgb) {
                if (isHex) {
                    return '#' + color.rgb.r.toString(16).padStart(2, '0') + color.rgb.g.toString(16).padStart(2, '0') + color.rgb.b.toString(16).padStart(2, '0');
                } else {
                    return 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + color.rgb.a + ')';
                }
            } else {
                if (isHex) {
                    return '#' + color.r.toString(16).padStart(2, '0') + color.g.toString(16).padStart(2, '0') + color.b.toString(16).padStart(2, '0');
                } else {
                    return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')';
                }
            }
        } else {
            return isHex ? ColorPicker.rgb2hex(color || '') : color || '';
        }
    }

    /**
     * Convert rgb() or rgba() format to hex format #rrggbb.
     * @param {string} rgb
     * @returns {string}
     */
    static rgb2hex(rgb){
        const m = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        return m && m.length === 4 ? '#' +
            parseInt(m[1],10).toString(16).padStart(2, '0') +
            parseInt(m[2],10).toString(16).padStart(2, '0') +
            parseInt(m[3],10).toString(16).padStart(2, '0') : rgb;
    }

    /**
     * @private
     */
    handleChange = color => {
        this.setState({color});
        this.props.onChange && this.props.onChange(ColorPicker.getColor(color));
    };

    render() {
        const color = ColorPicker.getColor(this.state.color);
        let style = {};

        if (this.state.displayColorPicker && this.props.openAbove) {
            style = {
                top: -241,
            };
        }

        return <div
            style={Object.assign({}, this.props.style || {}, {position: 'relative'})}
            className={ this.props.className || ''}
        >
            <TextField
                disabled={this.props.disabled}
                id="name"
                style={color ? {width: 'calc(100% - 80px)'} : {width: 'calc(100% - 54px)', marginRight: 8}}
                label={this.props.name || 'color'}
                value={color}
                margin="dense"
                classes={{root: this.props.classes.textDense}}
                onChange={e => this.handleChange(e.target.value)}
            />
            {color ? <IconButton
                disabled={this.props.disabled}
                onClick={() => this.handleChange('')}
                size="small"
                className={this.props.classes.delButton}
                style={color ? {} : {opacity: 0, cursor: 'default'}}
            ><IconDelete/></IconButton> : null}
            <div className={this.props.classes.swatch} onClick={() => this.handleClick()}>
                <div className={this.props.classes.color} style={{background: color}} />
            </div>
            { this.state.displayColorPicker && !this.props.disabled ? <div className={this.props.classes.popover} style={style}>
                <div className={this.props.classes.cover} onClick={() => this.handleClose()}/>
                <ChromePicker color={ this.state.color } onChangeComplete={color => this.handleChange(color)} />
            </div> : null }
        </div>
    }
}

ColorPicker.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    openAbove: PropTypes.bool,
};

/** @type {typeof ColorPicker} */
const _export = withStyles(styles)(ColorPicker);
export default _export;
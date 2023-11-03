/**
 * Copyright 2018-2023 Denis Haev (bluefox) <dogafox@gmail.com>
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
 */
import React from 'react';
import { ChromePicker } from 'react-color';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    TextField, Menu, IconButton, Button,
} from '@mui/material';
import { Delete as IconDelete, Close as IconClose } from '@mui/icons-material';

import Utils from './Utils';

const styles = theme => ({
    color: {
        width: 36,
        height: 14,
        borderRadius: 2,
    },
    delButton: {
        // width: 32,
        // height: 32,
        marginTop: 16,
    },
    swatch: {
        marginTop: 16,
        padding: 5,
        background: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
        verticalAlign: 'middle',
    },
    swatchDisabled: {
        opacity: 0.5,
        cursor: 'default',
    },
    popover: {
        // position: 'absolute',
        // zIndex: 2,
        backgroundColor: '#00000000',
        textAlign: 'right',
    },
    popoverList: {
        padding: 0,
    },
    closeButton: {
        backgroundColor: `${theme.palette.background.paper} !important`,
        borderRadius: '0 0 25% 25%',
        '&:hover': {
            backgroundColor: `${theme.palette.secondary.main} !important`,
        },
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
    },
    picker: {
        background: `${theme.palette.background.paper} !important`,
    },
    iconButton: {
        width: 16,
        height: 16,
    },
    button: {
        width: 32,
        height: 32,
        minWidth: 32,
        minHeight: 32,
    },
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
            anchorEl: null,
        };
    }

    /**
     * @private
     */
    handleClick = e => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker, anchorEl: this.state.displayColorPicker ? null : e.currentTarget });
    };

    /**
     * @private
     */
    handleClose = () => {
        this.setState({ displayColorPicker: false, anchorEl: null });
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
                    return `#${color.rgb.r.toString(16).padStart(2, '0')}${color.rgb.g.toString(16).padStart(2, '0')}${color.rgb.b.toString(16).padStart(2, '0')}`;
                }
                return `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
            }
            if (isHex) {
                return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
            }
            return `rgba(${color.r},${color.g},${color.b},${color.a})`;
        }
        return isHex ? ColorPicker.rgb2hex(color || '') : color || '';
    }

    /**
     * Convert rgb() or rgba() format to hex format #rrggbb.
     * @param {string} rgb
     * @returns {string}
     */
    static rgb2hex(rgb) {
        const m = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        const r = parseInt(m[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(m[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(m[3], 10).toString(16).padStart(2, '0');

        return m && m.length === 4 ? `#${r}${g}${b}` : rgb;
    }

    /**
     * @private
     */
    handleChange = color => {
        this.setState({ color }, () =>
            this.props.onChange && this.props.onChange(ColorPicker.getColor(color)));
    };

    /**
     * IF the props are updated from outside, they should override the state
     * @param _prevProps
     * @param prevState
     */
    componentDidUpdate(_prevProps, prevState) {
        const color = ColorPicker.getColor(this.props.color || this.props.value);

        if (color !== prevState.color) {
            this.setState({ color });
        }
    }

    renderCustomPalette() {
        if (!this.props.customPalette) {
            return null;
        }
        return <div style={{ width: '100%', display: 'flex', flexWrap: 'flex' }}>
            {this.props.customPalette.map(color =>
                <Button
                    className={this.props.classes.button}
                    key={color}
                    onClick={() => {
                        this.handleChange(color);
                        setTimeout(() => this.handleClose(), 300);
                    }}
                >
                    <div className={this.props.classes.iconButton} style={{ background: color }} />
                </Button>)}
        </div>;
    }

    render() {
        const style = { ...(this.props.style || {}) };
        style.position = 'relative';
        const { color } = this.state;

        return <div
            style={style}
            className={this.props.className || ''}
        >
            <TextField
                disabled={this.props.disabled}
                variant="standard"
                id="ar_color_picker_name"
                style={color ? { width: 'calc(100% - 80px)' } : { width: 'calc(100% - 56px)', marginRight: 8 }}
                label={this.props.label || this.props.name || 'color'}
                value={color}
                margin="dense"
                classes={{ root: this.props.classes.textDense }}
                onChange={e => this.handleChange(e.target.value)}
            />
            {color ? <IconButton
                disabled={this.props.disabled}
                onClick={() => this.handleChange('')}
                size="small"
                className={this.props.classes.delButton}
                style={color ? {} : { opacity: 0, cursor: 'default' }}
            >
                <IconDelete />
            </IconButton> : null}
            <div
                className={Utils.clsx(this.props.classes.swatch, this.props.disabled && this.props.classes.swatchDisabled)}
                onClick={e => !this.props.disabled && this.handleClick(e)}
                style={{
                    background: color ? undefined : 'transparent',
                    border: color ? undefined : '1px dashed #ccc',
                    boxSizing: 'border-box',
                }}
            >
                <div className={this.props.classes.color} style={{ background: color }} />
            </div>
            {this.state.displayColorPicker && !this.props.disabled ? <Menu
                classes={{ paper: this.props.classes.popover, list: this.props.classes.popoverList }}
                anchorEl={this.state.anchorEl}
                open={!0}
                onClose={() => this.handleClose()}
            >
                <ChromePicker
                    className={this.props.classes.picker}
                    color={this.state.color}
                    onChangeComplete={_color => this.handleChange(_color)}
                    styles={{ picker: { background: '#112233' } }}
                />
                <IconButton className={this.props.classes.closeButton} onClick={() => this.handleClose()}><IconClose /></IconButton>
                {this.renderCustomPalette()}
            </Menu> : null }
        </div>;
    }
}

ColorPicker.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    name: PropTypes.string, // same as label
    style: PropTypes.object,
    className: PropTypes.string,
    customPalette: PropTypes.array,
};

/** @type {typeof ColorPicker} */
const _export = withStyles(styles)(ColorPicker);
export default _export;

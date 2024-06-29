/**
 * Copyright 2018-2024 Denis Haev (bluefox) <dogafox@gmail.com>
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
import React, { Component } from 'react';
import { ChromePicker, type RGBColor } from 'react-color';

import {
    TextField, Menu,
    IconButton, Button,
    Box,
} from '@mui/material';

import {
    Delete as IconDelete,
    Close as IconClose,
} from '@mui/icons-material';

import I18n from '../i18n';

import { IobTheme } from '../types';

const styles: Record<string, any> = {
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
        background: 'background.paper',
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
    closeButton: (theme: IobTheme) => ({
        backgroundColor: `${theme.palette.background.paper} !important`,
        borderRadius: '0 0 25% 25%',
        '&:hover': {
            backgroundColor: `${theme.palette.secondary.main} !important`,
        },
    }),
    cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    textDense: {
        mt: 0,
        mb: 0,
    },
    picker: (theme: IobTheme) => ({
        background: `${theme.palette.background.paper} !important`,
    }),
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
};

interface ColorPickerProps {
    /** Set to true to disable the color picker. */
    disabled?: boolean;
    /** The currently selected color. */
    value?: string;
    /** @deprecated The currently selected color use value */
    color?: string;
    /** The color change callback. */
    onChange: (rgba: string) => void;
    /** Label of the color picker. */
    label?: string;
    /** @deprecated TLabel of the color picker use label */
    name?: string;
    /** Additional styling for this component. */
    style?: React.CSSProperties;
    /** The CSS class name. */
    className?: string;
    /** Open the color picker above the field? */
    // openAbove?: boolean;
    customPalette?: string[];
    noInputField?: boolean;
    barWidth?: number;
    sx?: Record<string, any>;
}

interface ColorPickerState {
    displayColorPicker: boolean;
    color: string | RGBColor;
    anchorEl: HTMLDivElement | null;
}

class ColorPicker extends Component<ColorPickerProps, ColorPickerState> {
    constructor(props: ColorPickerProps) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: this.props.value || this.props.color || '',
            anchorEl: null,
        };
    }

    private handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        this.setState({
            displayColorPicker: !this.state.displayColorPicker,
            anchorEl: this.state.displayColorPicker ? null : e.currentTarget,
        });
    };

    private handleClose = () => {
        this.setState({ displayColorPicker: false, anchorEl: null });
    };

    /**
     * Convert the given color to hex ('#rrggbb') or rgba ('rgba(r,g,b,a)') format.
     * @returns the hex or rgba representation of the given color.
     */
    static getColor(
        color: string | { rgb: RGBColor } | RGBColor,
        /** The returning string should be in hex format */
        isHex?: boolean,
    ): string {
        if (color && typeof color === 'object') {
            const oColor = color as { rgb: RGBColor };
            if (oColor.rgb) {
                if (isHex) {
                    return `#${oColor.rgb.r.toString(16).padStart(2, '0')}${oColor.rgb.g.toString(16).padStart(2, '0')}${oColor.rgb.b.toString(16).padStart(2, '0')}`;
                }
                return `rgba(${oColor.rgb.r},${oColor.rgb.g},${oColor.rgb.b},${oColor.rgb.a})`;
            }
            const rColor = color as RGBColor;
            if (isHex) {
                return `#${rColor.r.toString(16).padStart(2, '0')}${rColor.g.toString(16).padStart(2, '0')}${rColor.b.toString(16).padStart(2, '0')}`;
            }
            return `rgba(${rColor.r},${rColor.g},${rColor.b},${rColor.a})`;
        }
        return isHex ? ColorPicker.rgb2hex(color as string || '') : color as string || '';
    }

    /**
     * Convert rgb() or rgba() format to hex format #rrggbb.
     */
    static rgb2hex(rgb: string): string {
        const m = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        if (m) {
            const r = parseInt(m[1], 10).toString(16).padStart(2, '0');
            const g = parseInt(m[2], 10).toString(16).padStart(2, '0');
            const b = parseInt(m[3], 10).toString(16).padStart(2, '0');

            return m?.length === 4 ? `#${r}${g}${b}` : rgb;
        }
        return rgb;
    }

    private handleChange = (color: string | RGBColor) => {
        this.setState({ color }, () =>
            this.props.onChange && this.props.onChange(ColorPicker.getColor(color)));
    };

    /**
     * IF the props are updated from outside, they should override the state
     */
    componentDidUpdate(_prevProps: ColorPickerProps, prevState: ColorPickerState) {
        const color = ColorPicker.getColor(this.props.color || this.props.value || '');

        if (color !== prevState.color) {
            this.setState({ color });
        }
    }

    renderCustomPalette() {
        if (!this.props.customPalette) {
            return null;
        }
        return <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
            {this.props.customPalette.map(color => <Button
                style={styles.button}
                key={color}
                onClick={() => {
                    this.handleChange(color);
                    setTimeout(() => this.handleClose(), 300);
                }}
            >
                <div
                    style={{ ...styles.iconButton, background: color }}
                />
            </Button>)}
        </div>;
    }

    render() {
        const style = { ...(this.props.style || {}) };
        style.position = 'relative';
        const { color } = this.state;

        return <Box
            component="div"
            style={style}
            sx={this.props.sx || undefined}
            className={this.props.className || ''}
        >
            {this.props.noInputField ? null : <TextField
                disabled={this.props.disabled}
                variant="standard"
                id="ar_color_picker_name"
                label={this.props.label || this.props.name || 'color'}
                value={color || ''}
                margin="dense"
                sx={{
                    '&.MuiFormControl-root': styles.textDense,
                    width: color ? 'calc(100% - 80px)' : 'calc(100% - 56px)',
                    mr: color ? undefined: 1,
                }}
                onChange={e => this.handleChange(e.target.value)}
            />}
            {!this.props.noInputField && color ? <IconButton
                disabled={this.props.disabled}
                onClick={() => this.handleChange('')}
                size="small"
                style={{ ...styles.delButton, ...(color ? undefined : { opacity: 0, cursor: 'default' }) }}
            >
                <IconDelete />
            </IconButton> : null}
            <div
                onClick={e => !this.props.disabled && this.handleClick(e)}
                title={I18n.t('ra_Select color')}
                style={{
                    ...styles.swatch,
                    ...(this.props.disabled ? styles.swatchDisabled : undefined),
                    background: color ? undefined : 'transparent',
                    border: color ? undefined : '1px dashed #ccc',
                    boxSizing: 'border-box',
                    marginTop: this.props.noInputField ? 0 : undefined,
                }}
            >
                <div
                    style={{
                        ...styles.color,
                        background: ColorPicker.getColor(color),
                        width: this.props.noInputField ? (this.props.barWidth || 16) : (this.props.barWidth || undefined),
                    }}
                />
            </div>
            {this.state.displayColorPicker && !this.props.disabled ? <Menu
                classes={{ paper: styles.popover, list: styles.popoverList }}
                anchorEl={this.state.anchorEl}
                open={!0}
                onClose={() => this.handleClose()}
            >
                <ChromePicker
                    // todo
                    // sx={styles.picker}
                    color={this.state.color || undefined}
                    onChangeComplete={_color => this.handleChange(_color.rgb)}
                    styles={{
                        default: {
                            picker: {
                                backgroundColor: '#112233',
                            },
                        },
                    }}
                />
                {color && this.props.noInputField ? <IconButton sx={styles.closeButton} onClick={() => this.handleChange('')}>
                    <IconDelete />
                </IconButton> : null}
                <IconButton sx={styles.closeButton} onClick={() => this.handleClose()}>
                    <IconClose />
                </IconButton>
                {this.renderCustomPalette()}
            </Menu> : null}
        </Box>;
    }
}

export default ColorPicker;

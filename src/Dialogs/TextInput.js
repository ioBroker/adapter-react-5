import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

import { Close as IconClose, Check as IconCheck } from '@mui/icons-material';

import I18n from '../i18n';

import withWidth from '../Components/withWidth';

/**
 * @typedef {object} TextInputProps
 * @property {(text: string | null) => void} onClose The dialog close callback.
 * @property {string} titleText The title text.
 * @property {string} [promptText] Prompt text (default: empty).
 * @property {string} [labelText] Label text (default: empty).
 * @property {string} cancelText The text of the cancel button.
 * @property {string} applyText The text of the apply button.
 * @property {(text: string) => string} [verify] The verification callback. Return a non-empty string if there was an error.
 * @property {(text: string) => string} [rule] The text replacement callback.
 * @property {'text' | 'number' | 'password' | 'email'} [type] The type of the textbox (default: text).
 * @property {string} [input] The input when opening the dialog.
 *
 * @extends {React.Component<TextInputProps>}
 */
class TextInput extends React.Component {
    /**
     * @param {Readonly<TextInputProps>} props
     */
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.input || this.props.value || '', // input is deprecated
            error: '',
        };
    }

    render() {
        return <Dialog
            open={!0}
            onClose={() => this.props.onClose(null)}
            aria-labelledby="form-dialog-title"
            fullWidth={this.props.fullWidth !== undefined ? this.props.fullWidth : false}
        >
            <DialogTitle id="form-dialog-title">{this.props.titleText}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {this.props.promptText}
                </DialogContentText>
                <TextField
                    variant="standard"
                    autoFocus
                    margin="dense"
                    error={!!this.state.error}
                    title={this.state.error}
                    value={this.state.text}
                    label={this.props.labelText || ''}
                    type={this.props.type || 'text'}
                    onKeyPress={e => e.charCode === 13 && this.state.text && this.props.onClose(this.state.text)}
                    onChange={e => {
                        let error = '';
                        if (this.props.verify) {
                            error = !this.props.verify(e.target.value);
                        }

                        if (this.props.rule) {
                            this.setState({ text: this.props.rule(e.target.value), error });
                        } else {
                            this.setState({ text: e.target.value, error });
                        }
                    }}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={!this.state.text || this.state.error}
                    onClick={() => this.props.onClose(this.state.text)}
                    color="primary"
                    startIcon={<IconCheck />}
                >
                    {this.props.applyText || I18n.t('ra_Ok')}
                </Button>
                <Button
                    color="grey"
                    variant="contained"
                    onClick={() => this.props.onClose(null)}
                    startIcon={<IconClose />}
                >
                    {this.props.cancelText || I18n.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

TextInput.propTypes = {
    fullWidth: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    titleText: PropTypes.string.isRequired,
    promptText: PropTypes.string,
    labelText: PropTypes.string,
    cancelText: PropTypes.string,
    applyText: PropTypes.string,
    verify: PropTypes.func,
    type: PropTypes.string, // text, number, password, email
    value: PropTypes.string,
};

/** @type {typeof TextInput} */
const _export = withWidth()(TextInput);
export default _export;

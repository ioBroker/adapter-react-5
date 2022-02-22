import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import IconClose from '@mui/icons-material/Close';
import IconCheck from '@mui/icons-material/Check';

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

const styles = {

};

/**
 * @typedef {object} TextInputProps
 * @property {string} [key] The key to identify this component.
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
            text: this.props.input || '',
            error: ''
        }
    }
    render() {
        return <Dialog open={true} onClose={() => this.props.onClose(null)} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{this.props.titleText}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {this.props.promptText}
                </DialogContentText>
                <TextField
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
                            this.setState({text: this.props.rule(e.target.value), error});
                        } else {
                            this.setState({text: e.target.value, error});
                        }
                    }}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={!this.state.text || this.state.error} onClick={() => this.props.onClose(this.state.text)}
                        color="primary" startIcon={<IconCheck />}>{this.props.applyText}</Button>
                <Button variant="contained" onClick={() => this.props.onClose(null)} startIcon={<IconClose />}>{this.props.cancelText}</Button>
            </DialogActions>
        </Dialog>;
    }
}

TextInput.propTypes = {
    onClose: PropTypes.func.isRequired,
    titleText: PropTypes.string.isRequired,
    promptText: PropTypes.string,
    labelText: PropTypes.string,
    cancelText: PropTypes.string.isRequired,
    applyText: PropTypes.string.isRequired,
    verify: PropTypes.func,
    replace: PropTypes.func,
    type: PropTypes.string, // text, number, password, email
    input: PropTypes.string,
};

/** @type {typeof TextInput} */
const _export = withWidth()(withStyles(styles)(TextInput));
export default _export;
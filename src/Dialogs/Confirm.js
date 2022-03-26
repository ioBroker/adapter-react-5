/**
 * Copyright 2019-2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/

// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import IconCheck from '@mui/icons-material/Check';
import IconClose from '@mui/icons-material/Close';

import I18n from '../i18n';

const styles = {
    suppress: {
        fontSize: 12,
    },
    suppressRoot: {
        marginTop: 16
    }
};

/**
 * @typedef {object} DialogConfirmProps
 * @property {string} [key] The key to identify this component.
 * @property {string} [title] The dialog title; default: Are you sure? (translated)
 * @property {string} text The dialog text.
 * @property {string} [ok] The ok button text; default: OK (translated)
 * @property {string} [cancel] The cancel button text; default: Cancel (translated)
 * @property {string} [suppressQuestionMinutes] interval in minutes for which the confirm dialog will be suppressed if activated.
 * @property {string} [suppressText] The suppress checkbox text; default: Suppress question for next %s minutes (translated)
 * @property {string} [dialogName] Name of the dialog. Used only with suppressQuestionMinutes to store the user choice
 * @property {(ok: boolean) => void} [onClose] Close handler.
 *
 * @extends {React.Component<DialogConfirmProps>}
 */
class DialogConfirm extends React.Component {
    constructor(props) {
        super(props);

        if (!this.props.dialogName && this.props.suppressQuestionMinutes) {
            throw new Error('dialogName required if suppressQuestionMinutes used');
        }
        let suppress = false;

        if (this.props.suppressQuestionMinutes) {
            suppress = parseInt(window.localStorage.getItem(this.props.dialogName), 10) || 0;

            if (!suppress) {
                suppress = false;
            } else if (Date.now() > suppress) {
                window.localStorage.removeItem(this.props.dialogName);
                suppress = false;
            }
        }

        this.state = {
            suppress,
        };
    }

    handleOk() {
        if (this.state.suppress) {
            window.localStorage.setItem(this.props.dialogName, Date.now() + this.props.suppressQuestionMinutes * 60000);
        }
        this.props.onClose && this.props.onClose(true);
    };

    handleCancel() {
        this.props.onClose && this.props.onClose(false);
    };

    render() {
        if (typeof this.state.suppress === 'number') {
            setTimeout(() => this.props.onClose && this.props.onClose(true), 100);
            return null;
        }

        return <Dialog
            open={true}
            maxWidth="md"
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    this.handleCancel()
                }
            }}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">{this.props.title || I18n.t('ra_Are you sure?')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {this.props.icon || null}
                    {this.props.text}
                    {this.props.suppressQuestionMinutes ? <br/> : null}
                    {this.props.suppressQuestionMinutes ?
                        <FormControlLabel
                            classes={{label: this.props.classes.suppress, root: this.props.classes.suppressRoot}}
                            control={<Checkbox checked={!!this.state.suppress} onChange={() => this.setState({suppress: !this.state.suppress})} />}
                            label={this.props.suppressText || I18n.t('ra_Suppress question for next %s minutes', this.props.suppressQuestionMinutes)}
                        /> :
                        null}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} color="primary" autoFocus startIcon={<IconCheck />}>{this.props.ok || I18n.t('ra_Ok')}</Button>
                <Button variant="contained" onClick={() => this.handleCancel()} color="grey" startIcon={<IconClose />}>{this.props.cancel || I18n.t('ra_Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogConfirm.propTypes = {
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    ok: PropTypes.string,
    cancel: PropTypes.string,
    icon: PropTypes.object,
    suppressQuestionMinutes: PropTypes.number,
    suppressText: PropTypes.string,
    dialogName: PropTypes.string,
};

const _export = withStyles(styles)(DialogConfirm);
export default _export;
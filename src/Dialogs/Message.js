/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/

// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import IconClose from '@mui/icons-material/Close';

import I18n from '../i18n';

/**
 * @typedef {object} DialogMessageProps
 * @property {string} [key] The key to identify this component.
 * @property {string} [title] The dialog title; default: Message (translated)
 * @property {string} text The dialog text.
 * @property {() => void} [onClose] Close handler.
 *
 * @extends {React.Component<DialogMessageProps>}
 */
class DialogMessage extends React.Component {

    handleOk() {
        this.props.onClose && this.props.onClose();
    };

    render() {
        return <Dialog
            open={true}
            maxWidth="sm"
            fullWidth={true}
            onClose={() => this.handleOk()}
            aria-labelledby="message-dialog-title"
            aria-describedby="message-dialog-description"
        >
            <DialogTitle id="message-dialog-title">{this.props.title || I18n.t('ra_Message')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="message-dialog-description">
                    {this.props.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} color="primary" autoFocus startIcon={<IconClose />}>{I18n.t('ra_Close')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogMessage.propTypes = {
    onClose: PropTypes.func,
    title: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.object
};

export default DialogMessage;

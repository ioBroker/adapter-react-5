/**
 * Copyright 2018-2022 bluefox <dogafox@gmail.com>
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
 * @property {string} [title] The dialog title; default: Message (translated)
 * @property {string} text The dialog text.
 * @property {() => void} [onClose] Close handler.
 *
 * @extends {React.Component<DialogMessageProps>}
 */
class DialogMessage extends React.Component {
    handleOk() {
        this.props.onClose && this.props.onClose();
    }

    render() {
        return <Dialog
            open={!0}
            maxWidth="sm"
            fullWidth={this.props.fullWidth !== undefined ? this.props.fullWidth : true}
            onClose={() => this.handleOk()}
            aria-labelledby="ar_dialog_message_title"
            aria-describedby="ar_dialog_message_description"
        >
            <DialogTitle id="ar_dialog_message_title">{this.props.title || I18n.t('ra_Message')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="ar_dialog_message_description">
                    <span style={{ marginRight: this.props.icon ? 8 : 0 }}>
                        {this.props.icon || null}
                    </span>
                    {this.props.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button id="ar_dialog_message_ok" variant="contained" onClick={() => this.handleOk()} color="primary" autoFocus startIcon={<IconClose />}>{this.props.ok || I18n.t('ra_Close')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogMessage.propTypes = {
    fullWidth: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
    text: PropTypes.string,
    ok: PropTypes.string,
    icon: PropTypes.object,
};

export default DialogMessage;

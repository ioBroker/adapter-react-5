/**
 * Copyright 2018-2023 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import PropTypes from 'prop-types';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

import { Check as IconCheck } from '@mui/icons-material';

import I18n from '../i18n';

/**
 * @typedef {object} DialogErrorProps
 * @property {string} [title] The dialog title; default: Error (translated)
 * @property {string | JSX.Element} text The dialog text.
 * @property {() => void} [onClose] Close handler.
 * @property {{titleBackground: string; titleColor: string}} classes The styling class names.
 *
 * @extends {React.Component<DialogErrorProps>}
 */
class DialogError extends React.Component {
    handleOk() {
        this.props.onClose && this.props.onClose();
    }

    render() {
        return <Dialog
            open={!0}
            maxWidth="sm"
            fullWidth={this.props.fullWidth !== undefined ? this.props.fullWidth : true}
            onClose={() => this.handleOk()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="ar_alert_dialog_title">
                {this.props.title || I18n.t('ra_Error')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="ar_alert_dialog_description">
                    {this.props.text || I18n.t('ra_Unknown error!')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    id="ar_dialog_error_ok"
                    variant="contained"
                    onClick={() => this.handleOk()}
                    color="primary"
                    autoFocus
                    startIcon={<IconCheck />}
                >
                    {I18n.t('ra_Ok')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogError.propTypes = {
    onClose: PropTypes.func.isRequired,
    fullWidth: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]),
};

/** @type {typeof DialogError} */
const _export = DialogError;
export default _export;

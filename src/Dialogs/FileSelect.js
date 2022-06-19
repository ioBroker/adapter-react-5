/**
 * Copyright 2022 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import IconCancel from '@mui/icons-material/Cancel';
import IconOk from '@mui/icons-material/Check';

import I18n from '../i18n';
import Utils from '../Components/Utils';
import FileBrowser from '../Components/FileBrowser';

const styles = theme => ({
    headerID: {
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    dialog: {
        height: '95%'
    },
    dialogMobile: {
        padding: 4,
        width: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100% - 16px)',
        height: '100%'
    },
    content: {
        height: '100%',
        overflow: 'hidden'
    },
    contentMobile: {
        padding: '8px 4px'
    },
    titleRoot: {
        whiteSpace: 'nowrap',
        width: 'calc(100% - 72px)',
        overflow: 'hidden',
        display: 'inline-block',
        textOverflow: 'ellipsis',
    }
});

/**
 * @typedef {object} FileSelectDialogProps
 * @property {string} [dialogName] The internal name of the dialog; default: "default"
 * @property {string} [title] The dialog title; default: Please select object ID... (translated)
 * @property {string} [imagePrefix] Prefix (default: '.')
 * @property {boolean} [dialogName] PropTypes.string, // where to store settings in localStorage
 * @property {boolean} [selected] Pre-selected file
 * @property {() => void} onClose Close handler that is always called when the dialog is closed.
 * @property {(selected: string | undefined) => void} onOk Handler that is called when the user presses OK.
 * @property {string} [ok] The ok button text; default: OK (translated)
 * @property {string} [cancel] The cancel button text; default: Cancel (translated)
 * @property {boolean} [socket] Socket class (required)
 * @property {boolean} [allowUpload] If download of files enabled
 * @property {boolean} [allowDownload] If download of files enabled
 * @property {boolean} [allowCreateFolder] If creation of folders enabled
 * @property {boolean} [allowDelete] If creation of folders enabled
 * @property {boolean} [allowView] if tile view enabled (default true)
 * @property {boolean} [showToolbar] Show toolbar (default true)
 * @property {array} [limitPath] Limit file browser to one specific objectID of type meta and following path (like vis.0/main)
 * @property {array} [filterFiles] like `['png', 'svg', 'bmp', 'jpg', 'jpeg']`
 * @property {string} [filterByType] images, code, txt, audio, video
 * @property {bool} [selectOnlyFolders] allow only folders selection
 *
 * @extends {React.Component<FileSelectDialogProps>}
 */
class DialogFileSelect extends React.Component {
    /**
     * @param {FileSelectDialogProps} props
     */
    constructor(props) {
        super(props);
        this.dialogName = this.props.dialogName || 'default';
        this.dialogName = 'FileSelect.' + this.dialogName;

        this.filters = (window._localStorage || window.localStorage).getItem(this.dialogName) || '{}';

        try {
            this.filters = JSON.parse(this.filters);
        } catch (e) {
            this.filters = {};
        }

        this.state =  {
            selected: this.props.selected || '',
            isFolder: false,
            name: '',
            isMobile: window.innerWidth < 800
        };
    }

    handleCancel() {
        this.props.onClose();
    };

    handleOk() {
        this.props.onOk(this.state.selected || '');
        this.props.onClose();
    };

    render() {
        let title;
        if (this.state.name || this.state.selected.length) {
            title = [
                <span key="selected">{ I18n.t('ra_Selected') } </span>,
                <span key="id" className={ this.props.classes.headerID }>{this.state.selected}</span>
            ];
        } else {
            title = this.props.title || I18n.t('ra_Please select file...');
        }

        return <Dialog
            onClose={() => {}}
            maxWidth={false}
            classes={{ paper: Utils.clsx(this.props.classes.dialog, this.props.classes.dialogMobile) }}
            fullWidth={true}
            open={true}
            aria-labelledby="file-dialog-title"
        >
            <DialogTitle id="file-dialog-title" classes={{ root: this.props.classes.titleRoot }}>{ title }</DialogTitle>
            <DialogContent className={Utils.clsx(this.props.classes.content, this.props.classes.contentMobile)}>
                <FileBrowser
                    ready
                    imagePrefix={this.props.imagePrefix}
                    allowUpload={!!this.props.allowUpload}
                    allowDownload={this.props.allowDownload !== false}
                    allowCreateFolder={!!this.props.allowCreateFolder}
                    allowDelete={!!this.props.allowDelete}
                    showViewTypeButton={this.props.allowView !== false}
                    showToolbar={this.props.showToolbar !== false}
                    limitPath={this.props.limitPath}
                    filterFiles={this.props.filterFiles}
                    filterByType={this.props.filterByType}
                    selected={this.props.selected}
                    onSelect={(selected, isDoubleClick, isFolder) => {
                        this.setState({ selected, isFolder }, () =>
                            isDoubleClick && ((this.props.selectOnlyFolders && isFolder) || (!this.props.selectOnlyFolders && !isFolder)) && this.handleOk());
                    }}
                    t={I18n.t}
                    lang={I18n.getLanguage()}
                    socket={this.props.socket}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={ () => this.handleOk() } startIcon={<IconOk />} disabled={ !this.state.selected || ((this.props.selectOnlyFolders && !this.state.isFolder) || (!this.props.selectOnlyFolders && this.state.isFolder)) } color="primary">{ this.props.ok || I18n.t('ra_Ok') }</Button>
                <Button color="grey" variant="contained" onClick={ () => this.handleCancel() } startIcon={<IconCancel />}>{ this.props.cancel || I18n.t('ra_Cancel') }</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogFileSelect.propTypes = {
    imagePrefix: PropTypes.string,
    dialogName: PropTypes.string, // where to store settings in localStorage
    selected: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    ok: PropTypes.string,
    cancel: PropTypes.string,
    socket: PropTypes.object.isRequired,
    allowUpload: PropTypes.bool,
    allowDownload: PropTypes.bool,
    allowCreateFolder: PropTypes.bool,
    allowDelete: PropTypes.bool,
    allowView: PropTypes.bool,
    showToolbar: PropTypes.bool,
    objectID: PropTypes.string,
    filterFiles: PropTypes.arrayOf(PropTypes.string),
    filterByType: PropTypes.string,
    limitPath: PropTypes.string,
    selectOnlyFolders: PropTypes.bool,
};

/** @type {typeof DialogFileSelect} */
const _export = withStyles(styles)(DialogFileSelect);
export default _export;

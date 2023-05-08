/*
 * Copyright 2022-2023 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 */
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

import Utils from '../Components/Utils';
import I18n from '../i18n';
import FileBrowser from '../Components/FileBrowser';

const styles = () => ({
    headerID: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    dialog: {
        height: '95%',
    },
    dialogMobile: {
        padding: 4,
        width: '100%',
        maxWidth: '100%',
        maxHeight: 'calc(100% - 16px)',
        height: '100%',
    },
    content: {
        height: '100%',
        overflow: 'hidden',
    },
    contentMobile: {
        padding: '8px 4px',
    },
    titleRoot: {
        whiteSpace: 'nowrap',
        width: 'calc(100% - 72px)',
        overflow: 'hidden',
        display: 'inline-block',
        textOverflow: 'ellipsis',
    },
});

/**
 * @typedef {object} DialogSelectFileProps
 * @property {boolean} [dialogName] PropTypes.string, // where to store settings in localStorage * @property {string} [title] The dialog title; default: Please select object ID... (translated)
 * @property {boolean} [multiSelect] Set to true to allow the selection of multiple IDs.
 * @property {string} [imagePrefix] Prefix (default: '.')
 * @property {boolean} [showExpertButton] Show the expert button?
 * @property {ioBroker.Languages} [lang] The language.
 * @property {import('../Connection').default} socket The socket connection.
 * @property {string} [themeName] Theme name.
 * @property {string} [themeType] Theme type.
 * @property {string | string[]} [selected] The selected IDs.
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
 * @property {bool} [selectOnlyFolders] allow only folder's selection * @property {() => void} onClose Close handler that is always called when the dialog is closed.
 * @property {(selected: string | string[] | undefined) => void} onOk Handler that is called when the user presses OK or by double click.
 * @property {{headerID: string; dialog: string; content: string}} [classes] The styling class names.
 *
 * @extends {React.Component<DialogSelectIDProps>}
 */
class DialogSelectFile extends React.Component {
    /**
     * @param {DialogSelectFileProps} props
     */
    constructor(props) {
        super(props);
        this.dialogName = this.props.dialogName || 'default';
        this.dialogName = `SelectFile.${this.dialogName}`;

        this.filters = (window._localStorage || window.localStorage).getItem(this.dialogName) || '{}';

        try {
            this.filters = JSON.parse(this.filters);
        } catch (e) {
            this.filters = {};
        }

        if (props.filters) {
            this.filters = { ...this.filters, ...props.filters };
        }

        let selected = this.props.selected || [];
        if (typeof selected !== 'object') {
            selected = [selected];
        } else {
            selected = [...selected];
        }
        selected = selected.filter(id => id);

        this.state =  {
            selected,
        };
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onOk(this.props.multiSelect || !Array.isArray(this.state.selected) ? this.state.selected : this.state.selected[0] || '');
        this.props.onClose();
    }

    render() {
        let title;
        if (this.state.selected.length) {
            if (!Array.isArray(this.state.selected) || this.state.selected.length === 1) {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" className={this.props.classes.headerID}>
                        {this.state.selected}
                    </span>,
                ];
            } else {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" className={this.props.classes.headerID}>
                        {I18n.t('%s items', this.state.selected.length)}
                    </span>,
                ];
            }
        } else {
            title = this.props.title || I18n.t('ra_Please select file...');
        }

        return <Dialog
            onClose={() => {}}
            maxWidth={false}
            classes={{ paper: Utils.clsx(this.props.classes.dialog, this.props.classes.dialogMobile) }}
            fullWidth
            open={!0}
            aria-labelledby="ar_dialog_selectfile_title"
        >
            <DialogTitle id="ar_dialog_selectfile_title" classes={{ root: this.props.classes.titleRoot }}>{title}</DialogTitle>
            <DialogContent className={Utils.clsx(this.props.classes.content, this.props.classes.contentMobile)}>
                <FileBrowser
                    ready
                    imagePrefix={this.props.imagePrefix || this.props.prefix || '../'} // prefix is for back compatibility
                    allowUpload={!!this.props.allowUpload}
                    allowDownload={this.props.allowDownload !== false}
                    allowCreateFolder={!!this.props.allowCreateFolder}
                    allowDelete={!!this.props.allowDelete}
                    allowView={this.props.allowView !== false}
                    showViewTypeButton={this.props.showViewTypeButton !== false}
                    showToolbar={this.props.showToolbar !== false}
                    limitPath={this.props.limitPath}
                    filterFiles={this.props.filterFiles}
                    filterByType={this.props.filterByType}
                    selected={this.props.selected}
                    onSelect={(selected, isDoubleClick, isFolder) => {
                        this.setState({ selected }, () =>
                            isDoubleClick && (!this.props.selectOnlyFolders || isFolder) && this.handleOk());
                    }}
                    t={this.props.t || I18n.t}
                    lang={this.props.lang || I18n.getLanguage()}
                    socket={this.props.socket}
                    themeType={this.props.themeType}
                    themeName={this.props.themeName}
                    showExpertButton={this.props.showExpertButton}
                    expertMode={this.props.expertMode}
                    showTypeSelector={this.props.showTypeSelector}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} startIcon={<IconOk />} disabled={!this.state.selected.length} color="primary">{this.props.ok || I18n.t('ra_Ok')}</Button>
                <Button color="grey" variant="contained" onClick={() => this.handleCancel()} startIcon={<IconCancel />}>{this.props.cancel || I18n.t('ra_Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogSelectFile.propTypes = {
    imagePrefix: PropTypes.string,
    dialogName: PropTypes.string, // where to store settings in localStorage
    selected: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array, // not implemented
    ]),
    classes: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    ok: PropTypes.string,
    cancel: PropTypes.string,
    socket: PropTypes.object.isRequired,
    allowUpload: PropTypes.bool,
    allowDownload: PropTypes.bool,
    allowCreateFolder: PropTypes.bool,
    allowDelete: PropTypes.bool,
    allowView: PropTypes.bool, // allow view of files
    showToolbar: PropTypes.bool,
    filterFiles: PropTypes.arrayOf(PropTypes.string), // array of extensions ['jpg', 'png]
    filterByType: PropTypes.string, // e.g. images
    limitPath: PropTypes.string,
    selectOnlyFolders: PropTypes.bool,
    showViewTypeButton: PropTypes.bool, // Allow switch views Table<=>Rows
    showTypeSelector: PropTypes.bool, // If type selector should be shown

    title: PropTypes.string,
    lang: PropTypes.string,

    themeName: PropTypes.string,
    themeType: PropTypes.string,
    showExpertButton: PropTypes.bool,
    expertMode: PropTypes.bool, // force expert mode
    multiSelect: PropTypes.bool, // not implemented
};

/** @type {typeof DialogSelectFile} */
const _export = withStyles(styles)(DialogSelectFile);
export default _export;

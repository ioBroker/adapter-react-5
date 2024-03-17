/*
 * Copyright 2022-2024 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 */
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import { withStyles } from '@mui/styles';

import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
} from '@mui/material';

import {
    Cancel as IconCancel,
    Check as IconOk,
} from '@mui/icons-material';

import type { Connection } from '@iobroker/socket-client';

import Utils from '../Components/Utils';
import I18n from '../i18n';
import FileBrowser from '../Components/FileBrowser';

const styles: Record<string, any> = {
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
};

interface DialogSelectFileProps {
    /** where to store settings in localStorage * @property {string} [title] The dialog title; default: Please select object ID... (translated) */
    dialogName?: string;
    /** The dialog title; default: Please select object ID... (translated) */
    title?: string;
    /** Set to true to allow the selection of multiple IDs. */
    multiSelect?: boolean;
    /** Image prefix. Normally, admin has '../..' and the web has '../' */
    imagePrefix?: string; // Prefix (default: '.')
    /** @deprectaed Image prefix */
    prefix?: string;
    /** Show the expert button? */
    showExpertButton?: boolean;
    /** Language */
    lang?: ioBroker.Languages;
    /** Socket class */
    socket: Connection;
    /** Theme name. */
    themeName?: string;
    /** Theme type. */
    themeType?: 'dark' | 'light';
    /** The selected IDs. */
    selected?: string | string[];
    /** The ok button text; default: OK (translated) */
    ok?: string;
    /** The cancel button text; default: Cancel (translated) */
    cancel?: string;
    /** If download of files enabled */
    allowUpload?: boolean;
    /** If download of files enabled */
    allowDownload?: boolean;
    /** If creation of folders enabled */
    allowCreateFolder?: boolean;
    /** If creation of folders enabled */
    allowDelete?: boolean;
    /** if tile view enabled (default true) */
    allowView?: boolean;
    /** Show toolbar (default true) */
    showToolbar?: boolean;
    /** Limit file browser to one specific objectID of type meta and the following path (like vis.0/main) */
    limitPath?: string;
    /** like `['png', 'svg', 'bmp', 'jpg', 'jpeg', 'gif']` */
    filterFiles?: string[];
    /** images, code, txt, audio, video */
    filterByType?: 'images' | 'code' | 'txt';
    /** allow only folder's selection */
    selectOnlyFolders?: boolean;
    /** Close handler that is always called when the dialog is closed. */
    onClose: () => void;
    /** Handler that is called when the user presses OK or by double click. */
    onOk: (selected: string | string[] | undefined) => void;
    /** The styling class names. */
    classes: Record<string, string>;
    filters?: Record<string, string>;
    /** Allow switch views Table<=>Rows */
    showViewTypeButton?: boolean;
     /** If type selector should be shown */
    showTypeSelector?: boolean;
     /** If defined, allow selecting only files from this folder */
    restrictToFolder?: string;
     /** If restrictToFolder defined, allow selecting files outside of this folder */
    allowNonRestricted?: boolean;
    /** force expert mode */
    expertMode?: boolean;
    /** Translate function - optional */
    t?: (text: string, ...args: any[]) => string;
}

interface DialogSelectFileState {
    selected: string[];
}

class DialogSelectFile extends React.Component<DialogSelectFileProps, DialogSelectFileState> {
    private readonly dialogName: string;

    private readonly filters: Record<string, string>;

    constructor(props: DialogSelectFileProps) {
        super(props);
        this.dialogName = this.props.dialogName || 'default';
        this.dialogName = `SelectFile.${this.dialogName}`;

        const filters: string = ((window as any)._localStorage || window.localStorage).getItem(this.dialogName) || '{}';

        try {
            this.filters = JSON.parse(filters);
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
                    restrictToFolder={this.props.restrictToFolder}
                    allowNonRestricted={this.props.allowNonRestricted}
                    onSelect={(selected: string | string[], isDoubleClick?: boolean, isFolder?: boolean) => {
                        this.setState({ selected: Array.isArray(selected) ? selected : [selected] }, () =>
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
                <Button
                    variant="contained"
                    onClick={() => this.handleOk()}
                    startIcon={<IconOk />}
                    disabled={!this.state.selected.length}
                    color="primary"
                >
                    {this.props.ok || I18n.t('ra_Ok')}
                </Button>
                <Button
                    // @ts-expect-error grey is allowed color
                    color="grey"
                    variant="contained"
                    onClick={() => this.handleCancel()}
                    startIcon={<IconCancel />}
                >
                    {this.props.cancel || I18n.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default withStyles(styles)(DialogSelectFile);

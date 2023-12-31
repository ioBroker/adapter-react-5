/**
 * Copyright 2018-2023 Denis Haev (bluefox) <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React, { Component } from 'react';

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

import type Connection from '../Connection';

import I18n from '../i18n';
import ObjectBrowser from '../Components/ObjectBrowser';
import { ObjectBrowserColumn, ObjectBrowserCustomFilter, ObjectBrowserType } from '../Components/types';

interface SelectIDFilters {
    id?: string;
    name?: string;
    room?: string;
    func?: string;
    role?: string;
    type?: string;
    custom?: string;
}

interface DialogSelectIDProps {
    /* The internal name of the dialog; default: "default". Used to store settings in local storage */
    dialogName?: string;
    /* The dialog title; default: Please select object ID... (translated) */
    title?: string;
    /* Set to true to allow the selection of multiple IDs. */
    multiSelect?: boolean;
    /* Show folders before any leaves. */
    foldersFirst?: boolean;
    /* Path prefix for images (default: '.') */
    imagePrefix?: string;
    /* @deprecated: same as imagePrefix */
    prefix?: string;
    /* Show the expert button */
    showExpertButton?: boolean;
    /* Force expert mode */
    expertMode?: boolean;
    /* optional ['name', 'type', 'role', 'room', 'func', 'val', 'buttons'] */
    columns?: ObjectBrowserColumn[];
    /*  Object types to show; default: 'state' only */
    types?: ObjectBrowserType | ObjectBrowserType[];
    /* The language. */
    lang?: ioBroker.Languages;
    /* The socket connection. */
    socket: Connection;
    /* Can't objects be edited? (default: true) */
    notEditable?: boolean;
    /* Theme name. */
    themeName?: string;
    /* Theme type: dark or light */
    themeType?: string;
    /* Custom filter. */
    customFilter?: ObjectBrowserCustomFilter;
    /* The selected IDs. */
    selected?: string | string[];
    /* The ok button text; default: OK (translated) */
    ok?: string;
    /* The cancel button text; default: Cancel (translated) */
    cancel?: string;
    /* Close handler that is always called when the dialog is closed. */
    onClose: () => void;
    /* Handler that is called when the user presses OK. */
    onOk: (selected: string | string[] | undefined, name: string) => void;
    classes: Record<string, string>;
    /* Function to filter out all unnecessary objects. Can be string or function.
       It cannot be used together with "types".
       Example for function: `obj => obj.common && obj.common.type === 'boolean'` to show only boolean states
       In case of string, it must look like `obj.common && obj.common.type === 'boolean'` */
    filterFunc?: string | ((obj: ioBroker.Object) => boolean);
    /* predefined filter fields, like {"id":"","name":"","room":"","func":"","role":"level","type":"","custom":""} */
    filters: SelectIDFilters;
    /* Show elements only of this root ID */
    root?: string;
}

interface DialogSelectIDState {
    selected: string[];
    name: string;
}

class DialogSelectID extends Component<DialogSelectIDProps, DialogSelectIDState> {
    private readonly dialogName: string;

    private filters: Record<string, any>;

    private readonly filterFunc?: (obj: ioBroker.Object) => boolean;

    constructor(props: DialogSelectIDProps) {
        super(props);
        this.dialogName = this.props.dialogName || 'default';
        this.dialogName = `SelectID.${this.dialogName}`;

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
        if (!Array.isArray(selected)) {
            selected = [selected];
        }
        selected = selected.filter(id => id);

        if (props.filterFunc) {
            if (typeof props.filterFunc === 'string') {
                try {
                    this.filterFunc = new Function('obj', props.filterFunc) as (obj: ioBroker.Object) => boolean;
                } catch (e) {
                    console.error(`Cannot parse filter function: "obj => ${props.filterFunc}"`);
                    this.filterFunc = undefined;
                }
            } else {
                this.filterFunc = props.filterFunc;
            }
        }

        this.state =  {
            selected,
            name: '',
        };
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onOk(this.props.multiSelect ? this.state.selected : this.state.selected[0] || '', this.state.name);
        this.props.onClose();
    }

    render() {
        let title;
        if (this.state.name || this.state.selected.length) {
            if (this.state.selected.length === 1) {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {(this.state.name || this.state.selected) + (this.state.name ? ` [${this.state.selected}]` : '')}
                    </span>,
                ];
            } else {
                title = [
                    <span key="selected">
                        {I18n.t('ra_Selected')}
                        &nbsp;
                    </span>,
                    <span key="id" style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                        {I18n.t('%s items', this.state.selected.length.toString())}
                    </span>,
                ];
            }
        } else {
            title = this.props.title || I18n.t('ra_Please select object ID...');
        }

        return <Dialog
            onClose={() => {}}
            maxWidth={false}
            sx={{
                '&.MuiDialog-paper': {
                    height: '95%',
                    padding: 4,
                    width: '100%',
                    maxWidth: '100%',
                    maxHeight: 'calc(100% - 16px)',
                }
            }}
            fullWidth
            open={!0}
            aria-labelledby="ar_dialog_selectid_title"
        >
            <DialogTitle
                id="ar_dialog_selectid_title"
                style={{
                    whiteSpace: 'nowrap',
                    width: 'calc(100% - 72px)',
                    overflow: 'hidden',
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                }}
            >
                {title}
            </DialogTitle>
            <DialogContent
                style={{
                    height: '100%',
                    overflow: 'hidden',
                    padding: '8px 4px',
                }}
            >
                <ObjectBrowser
                    foldersFirst={this.props.foldersFirst}
                    imagePrefix={this.props.imagePrefix || this.props.prefix} // prefix is for back compatibility
                    defaultFilters={this.filters}
                    dialogName={this.dialogName}
                    showExpertButton={this.props.showExpertButton !== undefined ? this.props.showExpertButton : true}
                    expertMode={this.props.expertMode}
                    // style={{ width: '100%', height: '100%' }}
                    columns={this.props.columns || ['name', 'type', 'role', 'room', 'func', 'val']}
                    types={this.props.types ? (Array.isArray(this.props.types) ? this.props.types : [this.props.types]) : ['state']}
                    root={this.props.root}
                    t={I18n.t}
                    lang={this.props.lang || I18n.getLanguage()}
                    socket={this.props.socket}
                    selected={this.state.selected}
                    multiSelect={this.props.multiSelect}
                    notEditable={this.props.notEditable === undefined ? true : this.props.notEditable}
                    // name={this.state.name}
                    themeName={this.props.themeName}
                    themeType={this.props.themeType}
                    customFilter={this.props.customFilter}
                    onFilterChanged={filterConfig => {
                        this.filters = filterConfig;
                        ((window as any)._localStorage || window.localStorage).setItem(this.dialogName, JSON.stringify(filterConfig));
                    }}
                    onSelect={(selected, name, isDouble) => {
                        if (JSON.stringify(selected) !== JSON.stringify(this.state.selected)) {
                            this.setState({selected, name}, () => isDouble && this.handleOk());
                        } else if (isDouble) {
                            this.handleOk();
                        }
                    }}
                    filterFunc={this.filterFunc}
                    title=""
                    classes={{ }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    id={`ar_dialog_selectid_ok_${this.props.dialogName || ''}`}
                    variant="contained"
                    onClick={() => this.handleOk()}
                    startIcon={<IconOk />}
                    disabled={!this.state.selected.length}
                    color="primary"
                >
                    {this.props.ok || I18n.t('ra_Ok')}
                </Button>
                <Button
                    id={`ar_dialog_selectid_cancel_${this.props.dialogName || ''}`}
                    // @ts-expect-error
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

export default DialogSelectID;

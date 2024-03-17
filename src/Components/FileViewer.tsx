// File viewer in adapter-react does not support write
// import { Buffer } from 'buffer';
import React, { Component } from 'react';
import { withStyles } from '@mui/styles';

import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';

// Icons
import { FaCopy as CopyIcon } from 'react-icons/fa';
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Brightness6 as Brightness5Icon,
} from '@mui/icons-material';

import type { Connection } from '@iobroker/socket-client';

import IconNoIcon from '../icons/IconNoIcon';
import withWidth from './withWidth';
import Utils from './Utils';
import { Translator } from '../types';
// File viewer in adapter-react does not use ace editor
// import Editor from './Editor';

const styles: Record<string, any> = {
    dialog: {
        height: '100%',
    },
    paper: {
        height: 'calc(100% - 64px)',
    },
    content: {
        textAlign: 'center',
    },
    textarea: {
        width: '100%',
        height: '100%',
    },
    img: {
        width: 'auto',
        height: 'calc(100% - 5px)',
        objectFit: 'contain',
    },
    dialogTitle: {
        justifyContent: 'space-between',
        display: 'flex',
    },
};

export const EXTENSIONS = {
    images: ['png', 'jpg', 'svg', 'jpeg', 'bmp', 'gif', 'apng', 'avif', 'webp'],
    code:   ['js', 'json', 'json5', 'md'],
    txt:    ['log', 'txt', 'html', 'css', 'xml'],
    audio:  ['mp3', 'wav', 'ogg', 'acc'],
    video:  ['mp4', 'mov', 'avi'],
};

function bufferToBase64(buffer: Buffer, isFull?: boolean) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len && (isFull || i < 50); i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

interface FileViewerProps {
    /** Translation function */
    t: Translator;
    /** The selected language. */
    lang?: ioBroker.Languages;
    /**  Is expert mode enabled? (default: false) */
    expertMode?: boolean;
    /** Callback when the viewer is closed. */
    onClose: () => void;
    /** The URL (file path) to the file to be displayed. */
    href: string;
    formatEditFile?: string;
    socket: Connection;
    setStateBackgroundImage: () => void;
    getClassBackgroundImage: () => string | null;
    classes: Record<string, string>;
    /** Flag is the js-controller support subscribe on file */
    supportSubscribes?: boolean;
}

interface FileViewerState {
    text: string | null;
    code: string | null;
    ext: string | null;
    editing: boolean;
    editingValue: string | null;
    copyPossible: boolean;
    forceUpdate: number;
    changed: boolean;
    imgError: boolean;
}

class FileViewer extends Component<FileViewerProps, FileViewerState> {
    private timeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: FileViewerProps) {
        super(props);
        const ext = Utils.getFileExtension(props.href);

        this.state = {
            text: null,
            code: null,
            ext,
            // File viewer in adapter-react does not support write
            editing: /* !!this.props.formatEditFile || */ false,
            editingValue: null,
            copyPossible: !!ext && (EXTENSIONS.code.includes(ext) || EXTENSIONS.txt.includes(ext)),
            forceUpdate: Date.now(),
            changed: false,
            imgError: false,
        };
    }

    readFile() {
        if (this.props.href) {
            const parts = this.props.href.split('/');
            parts.splice(0, 2);
            const adapter = parts[0];
            const name = parts.splice(1).join('/');

            this.props.socket.readFile(adapter, name)
                .then((data: { data: Buffer; type: string } | { file: string; mimeType: string; }) => {
                    let fileData: string = '';
                    if ((data as { file: string; mimeType: string; }).file !== undefined) {
                        fileData = (data as { file: string; mimeType: string; }).file;
                    }

                    const newState: Partial<FileViewerState> = { copyPossible: this.state.copyPossible, ext: this.state.ext };
                    // try to detect valid extension
                    if ((data as { data: Buffer; type: string }).type === 'Buffer') {
                        if (name.toLowerCase().endsWith('.json5')) {
                            newState.ext = 'json5';
                            newState.copyPossible = true;
                            try {
                                fileData = atob(bufferToBase64((data as { data: Buffer; type: string }).data, true));
                            } catch (e) {
                                console.error('Cannot convert base64 to string');
                                fileData = '';
                            }
                        } else {
                            const ext = Utils.detectMimeType(bufferToBase64((data as { data: Buffer; type: string }).data));
                            if (ext) {
                                newState.ext = ext;
                                newState.copyPossible = EXTENSIONS.code.includes(ext) || EXTENSIONS.txt.includes(ext);
                            }
                        }
                    }

                    if (newState.copyPossible) {
                        if (newState.ext && EXTENSIONS.txt.includes(newState.ext)) {
                            newState.text = fileData;
                            newState.editingValue = fileData;
                        } else if (newState.ext && EXTENSIONS.code.includes(newState.ext)) {
                            newState.code = fileData;
                            newState.editingValue = fileData;
                        }
                    }

                    // @ts-expect-error I don't know how to fix it
                    this.setState(newState);
                })
                .catch(e => window.alert(`Cannot read file: ${e}`));
        }
    }

    componentDidMount() {
        this.readFile();

        const parts = this.props.href.split('/');
        parts.splice(0, 2);
        const adapter = parts[0];
        const name = parts.splice(1).join('/');

        this.props.supportSubscribes && this.props.socket.subscribeFiles(adapter, name, this.onFileChanged);
    }

    componentWillUnmount() {
        this.timeout && clearTimeout(this.timeout);
        const parts = this.props.href.split('/');
        parts.splice(0, 2);
        const adapter = parts[0];
        const name = parts.splice(1).join('/');
        this.props.supportSubscribes && this.props.socket.subscribeFiles(adapter, name, this.onFileChanged);
    }

    onFileChanged = (id: string, fileName: string, size: number | null) => {
        if (!this.state.changed) {
            this.timeout && clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.timeout = null;
                if (size === null) {
                    window.alert('Show file was deleted!');
                } else if (this.state.text !== null || this.state.code !== null) {
                    this.readFile();
                } else {
                    this.setState({ forceUpdate: Date.now() });
                }
            }, 300);
        }
    };

    writeFile64 = () => {
        /*
        // File viewer in adapter-react does not support write
        const parts = this.props.href.split('/');
        const data = this.state.editingValue;
        parts.splice(0, 2);
        const adapter = parts[0];
        const name = parts.splice(1).join('/');
        this.props.socket.writeFile64(adapter, name, Buffer.from(data).toString('base64'))
            .then(() => this.props.onClose())
            .catch(e => window.alert(`Cannot write file: ${e}`));
        */
    };

    static getEditFile(ext: string | null) {
        switch (ext) {
            case 'json':
                return 'json';
            case 'json5':
                return 'json5';
            case 'js':
                return 'javascript';
            case 'html':
                return 'html';
            case 'txt':
                return 'html';
            default:
                return 'json';
        }
    }

    getContent() {
        if (this.state.ext && EXTENSIONS.images.includes(this.state.ext)) {
            if (this.state.imgError) {
                return <IconNoIcon className={Utils.clsx(this.props.classes.img, this.props.getClassBackgroundImage())} />;
            }
            return <img
                onError={e => {
                    // @ts-ignore-error to check
                    e.target.onerror = null;
                    this.setState({ imgError: true });
                }}
                className={Utils.clsx(this.props.classes.img, this.props.getClassBackgroundImage())}
                src={`${this.props.href}?ts=${this.state.forceUpdate}`}
                alt={this.props.href}
            />;
        }
        if (this.state.code !== null || this.state.text !== null || this.state.editing) {
            // File viewer in adapter-react does not support write
            // return <AceEditor
            //     mode={FileViewer.getEditFile(this.props.formatEditFile)}
            //     width="100%"
            //     height="100%"
            //     theme={this.props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
            //     value={this.state.editingValue || this.state.code || this.state.text}
            //     onChange={newValue => this.setState({ editingValue: newValue, changed: true })}
            //     name="UNIQUE_ID_OF_DIV"
            //     readOnly={!this.state.editing}
            //     fontSize={14}
            //     setOptions={{
            //         enableBasicAutocompletion: true,
            //         enableLiveAutocompletion: true,
            //         enableSnippets: true,
            //     }}
            //     editorProps={{ $blockScrolling: true }}
            // />;
            return <TextField
                variant="standard"
                className={this.props.classes.textarea}
                multiline
                inputProps={{ readOnly: !this.state.editing }}
                value={this.state.editingValue || this.state.code || this.state.text}
                // onChange={newValue => this.setState({ editingValue: newValue, changed: true })}
                InputProps={{ readOnly: !this.state.editing }}
            />;
        }
        return null;
    }

    render() {
        return <Dialog
            classes={{ scrollPaper: this.props.classes.dialog, paper: this.props.classes.paper }}
            scroll="paper"
            open={!!this.props.href}
            onClose={() => this.props.onClose()}
            fullWidth
            maxWidth="xl"
            aria-labelledby="ar_dialog_file_view_title"
        >
            <div className={this.props.classes.dialogTitle}>
                <DialogTitle id="ar_dialog_file_view_title">{`${this.props.t(this.state.editing ? 'Edit' : 'View')}: ${this.props.href}`}</DialogTitle>
                {this.state.ext && EXTENSIONS.images.includes(this.state.ext) && <div>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={this.props.setStateBackgroundImage}
                    >
                        <Brightness5Icon />
                    </IconButton>
                </div>}
            </div>
            <DialogContent className={this.props.classes.content}>
                {this.getContent()}
            </DialogContent>
            <DialogActions>
                {this.state.copyPossible ?
                    <Button
                        // @ts-expect-error grey is valid color
                        color="grey"
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            Utils.copyToClipboard(this.state.text || this.state.code || '');
                        }}
                        startIcon={<CopyIcon />}
                    >
                        {this.props.t('Copy content')}
                    </Button> : null}
                {this.state.editing ?
                    <Button
                        // @ts-expect-error grey is valid color
                        color="grey"
                        disabled={this.state.editingValue === this.state.code || this.state.editingValue === this.state.text}
                        variant="contained"
                        onClick={this.writeFile64}
                        startIcon={<SaveIcon />}
                    >
                        {this.props.t('Save')}
                    </Button> : null}
                <Button
                    variant="contained"
                    onClick={() => this.props.onClose()}
                    color="primary"
                    startIcon={<CloseIcon />}
                >
                    {this.props.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default withWidth()(withStyles(styles)(FileViewer));

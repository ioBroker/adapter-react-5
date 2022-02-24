import React from 'react';
import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import NoImage from '../assets/no_icon.svg';
import Utils from './Utils';

// Icons
import {FaCopy as CopyIcon} from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

const styles = theme => ({
    dialog: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
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
    }
});

export const EXTENSIONS = {
    images: ['png', 'jpg', 'svg', 'jpeg', 'jpg'],
    code:   ['js', 'json'],
    txt:    ['log', 'txt', 'html', 'css', 'xml'],
};

function getFileExtension(fileName) {
    const pos = fileName.lastIndexOf('.');
    if (pos !== -1) {
        return fileName.substring(pos + 1).toLowerCase();
    } else {
        return null;
    }
}

/**
 * @typedef {object} FileViewerProps
 * @property {string} [key] The key to identify this component.
 * @property {import('../types').Translator} t Translation function
 * @property {ioBroker.Languages} [lang] The selected language.
 * @property {boolean} [expertMode] Is expert mode enabled? (default: false)
 * @property {() => void} onClose Callback when the viewer is closed.
 * @property {string} href The URL to the file to be displayed.
 *
 * @extends {React.Component<FileViewerProps>}
 */
class FileViewer extends React.Component {
    /**
     * @param {Readonly<FileViewerProps>} props
     */
    constructor(props) {
        super(props);

        this.ext = getFileExtension(this.props.href); // todo: replace later with Utils.getFileExtension

        this.state = {
            text: null,
            code: null,
            copyPossible: EXTENSIONS.code.includes(this.ext) || EXTENSIONS.txt.includes(this.ext)
        };

        if (this.state.copyPossible) {
            fetch(this.props.href)
                .then(response => response.text())
                .then(data => {
                    if (EXTENSIONS.txt.includes(this.ext)) {
                        this.setState({text: data});
                    } else if (EXTENSIONS.code.includes(this.ext)) {
                        this.setState({code: data});
                    }
                });
        }
    }

    static getDerivedStateFromProps() {

    }

    getContent() {
        if (EXTENSIONS.images.includes(this.ext)) {
            return <img
                onError={ e => {
                    e.target.onerror = null;
                    e.target.src = NoImage
                } }
                className={ this.props.classes.img }
                src={ this.props.href } alt={ this.props.href }/>;
        } else if (this.state.code !== null) {
            return <TextField
                variant="standard" 
                className={ this.props.classes.textarea }
                multiline
                value={ this.state.code }
                readOnly={true}/>;
        } else  if (this.state.text !== null) {
            return <TextField
                variant="standard" 
                className={ this.props.classes.textarea }
                value={ this.state.code }
                multiline
                readOnly={true}/>;
        }
    }

    render() {
        return <Dialog
            className={ this.props.classes.dialog }
            open={ this.props.href }
            onClose={ () => this.props.onClose() }
            fullWidth={ true }
            fullScreen={ true }
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{ this.props.t('View: %s', this.props.href) }</DialogTitle>
            <DialogContent className={ this.props.classes.content }>
                    { this.getContent() }
            </DialogContent>
            <DialogActions>
                { this.state.copyPossible ? <Button color="grey" onClick={e => Utils.copyToClipboard(this.state.text || this.state.code, e) } >
                    <CopyIcon />
                    { this.props.t('Copy content') }
                </Button> : null }

                <Button onClick={() => this.props.onClose()} color="primary">
                    <CloseIcon />
                    { this.props.t('Close') }
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

FileViewer.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    expertMode: PropTypes.bool,
    onClose: PropTypes.func,
    href: PropTypes.string.isRequired
};

/** @type {typeof FileViewer} */
const _export = withWidth()(withStyles(styles)(FileViewer));
export default _export;

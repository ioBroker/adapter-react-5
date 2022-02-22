// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import withStyles from '@mui/styles/withStyles';
import Fab from '@mui/material/Fab';
import PropTypes from 'prop-types';

import I18n from '../i18n';

import IconHelp from '@mui/icons-material/Help'
import IconUpload from '@mui/icons-material/VerticalAlignTop'
import IconDownload from '@mui/icons-material/VerticalAlignBottom'

const styles = theme => ({
    buttons: {
        marginRight: 5,
        marginTop: 5,
        float: 'right'
    },
    logo: {
        padding: 8,
        width: 64
    }
});

/**
 * @typedef {object} LogoProps
 * @property {any} common Adapter common configuration from io-package.json
 * @property {any} native Adapter native data from io-package.json
 * @property {number} instance Adapter instance number.
 * @property {(contents: any) => void} [onLoad]
 * @property {(error: string) => void} [onError]
 * @property {{ buttons: string, logo: string }} classes The styling class names.
 *
 * @extends {React.Component<LogoProps>}
 */
class Logo extends React.Component {

    static generateFile(filename, obj) {
        const el = window.document.createElement('a');
        el.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2)));
        el.setAttribute('download', filename);

        el.style.display = 'none';
        window.document.body.appendChild(el);

        el.click();

        window.document.body.removeChild(el);
    }

    handleFileSelect(evt) {
        const f = evt.target.files[0];
        if (f) {
            const r = new window.FileReader();
            r.onload = e => {
                const contents = e.target.result;
                try {
                    const json = JSON.parse(contents);
                    if (json.native && json.common) {
                        if (json.common.name !== this.props.common.name) {
                            this.props.onError(I18n.t('ra_otherConfig', json.common.name));
                        } else {
                            this.props.onLoad(json.native);
                        }
                    } else {
                        this.props.onError(I18n.t('ra_invalidConfig'));
                    }
                } catch (e) {
                    this.props.onError(e.toString());
                }
            };
            r.readAsText(f);
        } else {
            alert('Failed to open JSON File');
        }
    }

    download() {
        const result = {
            _id: 'system.adapter.' + this.props.common.name + '.' + this.props.instance,
            common: JSON.parse(JSON.stringify(this.props.common)),
            native: this.props.native
        };
        // remove unimportant information
        if (result.common.news) {
            delete result.common.news;
        }
        if (result.common.titleLang) {
            delete result.common.titleLang;
        }
        if (result.common.desc) {
            delete result.common.desc;
        }

        //window.open('data:application/iobroker; content-disposition=attachment; filename=' + result._id + '.json,' + JSON.stringify(result, null, 2));
        Logo.generateFile(result._id + '.json', result);
    }

    upload() {
        const input = window.document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('id', 'files');
        input.setAttribute('opacity', 0);
        input.addEventListener('change', e => this.handleFileSelect(e, () => {}), false);
        (input.click)();
    }

    render() {
        return <div className={this.props.className} style={this.props.style}>
            {this.props.common.icon ? <img src={this.props.common.icon} className={this.props.classes.logo} alt="logo"/> : null}
            {this.props.common.readme ?
                <Fab size="small" color="primary" aria-label="Help" className={this.props.classes.buttons} onClick={() => {
                    const win = window.open(this.props.common.readme, '_blank');
                    win.focus();
                }}><IconHelp /></Fab> : null}
            <Fab size="small" color="primary" aria-label="Load config" className={this.props.classes.buttons} title={I18n.t('ra_Load configuration from file')} onClick={() => this.upload()}><IconUpload /></Fab>
            <Fab size="small" color="primary" aria-label="Save config" className={this.props.classes.buttons} title={I18n.t('ra_Save configuration to file')} onClick={() => this.download()}><IconDownload /></Fab>
        </div>;
    }
}

Logo.propTypes = {
    common: PropTypes.object.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    native: PropTypes.object.isRequired,
    instance: PropTypes.number.isRequired,
    onError: PropTypes.func,
    onLoad: PropTypes.func,
};

/** @type {typeof Logo} */
const _export = withStyles(styles)(Logo);
export default _export;
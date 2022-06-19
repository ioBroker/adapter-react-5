import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import ConfigGeneric from './ConfigGeneric';
import FileSelectDialog from '../../Dialogs/FileSelect';

const styles = theme => ({
    fullWidth: {
        width: '100%'
    },
    fullWidthOneButton: {
        width: 'calc(100% - 65px)'
    },

});

const IMAGE_EXT = ['jpg', 'jpeg', 'svg', 'png', 'webp'];
const AUDIO_EXT = ['mp3', 'ogg', 'wav', 'aac'];
const VIDEO_EXT = ['avi', 'mp4', 'mov'];
const DOC_EXT = ['txt', 'log', 'html', 'htm'];
const JS_EXT = ['json', 'js', 'ts'];

class ConfigFile extends ConfigGeneric {
    componentDidMount() {
        super.componentDidMount();
        const value = ConfigGeneric.getValue(this.props.data, this.props.attr);
        this.setState({ value });
    }

    static getDerivedStateFromProps(props, state) {
        const value = ConfigGeneric.getValue(props.data, props.attr);
        if (value === null || value === undefined || value.toString().trim() !== (state.value ||  '').toString().trim()) {
            return { value };
        } else {
            return null;
        }
    }

    renderFileBrowser() {
        if (!this.state.showFileBrowser) {
            return null;
        } else {
            return <FileSelectDialog
                imagePrefix={this.props.imagePrefix}
                socket={this.props.socket}
                selected={this.state.value}
                onClose={() => this.setState({ showFileBrowser: false})}
                onOk={value => {
                    this.setState({ value }, () =>
                        this.onChange(this.props.attr, this.props.schema.trim === false ? value : (value || '').trim()));
                }}
                selectOnlyFolders={this.props.schema.selectOnlyFolders}
                allowUpload={this.props.schema.allowUpload}
                allowDownload={this.props.schema.allowDownload}
                allowCreateFolder={this.props.schema.allowCreateFolder}
                allowView={this.props.schema.allowView}
                showToolbar={this.props.schema.showToolbar}
                limitPath={this.props.schema.limitPath}
            />;
        }
    }

    renderItem(error, disabled, defaultValue) {
        return <div className={this.props.classes.fullWidth}>
            <TextField
                variant="standard"
                className={this.props.classes.fullWidthOneButton}
                value={this.state.value === null || this.state.value === undefined ? '' : this.state.value}
                error={!!error}
                disabled={!!disabled}
                inputProps={{
                    maxLength: this.props.schema.maxLength || this.props.schema.max || undefined,
                    readOnly: !!this.props.schema.disableEdit
                }}
                onChange={e => {
                    const value = e.target.value;
                    this.setState({ value }, () =>
                        this.onChange(this.props.attr, this.props.schema.trim === false ? value : (value || '').trim()));
                }}
                placeholder={this.getText(this.props.schema.placeholder)}
                label={this.getText(this.props.schema.label)}
                helperText={this.renderHelp(this.props.schema.help, this.props.schema.helpLink, this.props.schema.noTranslation)}
            />
            <Button variant="outlined" onClick={() => this.setState({ showFileBrowser: true })}>...</Button>
            {this.renderFileBrowser()}
        </div>;
    }
}

ConfigFile.propTypes = {
    socket: PropTypes.object.isRequired,
    themeType: PropTypes.string,
    themeName: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    data: PropTypes.object.isRequired,
    schema: PropTypes.object,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    imagePrefix: PropTypes.func,
};

export default withStyles(styles)(ConfigFile);
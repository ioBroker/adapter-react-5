import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

import Icon from './Icon';
import Utils from './Utils';

import devices from '../assets/devices/list.json';
import rooms from '../assets/rooms/list.json';

class IconSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            names: [],
            filter: '',
            icons: props.icons || null,
        };
    }

    loadAllIcons() {
        if (this.state.loading || this.state.icons) {
            return;
        }
        this.setState({loading: true}, () => {
            const icons = [];
            const names = [];

            if (!this.props.icons) {
                let templates = this.props.onlyRooms || (!this.props.onlyRooms && !this.props.onlyDevices) ? rooms : null;

                const promises = [];
                if (templates) {
                    templates.forEach(item => {
                        if (item.name && typeof item.name === 'object') {
                            item.name = item.name[this.props.lang] || item.name.en || item._id;
                        }
                        item.name = item.name || item._id;
                    });

                    templates = templates.filter((item, i) => !templates.find((_item, _i) => i !== _i && _item.icon === item.icon && _item.name === item.name));

                    templates.forEach((template, i) => {
                        let image;
                        try {
                            image = require(`../assets/rooms/${template.icon}`);
                        } catch (e) {
                            return Promise.resolve(null);
                        }

                        names[i] = template.name;

                        promises.push(Utils.getSvg(image.default)
                            .then(icon =>
                                icons[i] = icon));
                    });
                }

                templates = this.props.onlyDevices || (!this.props.onlyRooms && !this.props.onlyDevices) ? devices : null;
                if (templates) {
                    const offset = promises.length;
                    templates && templates.forEach(item => {
                        if (item.name && typeof item.name === 'object') {
                            item.name = item.name[this.props.lang] || item.name.en || item._id;
                        }
                        item.name = item.name || item._id;
                    });

                    templates = templates.filter((item, i) => !templates.find((_item, _i) => i !== _i && _item.icon === item.icon && _item.name === item.name));

                    templates.forEach((template, i) => {
                        let image;
                        try {
                            image = require(`../assets/devices/${template.icon}`);
                        } catch (e) {
                            return Promise.resolve(null);
                        }

                        names[i + offset] = template.name;

                        promises.push(Utils.getSvg(image.default)
                            .then(icon =>
                                icons[i + offset] = icon));
                    });
                }
                Promise.all(promises)
                    .then(() =>
                        this.setState({icons, loading: false, names, isAnyName: names.find(i => i)}));
            } else {
                const promises = this.props.icons.map((item, i) => {
                    let href;
                    if (typeof item === 'object') {
                        href = item.icon || item.src || item.href;
                        names[i] = typeof item.name === 'object' ? item.name[this.props.lang] || item.name.en || item._id : item.name;
                        if (!names[i]) {
                            const parts = href.split('.');
                            parts.pop();
                            names[i] = parts[parts.length - 1];
                        }
                    } else {
                        href = item;
                    }

                    if (href) {
                        if (href.startsWith('data:')) {
                            icons[i] = href;
                            return Promise.resolve();
                        } else {
                            return Utils.getSvg(href)
                                .then(icon =>
                                    icons[i] = icon);
                        }
                    } else {
                        return Promise.resolve();
                    }
                });

                Promise.all(promises)
                    .then(() =>
                        this.setState({icons, loading: false, names, isAnyName: names.find(i => i)}));
            }
        });
    }

    render() {
        if (this.state.loading) {
            return <CircularProgress />;
        }

        return <>
            <Button
                color="grey" 
                variant="outlined"
                title={this.props.t('ra_Select predefined icon')}
                onClick={() => this.setState({opened: true}, () => this.loadAllIcons())} style={{minWidth: 40, marginRight: 8}}
            >...</Button>
            {this.state.opened ? <Dialog onClose={() => this.setState({opened: false})} open={true}>
                <DialogTitle>{this.props.t('ra_Select predefined icon')}
                        {this.state.isAnyName ? <TextField
                            variant="standard" 
                            margin="dense"
                            style={{marginLeft: 20}}
                            value={this.state.filter}
                            onChange={e => this.setState({filter: e.target.value.toLowerCase()})}
                            placeholder={this.props.t('Filter')}
                            InputProps={{
                                endAdornment: this.state.filter
                                    ?
                                    <IconButton
                                        size="small"
                                        onClick={() => this.setState({filter: ''})}>
                                        <ClearIcon />
                                    </IconButton>
                                    :
                                    undefined,
                            }}
                        /> : null}
                </DialogTitle>
                <DialogContent>
                    <div style={{width: '100%', textAlign: 'center'}}>
                        {this.state.icons && this.state.icons.map((icon, i) => {
                            if (!this.state.filter || (this.state.names[i] && this.state.names[i].toLowerCase().includes(this.state.filter))) {
                                return (
                                    <Tooltip title={this.state.names[i] || ''} key={i}><IconButton
                                        onClick={() =>
                                            this.setState({opened: false}, () =>
                                                this.props.onSelect(icon))}
                                        size="large">
                                        <Icon src={icon} alt={i} style={{width: 32, height: 32, borderRadius: 5}}/>
                                    </IconButton></Tooltip>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="grey" 
                        variant="contained"
                        onClick={() => this.setState({opened: false})}
                        startIcon={<CloseIcon />}
                    >
                        {this.props.t('Close')}
                    </Button>
                </DialogActions>
            </Dialog> : null}
        </>;
    }
}

IconSelector.propTypes = {
    icons: PropTypes.array,
    onlyRooms: PropTypes.bool,
    onlyDevices: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
};

/** @type {typeof IconSelector} */
export default IconSelector;
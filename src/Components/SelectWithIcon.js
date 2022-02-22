import React, { Component } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import {FormControl, InputLabel, MenuItem, Select} from '@mui/material';

import Icon from './Icon';
import Utils from './Utils';
import I18n from '../i18n';

const styles = theme => ({
    different: {
        opacity: 0.5
    },
    icon: {
        width: 16,
        height: 16,
        marginRight: 8
    }
});

class SelectWithIcon extends Component {
    constructor(props) {
        super(props);

        if (this.props.different) {
            this.wordDifferent = this.props.t(this.props.different);
        }

        let list;
        if (Array.isArray(this.props.list || this.props.options)) {
            list = this.props.list.map(obj => ({
                name: Utils.getObjectNameFromObj(obj, this.props.lang)
                    .replace('system.group.', '')
                    .replace('system.user.', '')
                    .replace('enum.rooms.', '')
                    .replace('enum.functions.', ''),
                value: obj._id,
                icon: obj.common?.icon,
                color: obj.common?.color,
            }))
        } else {
            list = Object.values(this.props.list || this.props.options).map(obj => ({
                name: Utils.getObjectNameFromObj(obj, this.props.lang)
                    .replace('system.group.', '')
                    .replace('system.user.', '')
                    .replace('enum.rooms.', '')
                    .replace('enum.functions.', ''),
                value: obj._id,
                icon: obj.common?.icon,
                color: obj.common?.color,
            }));
        }

        if (this.props.different && this.props.value === this.props.different) {
            list.unshift({value: this.props.different, name: this.wordDifferent});
        }

        if (this.props.allowNone) {
            list.unshift({value: '', name: I18n.t('ra_none')});
        }

        this.state = {
            list
        };
    }

    render() {
        const item = this.state.list.find(it => it.value === this.props.value || (this.props.removePrefix && it.value.replace(this.props.removePrefix, '') === this.props.value));

        const style = this.props.value === this.props.different ? {} :
            {
                color: item?.color || undefined,
                backgroundColor: Utils.getInvertedColor(item?.color, this.props.themeType)
            };

        if (this.props.dense && this.props.style) {
            Object.assign(style, this.props.style);
        }

        const select = <Select
            disabled={this.props.disabled}
            value={this.props.value}
            inputProps={this.props.inputProps}
            renderValue={value => <span>{item?.icon ? <Icon src={item?.icon} className={this.props.classes.icon} /> : null}{item?.name}</span>}
            classes={{root: Utils.clsx(
                this.props.value === this.props.different ? this.props.classes.different : '',
                this.props.dense ? this.props.className : ''
            )}}
            style={style}
            onChange={el => {
                if (this.props.different && el.target.value !== this.props.different) {
                    let pos = null;
                    for (let i = 0; i < this.state.list.length; i++) {
                        if (this.state.list[i].value === this.props.different) {
                            pos = i;
                            break;
                        }
                    }
                    if (pos !== null) {
                        const list = Utils.clone(this.state.list);
                        list.splice(pos, 1);
                        return this.setState({list}, () => this.props.onChange(el.target.value));
                    }
                }

                this.props.onChange(this.props.removePrefix ? el.target.value.replace(this.props.removePrefix, '') : el.target.value);
            }}
        >
            {this.state.list.map(el => <MenuItem
                className={this.props.different && el.value === this.props.different ? this.props.classes.different : ''}
                style={this.props.different && el.value === this.props.different ? {} : { color: el.color || undefined, backgroundColor: Utils.getInvertedColor(el.color, this.props.themeType) }}
                key={el.value}
                value={el.value}
            >
                {el.icon ? <Icon src={el.icon} className={this.props.classes.icon} /> : null}
                {el.name}
            </MenuItem>)}
        </Select>;

        if (this.props.dense) {
            return select;
        } else {
            return <FormControl fullWidth={!!this.props.fullWidth} style={this.props.style} className={this.props.className}>
                <InputLabel>{this.props.label}</InputLabel>
                {select}
            </FormControl>;

        }
    }
}

SelectWithIcon.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    themeType: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    list: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    label: PropTypes.string,
    different: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    fullWidth: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    removePrefix: PropTypes.string,
    allowNone: PropTypes.bool,
    inputProps: PropTypes.object,
};

export default withStyles(styles)(SelectWithIcon);
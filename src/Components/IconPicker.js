import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useDropzone} from 'react-dropzone';
import makeStyles from '@mui/styles/makeStyles';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

import IconSelector from './IconSelector';
import Icon from './Icon';
import I18n from '../i18n';
import Utils from './Utils';

/**
 * @typedef {object} IconPickerProps
 * @property {string} [value] The value.
 * @property {string} [label] The label.
 * @property {boolean} [disabled] Set to true to disable the icon picker.
 * @property {(icon: string) => void} onChange The icon change callback.
 * @property {import('../Connection').default} socket The socket connection.
 * @property {string} [imagePrefix] The image prefix (default: './files/')
 * @property {React.CSSProperties} [style] Additional styling for this component.
 * @property {string} [className] The CSS class name.
 *
 * @extends {React.Component<IconPickerProps>}
 */
let IconPicker = function (props) {
    let IconCustom = props.icon;

    const useStyles = makeStyles(theme => ({
        formContainer : {
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center'
        },
        formControl : {
            display: 'flex',
            padding: 24,
            flexGrow: 1000
        },
        divContainer: {
            width: 32 + 24,
            height: 32,
            whiteSpace: 'nowrap',
            lineHeight: '32px',
            marginRight: 8
        },
        dragField: {
            textAlign: 'center',
            display: 'table',
            minHeight: 90,
            width: 'calc(100% - 60px)',
            border: '2px dashed #777',
            borderRadius: 10,
            padding: 4,
        },
        formIcon : {
            margin: 10,
            opacity: 0.6
        },
        text: {
            display: 'table-cell',
            verticalAlign: 'middle',
        }
    }));

    const classes = useStyles();

    const onDrop = useCallback(acceptedFiles => {
        const reader = new FileReader();

        reader.addEventListener('load', () =>
            props.onChange(reader.result), false);

        if (acceptedFiles[0]) {
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    return <div className={classes.formContainer}>
        {IconCustom ? <IconCustom className={ classes.formIcon }/> : null}
        <FormControl variant="standard" className={classes.formControl} style={{padding: 3}}>
            <InputLabel shrink classes={{root: props.customClasses?.label}}>
                { props.label }
            </InputLabel>
            <div className={ classes.formContainer }>
                {props.value ?
                    <div className={ classes.divContainer }>
                        <Icon alt="" className={Utils.clsx(props.previewClassName, props.customClasses?.icon)} src={props.value}/>
                        {!props.disabled && <IconButton
                            style={{verticalAlign: 'top'}}
                            title={I18n.t('ra_Clear icon')}
                            size="small"
                            onClick={() => props.onChange('')}
                        >
                            <ClearIcon/>
                        </IconButton>}
                    </div>
                    :
                    (!props.disabled && <IconSelector
                        icons={props.icons}
                        onlyRooms={props.onlyRooms}
                        onlyDevices={props.onlyDevices}
                        onSelect={base64 => props.onChange(base64)}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                    />)
                }

                {!props.disabled && <div
                    {...getRootProps()}
                    className={classes.dragField}
                    style={isDragActive ? {backgroundColor: 'rgba(0, 255, 0, 0.1)'} : {cursor: 'pointer'}}
                >
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <span className={classes.text}>{I18n.t('ra_Drop the files here...')}</span> :
                            <span className={classes.text}>{I18n.t(`ra_Drag 'n' drop some files here, or click to select files`)}</span>
                    }
                </div>}
            </div>
        </FormControl>
    </div>;
};

IconPicker.propTypes = {
    previewClassName: PropTypes.string,
    icon: PropTypes.object,
    customClasses: PropTypes.object,
    label: PropTypes.string,
    value: PropTypes.any,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,

    icons: PropTypes.array,
    onlyRooms: PropTypes.bool,
    onlyDevices: PropTypes.bool,
};

/** @type {typeof IconPicker} */
export default IconPicker;
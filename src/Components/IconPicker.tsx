import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from '@mui/styles';

import {
    InputLabel,
    FormControl,
    IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

import IconSelector from './IconSelector';
import Icon from './Icon';
import I18n from '../i18n';
import Utils from './Utils';

interface IconPickerProps {
    previewClassName?: string;
    /** Custom icon element. */
    icon?: React.ComponentType<any>;
    customClasses?: Record<string, string>;
    /** The label. */
    label?: string;
    /** The value. */
    value?: any;
    /** Set to true to disable the icon picker. */
    disabled?: boolean;
    /** The icon change callback. */
    onChange: (icon: string) => void;
    icons?: {
        icon?: string;
        src?: string;
        href?: string;
        name?: ioBroker.StringOrTranslated;
        _id?: string;
    }[];
    onlyRooms?: boolean;
    onlyDevices?: boolean;
}

const IconPicker = (props: IconPickerProps) => {
    const IconCustom = props.icon;

    const useStyles = makeStyles(() => ({
        formContainer : {
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
        },
        formControl : {
            display: 'flex',
            padding: 24,
            flexGrow: 1000,
        },
        divContainer: {
            width: 32 + 24,
            height: 32,
            whiteSpace: 'nowrap',
            lineHeight: '32px',
            marginRight: 8,
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
            opacity: 0.6,
        },
        text: {
            display: 'table-cell',
            verticalAlign: 'middle',
        },
    }));

    const classes = useStyles();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const reader = new FileReader();

        reader.addEventListener('load', () =>
            props.onChange(reader.result as string), false);

        if (acceptedFiles[0]) {
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return <div className={classes.formContainer}>
        {IconCustom ? <IconCustom className={classes.formIcon} /> : null}
        <FormControl variant="standard" className={classes.formControl} style={{ padding: 3 }}>
            <InputLabel shrink classes={{ root: props.customClasses?.label }}>
                {props.label}
            </InputLabel>
            <div className={classes.formContainer}>
                {props.value ?
                    <div className={classes.divContainer}>
                        <Icon className={Utils.clsx(props.previewClassName, props.customClasses?.icon)} src={props.value} />
                        {!props.disabled && <IconButton
                            style={{ verticalAlign: 'top' }}
                            title={I18n.t('ra_Clear icon')}
                            size="small"
                            onClick={() => props.onChange('')}
                        >
                            <ClearIcon />
                        </IconButton>}
                    </div>
                    :
                    (!props.disabled && <IconSelector
                        icons={props.icons}
                        onlyRooms={props.onlyRooms}
                        onlyDevices={props.onlyDevices}
                        onSelect={(base64: string) => props.onChange(base64)}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                    />)}

                {!props.disabled && <div
                    {...getRootProps()}
                    className={classes.dragField}
                    style={isDragActive ? { backgroundColor: 'rgba(0, 255, 0, 0.1)' } : { cursor: 'pointer' }}
                >
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <span className={classes.text}>{I18n.t('ra_Drop the files here...')}</span> :
                            <span className={classes.text}>{I18n.t('ra_Drag \'n\' drop some files here, or click to select files')}</span>
                    }
                </div>}
            </div>
        </FormControl>
    </div>;
};

export default IconPicker;

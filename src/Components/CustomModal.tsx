import React, { useEffect, useState } from 'react';

import {
    Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, TextField, Button,
} from '@mui/material';

import {
    Check as CheckIcon,
    Close as CloseIcon,
    Language as LanguageIcon,
} from '@mui/icons-material';

import I18n from '../i18n';
import { IobTheme } from '../types';

const styles: Record<string, any> = {
    modalDialog: {
        minWidth: 400,
        maxWidth: 800,
    },
    overflowHidden: {
        display: 'flex',
        overflow: 'hidden',
    },
    titleIcon: {
        marginRight: 5,
    },
    content: {
        fontSize: 16,
    },
    languageButton: {
        position: 'absolute',
        right: (theme: IobTheme) => theme.spacing(1),
        top: (theme: IobTheme) => theme.spacing(1),
    },
    languageButtonActive: {
        color: (theme: IobTheme) => theme.palette.primary.main,
    },
};

interface CustomModalProps {
    icon?: any;
    open: boolean;
    onClose: () => void;
    children: React.JSX.Element | null;
    titleButtonClose?: string;
    titleButtonApply?: string;
    onApply: (result: string) => void;
    fullWidth?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    applyButton?: boolean;
    applyDisabled?: boolean;
    overflowHidden?: boolean;
    help?: string;
    noTranslation?: boolean;
    toggleTranslation?: () => void;
    title?: string;
    progress?: boolean;
    textInput?: boolean;
    defaultValue?: string;
}

const CustomModal = (props: CustomModalProps) => {
    const {
        open,
        toggleTranslation,
        noTranslation,
        title,
        fullWidth,
        help,
        maxWidth,
        progress,
        icon,
        applyDisabled,
        applyButton,
        onClose,
        children,
        titleButtonApply,
        titleButtonClose,
        onApply,
        textInput,
        defaultValue,
        overflowHidden,
    } = props;

    const [value, setValue] = useState<string>(defaultValue || '');

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    let Icon = null;

    if (icon) {
        Icon = icon;
    }

    return <Dialog
        open={open}
        maxWidth={maxWidth || 'md'}
        fullWidth={!!fullWidth}
        disableEscapeKeyDown={false}
        onClose={onClose}
        sx={{ '& .MuiDialog-paper': styles.modalDialog }}
    >
        {title && <DialogTitle>
            {icon ? <Icon sx={styles.titleIcon} /> : null}
            {title}
            {I18n.getLanguage() !== 'en' && toggleTranslation ? <IconButton
                size="large"
                sx={Object.assign({}, styles.languageButton, noTranslation ? styles.languageButtonActive : {})}
                onClick={() => toggleTranslation()}
                title={I18n.t('Disable/Enable translation')}
            >
                <LanguageIcon />
            </IconButton> : null}
        </DialogTitle>}
        <DialogContent
            sx={Object.assign({}, styles.content, overflowHidden ? styles.overflowHidden : {})}
            style={{ paddingTop: 8 }}
        >
            {textInput && <TextField
                // className={className}
                autoComplete="off"
                fullWidth
                autoFocus
                variant="outlined"
                size="medium"
                // rows={10}
                multiline
                value={value}
                onChange={e => setValue(e.target.value)}
                // customValue
            />}
            {children}
            {help ? <div>{help}</div> : null}
        </DialogContent>
        <DialogActions>
            {applyButton !== false && <Button
                startIcon={<CheckIcon />}
                disabled={progress || (applyDisabled && defaultValue === value)}
                onClick={() => onApply(textInput ? value : '')}
                variant="contained"
                color="primary"
            >
                {I18n.t(titleButtonApply || 'ra_Ok')}
            </Button>}
            <Button
                color="grey"
                onClick={onClose}
                disabled={progress}
                variant="contained"
                startIcon={<CloseIcon />}
            >
                {I18n.t(titleButtonClose || 'ra_Cancel')}
            </Button>
        </DialogActions>
    </Dialog>;
};

export default CustomModal;

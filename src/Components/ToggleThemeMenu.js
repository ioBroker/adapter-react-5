import React from 'react';

import { IconButton, Tooltip } from '@mui/material';

import {
    Brightness4 as Brightness4Icon,
    Brightness5 as Brightness5Icon,
    Brightness6 as Brightness6Icon,
    Brightness7 as Brightness7Icon,
} from '@mui/icons-material';

export default function ToggleThemeMenu({
    themeName, toggleTheme, t, className, style, size,
}) {
    return <div className={className || undefined} style={style || undefined}>
        <Tooltip title={t('ra_Change color theme')}>
            <IconButton onClick={() => toggleTheme()} size={size || 'medium'}>
                {themeName === 'dark' ? <Brightness4Icon className={className} /> : null}
                {themeName === 'blue' ? <Brightness5Icon className={className} /> : null}
                {themeName === 'colored' ? <Brightness6Icon className={className} /> : null}
                {themeName !== 'dark' && themeName !== 'blue' && themeName !== 'colored' ? <Brightness7Icon className={className} /> : null}
            </IconButton>
        </Tooltip>
    </div>;
}

/**
 * Copyright 2021-2024 ioBroker GmbH
 *
 * MIT License
 *
 **/
import React, { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
// import './Vendor.css'
const vendorStyles = `
.logo-background-light, .logo-background-colored {
    background: white;
}
.logo-background-dark, .logo-background-blue {
    background: black;
}
`;

interface LoaderVendorProps {
    /** The size in pixels of this loader. */
    size?: number;
    /** The chosen theme type. */
    themeType?: 'dark' | 'light';
    /** The chosen theme name. */
    themeName?: string;
}

function LoaderVendor(props: LoaderVendorProps) {
    useEffect(() => {
        if (!window.document.getElementById('vendor-iobroker-component')) {
            const style = window.document.createElement('style');
            style.setAttribute('id', 'vendor-iobroker-component');
            style.innerHTML = vendorStyles;
            window.document.head.appendChild(style);
        }
    }, []);

    const theme = props.themeType || props.themeName || 'light';
    return <div
        className={`vendor-logo-back logo-background-${theme}`}
        style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '10%',
            margin: 'auto',
        }}
    >
        <div style={{ flexGrow: 1 }} />
        <CircularProgress color="secondary" size={200} thickness={5} />
        <div style={{ flexGrow: 1 }} />
    </div>;
}

export default LoaderVendor;

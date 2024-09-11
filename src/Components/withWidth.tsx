import React, { JSXElementConstructor } from 'react';
import { useTheme } from '@mui/material/styles';
import { Breakpoint, useMediaQuery } from '@mui/material';

function useWidth() {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();
    return (
        keys.reduce((output: Breakpoint | null, key: Breakpoint) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const matches = useMediaQuery(theme.breakpoints.up(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
}

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent: JSXElementConstructor<any>) => (props: Record<string, any>) => {
    const width = useWidth();
    return (
        <WrappedComponent
            {...props}
            width={width}
        />
    );
};

export default withWidth;

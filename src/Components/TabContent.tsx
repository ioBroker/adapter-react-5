// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import { Grid } from '@mui/material';

const styles: Record<string, React.CSSProperties> = {
    root: {
        height: '100%',
        overflow: 'hidden',
    },
    overflowAuto: {
        overflow: 'auto',
    },
};

interface TabContentProps {
    /* Set to 'auto' to show the overflow. */
    overflow?: string;
    children: React.ReactNode;
}

function TabContent(props: TabContentProps) {
    return <Grid
        item
        sx={{ ...styles.root, ...(props.overflow === 'auto' ? styles.overflowAuto : undefined) }}
    >
        {props.children}
    </Grid>;
}

export default TabContent;

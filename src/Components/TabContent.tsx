// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import { withStyles } from '@mui/styles';
import { Grid } from '@mui/material';

import Utils from './Utils';

const styles: Record<string, any> = {
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
    classes: Record<string, string>;
    children: React.ReactNode;
}

function TabContent(props: TabContentProps) {
    return <Grid
        item
        className={Utils.clsx(props.classes.root, props.overflow === 'auto' ? props.classes.overflowAuto : '')}
    >
        {props.children}
    </Grid>;
}

export default withStyles(styles)(TabContent);

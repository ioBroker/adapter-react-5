import React from 'react';
import { withStyles } from '@mui/styles';

import { Grid, Paper } from '@mui/material';

import Utils from './Utils';

const styles: Record<string, any> = {
    root: {
        width: '100%',
        height: '100%',
    },
    overflowHidden: {
        overflow: 'hidden',
    },
    container: {
        height: '100%',
    },
};

interface TabContainerProps {
    /* The elevation of the tab container. */
    elevation?: number;
    /* Set to 'visible' show the overflow. */
    overflow?: string;
    className?: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    tabIndex?: number;
    classes: Record<string, string>;
    children: React.ReactNode;
}

function TabContainer(props: TabContainerProps) {
    return <Paper
        elevation={!Number.isNaN(props.elevation) ? props.elevation : 1}
        className={Utils.clsx(props.classes.root, { [props.classes.overflowHidden]: props.overflow !== 'visible' }, props.className)}
        onKeyDown={props.onKeyDown}
        tabIndex={props.tabIndex}
    >
        <Grid
            container
            direction="column"
            wrap="nowrap"
            className={props.classes.container}
        >
            {props.children}
        </Grid>
    </Paper>;
}

/** @type {typeof TabContainer} */
const _export = withStyles(styles)(TabContainer);
export default _export;

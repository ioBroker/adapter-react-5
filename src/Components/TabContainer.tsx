import React from 'react';

import { Grid, Paper } from '@mui/material';

const styles: Record<string, React.CSSProperties> = {
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
    style?: React.CSSProperties;
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    tabIndex?: number;
    children: React.ReactNode;
}

function TabContainer(props: TabContainerProps) {
    return <Paper
        elevation={!Number.isNaN(props.elevation) ? props.elevation : 1}
        className={props.className}
        style={{ ...styles.root, ...(props.overflow !== 'visible' ? styles.overflowHidden :undefined), ...props.style }}
        onKeyDown={props.onKeyDown}
        tabIndex={props.tabIndex}
    >
        <Grid
            container
            direction="column"
            wrap="nowrap"
            sx={styles.container}
        >
            {props.children}
        </Grid>
    </Paper>;
}

export default TabContainer;

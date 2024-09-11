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
    styles?: {
        root?: React.CSSProperties;
        container?: React.CSSProperties;
    };
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    tabIndex?: number;
    /** The content of the component. */
    children: React.ReactNode;
}

function TabContainer(props: TabContainerProps): React.JSX.Element {
    return (
        <Paper
            elevation={!Number.isNaN(props.elevation) ? props.elevation : 1}
            style={{
                ...styles.root,
                ...(props.styles?.root || undefined),
                ...(props.overflow !== 'visible' ? styles.overflowHidden : undefined),
            }}
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
        </Paper>
    );
}

export default TabContainer;

import React, { Component } from 'react';
import { withStyles } from '@mui/styles';

import { Grid, Paper } from '@mui/material';

import Utils from './Utils';

const styles = {
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
    classes: {
        root: string;
        overflowHidden: string;
        container: string;
    };
    children: React.ReactNode;
}

class TabContainer extends Component<TabContainerProps> {
    render() {
        const { classes } = this.props;

        return <Paper
            elevation={!Number.isNaN(this.props.elevation) ? this.props.elevation : 1}
            className={Utils.clsx(classes.root, { [classes.overflowHidden]: this.props.overflow !== 'visible' }, this.props.className)}
            onKeyDown={this.props.onKeyDown}
            tabIndex={this.props.tabIndex}
        >
            <Grid
                container
                direction="column"
                wrap="nowrap"
                className={classes.container}
            >
                {this.props.children}
            </Grid>
        </Paper>;
    }
}

/** @type {typeof TabContainer} */
const _export = withStyles(styles)(TabContainer);
export default _export;

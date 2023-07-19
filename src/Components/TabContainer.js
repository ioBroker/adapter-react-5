// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import withStyles from '@mui/styles/withStyles';
import PropTypes from 'prop-types';

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

/**
 * @typedef {object} TabContainerProps
 * @property {number} [elevation] The elevation of the tab container.
 * @property {string} [overflow] Set to 'visible' show the overflow.
 * @property {{ [key in keyof styles]: string}} classes The styling class names.
 *
 * @extends {React.Component<TabContainerProps>}
 */
class TabContainer extends React.Component {

    render() {
        const { classes } = this.props;

        return <Paper
            elevation={!isNaN(this.props.elevation) ? this.props.elevation : 1}
            className={Utils.clsx(classes.root, {[classes.overflowHidden]: this.props.overflow !== 'visible'})}
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

TabContainer.propTypes = {
    elevation: PropTypes.number,
    overflow: PropTypes.string,
};

/** @type {typeof TabContainer} */
const _export = withStyles(styles)(TabContainer);
export default _export;
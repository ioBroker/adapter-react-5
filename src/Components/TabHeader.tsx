import React from 'react';

import { Grid } from '@mui/material';

interface TabHeaderProps {
    children: React.ReactNode;
}

class TabHeader extends React.Component<TabHeaderProps> {
    render() {
        return <Grid
            item
            container
            alignItems="center"
        >
            {this.props.children}
        </Grid>;
    }
}

export default TabHeader;

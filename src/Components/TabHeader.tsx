import React from 'react';

import { Grid } from '@mui/material';

interface TabHeaderProps {
    children: React.ReactNode;
}

function TabHeader(props: TabHeaderProps) {
    return <Grid
        item
        container
        alignItems="center"
    >
        {props.children}
    </Grid>;
}

export default TabHeader;

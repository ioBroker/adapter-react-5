function makeShared(pkgs) {
    const result = {};
    pkgs.forEach(packageName => {
        result[packageName] = {
            requiredVersion: '*',
            singleton: true,
        };
    });
    return result;
}

// Admin shares these modules for all components
module.exports = {
    shared: makeShared([
        '@iobroker/adapter-react-v5',
        '@iobroker/json-config',
        '@iobroker/dm-gui-components',
        '@mui/icons-material',
        '@mui/material',
        '@mui/material/styles',
        '@mui/styles',
        '@mui/styles/withStyles',
        '@mui/x-date-pickers/AdapterDateFns',
        'date-fns/locale',
        'leaflet',
        'leaflet-geosearch',
        'prop-types',
        'react',
        'react-ace',
        'react-dom',
    ]),
};

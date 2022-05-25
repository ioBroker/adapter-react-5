import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from "@mui/material/LinearProgress";

class ConfigCustom extends Component {
    constructor(props) {
        super(props);
        // schema.url - location of Widget
        // schema.name - Component name

        this.state = {
            Component: null,
            error: '',
        };
    }

    // load component dynamically
    async componentDidMount() {
        if (!this.props.schema.url) {
            console.error('URL is empty. Cannot load custom component!');
            this.setState({ error: 'URL is empty. Cannot load custom component!' });
            return;
        }

        if (this.props.schema.url.startsWith('http:') || this.props.schema.url.startsWith('https:')) {
            window._customComponent = this.props.schema.url;
        } else if (this.props.schema.url.startsWith('./')) {
            window._customComponent = `${window.location.protocol}//${window.location.host}${this.props.schema.url.replace(/^\./, '')}`;
        } else {
            window._customComponent = `${window.location.protocol}//${window.location.host}/${this.props.schema.url}`;
        }

        // custom component always has constant name
        const component = await import('CustomComponent/Components');

        if (!component || !!component.default || !component.default[this.props.schema.name]) {
            const keys = Object.keys(component?.default || {});
            console.error('URL is empty. Cannot load custom component!');
            this.setState({ error: `Component ${this.props.schema.name} not found in ${this.props.schema.url}. Found: ${keys.join(', ')}` });
        } else {
            this.setState({
                Component: component.default[this.props.schema.name]
            });
        }
    }

    render() {
        const Component = this.state.Component;
        if (!Component) {
            if (this.state.error) {
                return <div>{this.state.error}</div>;
            } else {
                return <LinearProgress />;
            }
        }

        return <Component {...this.props} />;
    }
}

ConfigCustom.propTypes = {
    socket: PropTypes.object.isRequired,
    themeType: PropTypes.string,
    themeName: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    data: PropTypes.object.isRequired,
    schema: PropTypes.object,
    onError: PropTypes.func,
    onChange: PropTypes.func,
};

export default ConfigCustom;
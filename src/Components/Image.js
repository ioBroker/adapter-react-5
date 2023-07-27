import React from 'react';
import PropTypes from 'prop-types';

import IconNoIcon from '../icons/IconNoIcon';

function getElementFromSource(src) {
    const svgContainer = document.createElement('div');
    svgContainer.innerHTML = src;
    const svg = svgContainer.firstElementChild;
    if (svg.remove) {
        svg.remove();
    } else {
        svgContainer.removeChild(svg);
    }

    svgContainer.remove();
    return svg;
}

function serializeAttrs(map) {
    const ret = {};
    for (let prop, i = 0; i < map.length; i++) {
        const key = map[i].name;
        if (key === 'class') {
            prop = 'className';
        } else if (!key.startsWith('data-')) {
            prop = key.replace(/[-|:]([a-z])/g, g => g[1].toUpperCase());
        } else {
            prop = key;
        }

        ret[prop] = map[i].value;
    }
    return ret;
}

/**
 * @typedef {object} ImageProps
 * @property {string} [color] The color.
 * @property {string} [src] The source of the image.
 * @property {string} [imagePrefix] The image prefix (default: './files/')
 * @property {string} [className] The CSS class name.
 * @property {boolean} [showError] Show image errors (or just show no image)?
 *
 * @extends {React.Component<ImageProps>}
 */
class Image extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            svg: !!(this.props.src && this.props.src.startsWith('data:')),
            created: true,
            color: this.props.color || '',
            src: this.props.src || '',
            imgError: false,
            showError: this.props.showError,
        };

        this.svg = this.state.svg ? this.getSvgFromData(this.state.src) : null;
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        let changed = false;

        if (props && state && props.src !== state.src) {
            newState.src = props.src;
            newState.svg = props.src && props.src.startsWith('data:');
            newState.created = false;
            changed = true;
        }

        if (props && state && props.color !== state.color) {
            newState.color = props.color;
            newState.created = false;
            changed = true;
        }

        if (props && state && props.showError !== state.showError) {
            newState.showError = props.showError;
            changed = true;
        }

        return changed ? newState : null;
    }

    getSvgFromData(src) {
        const len = 'data:image/svg+xml;base64,';
        if (!src.startsWith(len)) {
            return null;
        }
        src = src.substring(len.length);
        try {
            src = atob(src);
            const svg = getElementFromSource(src);
            const inner = svg.innerHTML;
            const svgProps = serializeAttrs(svg.attributes || []);

            svg.remove();

            return <svg
                className={this.props.className}
                style={this.state.color ? { color: this.state.color } : {}}
                {...svgProps}
                dangerouslySetInnerHTML={{ __html: inner }}
            />;
        } catch (e) {
            // ignore
        }
        return null;
    }

    render() {
        if (this.state.svg) {
            if (!this.state.created) {
                setTimeout(() => {
                    this.svg = this.getSvgFromData(this.state.src);
                    this.setState({ created: true });
                }, 50);
            }

            return this.svg;
        }
        if (this.state.src) {
            if (this.state.imgError || !this.state.src) {
                return <IconNoIcon className={this.props.className} />;
            }
            return <img
                className={this.props.className}
                src={(this.props.imagePrefix || '') + this.state.src}
                alt=""
                onError={() => (this.props.showError ? this.setState({ imgError: true }) : this.setState({ src: '' }))}
            />;
        }

        return null;
    }
}

Image.propTypes = {
    color: PropTypes.string,
    src: PropTypes.string.isRequired,
    className: PropTypes.string,
    imagePrefix: PropTypes.string,
};

export default Image;

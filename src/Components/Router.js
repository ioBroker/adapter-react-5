// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';

/**
 * @template P Type of the properties object.
 * @template S Type of the internal state object.
 * @extends {React.Component<P, S>}
 */
class Router extends React.Component {
    /**
     * @param {P} props The React properties of this component.
     */
    constructor(props) {
        super(props);
        this.onHashChangedBound = this.onHashChanged.bind(this);
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.onHashChangedBound);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChangedBound);
    }

    onHashChanged() {
        // override this function
    }

    /**
     * Gets the location object.
     * @returns {{ tab: string; dialog: string; id: string; arg: string; }}
     */
    static getLocation() {
        let hash = window.location.hash;
        hash = hash.replace(/^#/, '');
        const parts = hash.split('/').map(item => {
            try {
                return item ? decodeURIComponent(item) : ''
            } catch (e) {
                console.error('Router: Cannot decode ' + item);
                return item || '';
            }
        });
        // #tabName/dialogName/deviceId
        return {
            tab:    parts[0] || '',
            dialog: parts[1] || '',
            id:     parts[2] || '',
            arg:    parts[3] || ''
        };
    }

    /**
     * Navigate to a new location. Any parameters that are not set will be taken from the current location.
     * @param {string | undefined} [tab]
     * @param {string | undefined} [dialog]
     * @param {string | undefined} [id]
     * @param {string | undefined} [arg]
     */
    static doNavigate(tab, dialog, id, arg) {
        let hash = '';
        const location = Router.getLocation();
        if (arg !== undefined && !id) {
            id = location.id;
        }
        if (id && !dialog) {
            dialog = location.dialog;
        }
        if (dialog && !tab) {
            tab = location.tab;
        } else
        if (tab === null) {
            tab = location.tab;
        }

        if (tab) {
            hash = '#' + tab;
            if (dialog) {
                hash += '/' + dialog;

                if (id) {
                    hash += '/' + id;
                    if (arg !== undefined) {
                        hash += '/' + arg;
                    }
                }
            }
        }
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        }
    }
}

export default Router;
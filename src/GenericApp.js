/**
 * Copyright 2018-2021 bluefox <dogafox@gmail.com>
 *
 * MIT License
 *
 **/
import React from 'react';
import Connection, {PROGRESS} from './Connection';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/browser';
import * as SentryIntegrations from '@sentry/integrations';

import DialogError from './Dialogs/Error';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';

import IconClose from '@mui/icons-material/Close';

import printPrompt from './Prompt';
import theme from './Theme';
import Loader from './Components/Loader';
import Router from './Components/Router';
import Utils from './Components/Utils';
import SaveCloseButtons from './Components/SaveCloseButtons';
import I18n from './i18n';

import './index.css';

if (!window.localStorage) {
    window.localStorage = {
        getItem: () => null,
        setItem: () => null,
    };
}

/**
 * @extends {Router<import('./types').GenericAppProps, import('./types').GenericAppState>}
 */
class GenericApp extends Router {
    /**
     * @param {import('./types').GenericAppProps} props
     * @param {import('./types').GenericAppSettings | undefined} settings
     */
    constructor(props, settings) {
        // Remove `!Connection.isWeb() && window.adapterName !== 'material'` when iobroker.socket will support native ws
        if (!Connection.isWeb() && window.io && window.location.port === '3000') {
            try {
                const io = new window.SocketClient();
                delete window.io;
                window.io = io;
            } catch (e) {
                // ignore
            }
        }

        super(props);

        printPrompt();

        let query = (window.location.search || '').replace(/^\?/, '').replace(/#.*$/, '');
        let args = {};
        query.trim().split('&').filter(t => t.trim()).forEach(b => {
            const parts = b.split('=');
            args[parts[0]] = parts.length === 2 ? parts[1] : true;
            if (args[parts[0]] === 'true') {
                args[parts[0]] = true;
            } else if (args[parts[0]] === 'false') {
                args[parts[0]] = false;
            }
        });

        // extract instance from URL
        this.instance = args.instance !== undefined ? parseInt(args.instance, 10) || 0 : (parseInt(window.location.search.slice(1), 10) || 0);
        // extract adapter name from URL
        const tmp = window.location.pathname.split('/');
        this.adapterName = settings?.adapterName || props.adapterName || window.adapterName || tmp[tmp.length - 2] || 'iot';
        this.instanceId  = `system.adapter.${this.adapterName}.${this.instance}`;
        this.newReact = args.newReact === true; // it is admin5

        const location = Router.getLocation();
        location.tab = location.tab || window.localStorage.getItem(this.adapterName + '-adapter') || '';

        const themeInstance = this.createTheme();

        this.state = {
            selectedTab:    window.localStorage.getItem(this.adapterName + '-adapter') || '',
            selectedTabNum: -1,
            native:         {},
            errorText:      '',
            changed:        false,
            connected:      false,
            loaded:         false,
            isConfigurationError: '',
            expertMode:     false,
            toast:          '',
            theme:          themeInstance,
            themeName:      this.getThemeName(themeInstance),
            themeType:      this.getThemeType(themeInstance),
            bottomButtons:  (settings && settings.bottomButtons) === false ? false : ((props && props.bottomButtons) === false ? false : true),
            width:          GenericApp.getWidth(),
        };

        // init translations
        const translations = {
            'en': require('./i18n/en.json'),
            'de': require('./i18n/de.json'),
            'ru': require('./i18n/ru.json'),
            'pt': require('./i18n/pt.json'),
            'nl': require('./i18n/nl.json'),
            'fr': require('./i18n/fr.json'),
            'it': require('./i18n/it.json'),
            'es': require('./i18n/es.json'),
            'pl': require('./i18n/pl.json'),
            'zh-cn': require('./i18n/zh-cn.json'),
        };

        // merge together
        if (settings && settings.translations) {
            Object.keys(settings.translations).forEach(lang => translations[lang] = Object.assign(translations[lang], settings.translations[lang]));
        } else if (props.translations) {
            Object.keys(props.translations).forEach(lang => translations[lang] = Object.assign(translations[lang], props.translations[lang]));
        }

        I18n.setTranslations(translations);

        this.savedNative = {}; // to detect if the config changed

        this.encryptedFields = props.encryptedFields || settings?.encryptedFields || [];

        this.sentryDSN = (settings && settings.sentryDSN) || props.sentryDSN;

        this.socket = new Connection({
            ...(props?.socket || settings?.socket),
            name: this.adapterName,
            doNotLoadAllObjects: settings?.doNotLoadAllObjects,
            onProgress: progress => {
                if (progress === PROGRESS.CONNECTING) {
                    this.setState({connected: false});
                } else if (progress === PROGRESS.READY) {
                    this.setState({connected: true});
                } else {
                    this.setState({connected: true});
                }
            },
            onReady: (objects, scripts) => {
                I18n.setLanguage(this.socket.systemLang);

                // subscribe because of language and expert mode
                this.socket.subscribeObject('system.config', this.onSystemConfigChanged)
                    .then(() => this.getSystemConfig())
                    .then(obj => {
                        this._secret = (typeof obj !== 'undefined' && obj.native && obj.native.secret) || 'Zgfr56gFe87jJOM';
                        this._systemConfig = obj?.common || {};
                        return this.socket.getObject(this.instanceId);
                    })
                    .then(instanceObj => {
                        let waitPromise;

                        const sentryEnabled =
                            this._systemConfig.diag !== 'none' &&
                            instanceObj &&
                            instanceObj.common &&
                            instanceObj.common.name &&
                            instanceObj.common.version &&
                            !instanceObj.common.disableDataReporting &&
                            window.location.host !== 'localhost:3000';

                        // activate sentry plugin
                        if (!this.sentryStarted && this.sentryDSN && sentryEnabled) {
                            this.sentryStarted = true;

                            Sentry.init({
                                dsn: this.sentryDSN,
                                release: `iobroker.${instanceObj.common.name}@${instanceObj.common.version}`,
                                integrations: [
                                    new SentryIntegrations.Dedupe()
                                ]
                            });
                        }

                        // read UUID and init sentry with it.
                        // for backward compatibility it will be processed separately from above logic: some adapters could still have this.sentryDSN as undefined
                        if (!this.sentryInited && sentryEnabled) {
                            this.sentryInited = true;

                            waitPromise = this.socket.getObject('system.meta.uuid')
                                .then(uuidObj => {
                                    if (uuidObj && uuidObj.native && uuidObj.native.uuid) {
                                        Sentry.configureScope(scope =>
                                            scope.setUser({id: uuidObj.native.uuid}));
                                    }
                                });
                        }

                        waitPromise = waitPromise || Promise.resolve();

                        waitPromise
                            .then(() => {
                                if (instanceObj) {
                                    this.common = instanceObj?.common;
                                    this.onPrepareLoad(instanceObj.native, instanceObj.encryptedNative); // decode all secrets
                                    this.savedNative = JSON.parse(JSON.stringify(instanceObj.native));
                                    this.setState({native: instanceObj.native, loaded: true, expertMode: this.getExpertMode()}, () =>
                                        this.onConnectionReady && this.onConnectionReady());
                                } else {
                                    console.warn('Cannot load instance settings');
                                    this.setState({native: {}, loaded: true, expertMode: this.getExpertMode()}, () => this.onConnectionReady && this.onConnectionReady());
                                }
                            });
                    });
            },
            onError: err => {
                console.error(err);
                this.showError(err);
            }
        });
    }

    onSystemConfigChanged = (id, obj) => {
        if (obj && id === 'system.config') {
            if (this.socket.systemLang !== obj?.common.language) {
                this.socket.systemLang = obj?.common.language || 'en';
                I18n.setLanguage(this.socket.systemLang);
            }

            if (this._systemConfig.expertMode !== !!obj?.common?.expertMode) {
                this._systemConfig = obj?.common || {};
                this.setState({expertMode: this.getExpertMode()});
            } else {
                this._systemConfig = obj?.common || {};
            }
        }
    }

    /**
     * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
     */
    componentDidMount() {
        window.addEventListener('resize', this.onResize, true);
        window.addEventListener('message', this.onReceiveMessage, false);
        super.componentDidMount();
    }

    /**
     * Called immediately before a component is destroyed.
     */
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize, true);
        window.removeEventListener('message', this.onReceiveMessage, false);
        super.componentWillUnmount();
    }

    onReceiveMessage = message => {
        if (message?.data) {
            if (message.data === 'updateTheme') {
                const newThemeName = Utils.getThemeName()
                Utils.setThemeName(Utils.getThemeName());

                const theme = this.createTheme(newThemeName);

                this.setState({
                    theme,
                    themeName: this.getThemeName(theme),
                    themeType: this.getThemeType(theme)
                }, () => {
                    this.props.onThemeChange && this.props.onThemeChange(newThemeName);
                    this.onThemeChanged && this.onThemeChanged(newThemeName);
                });
            } else if (message.data === 'updateExpertMode') {
                this.onToggleExpertMode && this.onToggleExpertMode(this.getExpertMode());
            } else {
                console.warn('Received unknown message: ' + JSON.stringify(message.data));
            }
        }
    };

    /**
     * @private
     */
    onResize = () => {
        this.resizeTimer && clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.resizeTimer = null;
            this.setState({width: GenericApp.getWidth()});
        }, 200);
    };

    /**
     * Gets the width depending on the window inner width.
     * @returns {import('./types').Width}
     */
    static getWidth() {
        /**
         * innerWidth |xs      sm      md      lg      xl
         *            |-------|-------|-------|-------|------>
         * width      |  xs   |  sm   |  md   |  lg   |  xl
         */

        const SIZES = {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920
        };
        const width = window.innerWidth;
        const keys = Object.keys(SIZES).reverse();
        const widthComputed = keys.find(key => width >= SIZES[key]);

        return widthComputed || 'xs';
    }

    /**
     * Get a theme
     * @param {string} name Theme name
     * @returns {import('./types').Theme}
     */
    createTheme(name = '') {
        return theme(Utils.getThemeName(name));
    }

    /**
     * Get the theme name
     * @param {import('./types').Theme} theme Theme
     * @returns {string} Theme name
     */
    getThemeName(theme) {
        return theme.name;
    }

    /**
     * Get the theme type
     * @param {import('./types').Theme} theme Theme
     * @returns {string} Theme type
     */
    getThemeType(theme) {
        return theme.palette.mode;
    }

    /**
     * Changes the current theme
     */
    toggleTheme() {
        const themeName = this.state.themeName;

        // dark => blue => colored => light => dark
        const newThemeName = themeName === 'dark' ? 'blue' :
            (themeName === 'blue' ? 'colored' :
                (themeName === 'colored' ? 'light' : 'dark'));

        Utils.setThemeName(newThemeName);

        const theme = this.createTheme(newThemeName);

        this.setState({
            theme,
            themeName: this.getThemeName(theme),
            themeType: this.getThemeType(theme)
        }, () => {
            this.props.onThemeChange && this.props.onThemeChange(newThemeName);
            this.onThemeChanged && this.onThemeChanged(newThemeName);
        });
    }

    /**
     * Gets the system configuration.
     * @returns {Promise<ioBroker.OtherObject>}
     */
    getSystemConfig() {
        return this.socket.getSystemConfig();
    }

    /**
     * Get current expert mode
     * @returns {boolean}
     */
    getExpertMode() {
        return window.sessionStorage.getItem('App.expertMode') === 'true' || !!this._systemConfig.expertMode;
    }

    /**
     * Gets called when the socket.io connection is ready.
     * You can overload this function to execute own commands.
     */
    onConnectionReady() {
    }

    /**
     * Encrypts a string.
     * @param {string} value
     * @returns {string}
     */
    encrypt(value) {
        let result = '';
        for (let i = 0; i < value.length; i++) {
            result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i));
        }
        return result;
    }

    /**
     * Decrypts a string.
     * @param {string} value
     * @returns {string}
     */
    decrypt(value) {
        let result = '';
        for (let i = 0; i < value.length; i++) {
            result += String.fromCharCode(this._secret[i % this._secret.length].charCodeAt(0) ^ value.charCodeAt(i));
        }
        return result;
    }

    /**
     * Gets called when the navigation hash changes.
     * You may override this if needed.
     */
    onHashChanged() {
        const location = Router.getLocation();
        if (location.tab !== this.state.selectedTab) {
            this.selectTab(location.tab);
        }
    }

    /**
     * Selects the given tab.
     * @param {string} tab
     * @param {number} [index]
     */
    selectTab(tab, index) {
        window.localStorage[this.adapterName + '-adapter'] = tab;
        this.setState({selectedTab: tab, selectedTabNum: index})
    }

    /**
     * Gets called before the settings are saved.
     * You may override this if needed.
     * @param {Record<string, any>} settings
     */
    onPrepareSave(settings) {
        // here you can encode values
        this.encryptedFields && this.encryptedFields.forEach(attr => {
            if (settings[attr]) {
                settings[attr] = this.encrypt(settings[attr]);
            }
        });

        return true;
    }

    /**
     * Gets called after the settings are loaded.
     * You may override this if needed.
     * @param {Record<string, any>} settings
     * @param {string[]} encryptedNative optional list of fields to be decrypted
     */
    onPrepareLoad(settings, encryptedNative) {
        // here you can encode values
        this.encryptedFields && this.encryptedFields.forEach(attr => {
            if (settings[attr]) {
                settings[attr] = this.decrypt(settings[attr]);
            }
        });
        encryptedNative && encryptedNative.forEach(attr => {
            this.encryptedFields = this.encryptedFields || [];
            !this.encryptedFields.includes(attr) && this.encryptedFields.push(attr);
            if (settings[attr]) {
                settings[attr] = this.decrypt(settings[attr]);
            }
        });
    }

    /**
     * Gets the extendable instances.
     * @returns {Promise<any[]>}
     */
    getExtendableInstances() {
        return new Promise(resolve => {
            this.socket._socket.emit('getObjectView', 'system', 'instance', null, (err, doc) => {
                if (err) {
                    resolve([]);
                } else {
                    resolve(doc.rows.filter(item => item.value.common.webExtendable).map(item => item.value));
                }
            });
        });
    }

    /**
     * Gets the IP addresses of the given host.
     * @param {string} host
     */
    getIpAddresses(host) {
        return new Promise((resolve, reject) => {
            this.socket._socket.emit('getHostByIp', host || this.common.host, (ip, _host) => {
                const IPs4 = [{name: '[IPv4] 0.0.0.0 - ' + I18n.t('ra_Listen on all IPs'), address: '0.0.0.0', family: 'ipv4'}];
                const IPs6 = [{name: '[IPv6] ::',      address: '::',      family: 'ipv6'}];
                if (_host) {
                    host = _host;
                    if (host.native.hardware && host.native.hardware.networkInterfaces) {
                        Object.keys(host.native.hardware.networkInterfaces).forEach(eth =>
                            host.native.hardware.networkInterfaces[eth].forEach(inter => {
                                if (inter.family !== 'IPv6') {
                                    IPs4.push({name: '[' + inter.family + '] ' + inter.address + ' - ' + eth, address: inter.address, family: 'ipv4'});
                                } else {
                                    IPs6.push({name: '[' + inter.family + '] ' + inter.address + ' - ' + eth, address: inter.address, family: 'ipv6'});
                                }
                            }));
                    }
                    IPs6.forEach(ip => IPs4.push(ip));
                }
                resolve(IPs4);
            });
        });
    }

    /**
     * Saves the settings to the server.
     * @param {boolean} isClose True if the user is closing the dialog.
     */
    onSave(isClose) {
        let oldObj;
        if (this.state.isConfigurationError) {
            this.setState({errorText: this.state.isConfigurationError});
            return;
        }

        this.socket.getObject(this.instanceId)
            .then(_oldObj => {
                oldObj = _oldObj || {};

                for (const a in this.state.native) {
                    if (this.state.native.hasOwnProperty(a)) {
                        if (this.state.native[a] === null) {
                            oldObj.native[a] = null;
                        } else
                        if (this.state.native[a] !== undefined) {
                            oldObj.native[a] = JSON.parse(JSON.stringify(this.state.native[a]));
                        } else {
                            delete oldObj.native[a];
                        }
                    }
                }

                if (this.state.common) {
                    for (const b in this.state.common) {
                        if (this.state.common[b] === null) {
                            oldObj.common[b] = null;
                        } else
                        if (this.state.common[b] !== undefined) {
                            oldObj.common[b] = JSON.parse(JSON.stringify(this.state.common[b]));
                        } else {
                            delete oldObj.common[b];
                        }
                    }
                }

                if (this.onPrepareSave(oldObj.native) !== false) {
                    return this.socket.setObject(this.instanceId, oldObj);
                } else {
                    return Promise.reject('Invalid configuration');
                }
            })
            .then(() => {
                this.savedNative = oldObj.native;
                globalThis.changed = false;
                this.setState({changed: false});
                isClose && GenericApp.onClose();
            })
            .catch(e => {
                console.error(`Cannot save configuration: ${e}`);
            });
    }

    /**
     * Renders the toast.
     * @returns {JSX.Element | null} The JSX element.
     */
    renderToast() {
        if (!this.state.toast) return null;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={true}
                autoHideDuration={6000}
                onClose={() => this.setState({toast: ''})}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.toast}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={this.props.classes.close}
                        onClick={() => this.setState({toast: ''})}
                        size="large">
                        <IconClose />
                    </IconButton>,
                ]}
            />
        );
    }

    /**
     * Closes the dialog.
     * @private
     */
    static onClose() {
        if (typeof window.parent !== 'undefined' && window.parent) {
            try {
                if (window.parent.$iframeDialog && typeof window.parent.$iframeDialog.close === 'function') {
                    window.parent.$iframeDialog.close();
                } else {
                    window.parent.postMessage('close', '*');
                }
            } catch (e) {
                window.parent.postMessage('close', '*');
            }
        }
    }

    /**
     * Renders the error dialog.
     * @returns {JSX.Element | null} The JSX element.
     */
    renderError() {
        if (!this.state.errorText) {
            return null;
        } else {
            return <DialogError text={this.state.errorText} onClose={() => this.setState({errorText: ''})}/>;
        }
    }

    /**
     * Checks if the configuration has changed.
     * @param {Record<string, any>} [native] the new state
     */
    getIsChanged(native) {
        native = native || this.state.native;
        const isChanged =  JSON.stringify(native) !== JSON.stringify(this.savedNative);

        if(isChanged) {
            globalThis.changed = true;
        } else {
            globalThis.changed = false;
        }

        return isChanged;
    }

    /**
     * Gets called when loading the configuration.
     * @param {Record<string, any>} newNative The new configuration object.
     */
    onLoadConfig(newNative) {
        if (JSON.stringify(newNative) !== JSON.stringify(this.state.native)) {
            this.setState({native: newNative, changed: this.getIsChanged(newNative)})
        }
    }

    /**
     * Sets the configuration error.
     * @param {string} errorText
     */
    setConfigurationError(errorText) {
        if (this.state.isConfigurationError !== errorText) {
            this.setState({isConfigurationError: errorText});
        }
    }

    /**
     * Renders the save and close buttons.
     * @returns {JSX.Element | undefined} The JSX element.
     */
    renderSaveCloseButtons() {
        if (this.state.bottomButtons) {
            return <SaveCloseButtons
                theme={this.state.theme}
                newReact={this.newReact}
                noTextOnButtons={this.state.width === 'xs' || this.state.width === 'sm' || this.state.width === 'md'}
                changed={this.state.changed}
                onSave={(isClose) => this.onSave(isClose)}
                onClose={() => GenericApp.onClose()}
            />;
        } else {
            return null;
        }
    }

    /**
     * @private
     * @param {Record<string, any>} obj
     * @param {any} attrs
     * @param {any} value
     * @returns {boolean | undefined}
     */
    _updateNativeValue(obj, attrs, value) {
        if (typeof attrs !== 'object') {
            attrs = attrs.split('.');
        }
        const attr = attrs.shift();
        if (!attrs.length) {
            if (value && typeof value === 'object') {
                if (JSON.stringify(obj[attr]) !== JSON.stringify(value)) {
                    obj[attr] = value;
                    return true;
                }
            } else if (obj[attr] !== value) {
                obj[attr] = value;
                return true;
            } else {
                return false;
            }

        } else {
            obj[attr] = obj[attr] || {};
            if (typeof obj[attr] !== 'object') {
                throw new Error('attribute ' + attr + ' is no object, but ' + typeof obj[attr]);
            }
            return this._updateNativeValue(obj[attr], attrs, value);
        }
    }

    /**
     * Update the native value
     * @param {string} attr The attribute name with dots as delimiter.
     * @param {any} value The new value.
     * @param {(() => void)} [cb] Callback which will be called upon completion.
     */
    updateNativeValue(attr, value, cb) {
        const native = JSON.parse(JSON.stringify(this.state.native));
        if (this._updateNativeValue(native, attr, value)) {
            const changed = this.getIsChanged(native);
            this.setState({native, changed}, cb);
        }
    }

    /**
     * Set the error text to be shown.
     * @param {string | JSX.Element} text
     */
    showError(text) {
        this.setState({errorText: text});
    }

    /**
     * Sets the toast to be shown.
     * @param {string} toast
     */
    showToast(toast) {
        this.setState({toast});
    }

    /**
     * Renders this component.
     * @returns {JSX.Element} The JSX element.
     */
    render() {
        if (!this.state.loaded) {
            return <Loader theme={this.state.themeType}/>;
        }

        return <div className="App">
            {this.renderError()}
            {this.renderToast()}
            {this.renderSaveCloseButtons()}
        </div>;
    }
}

GenericApp.propTypes = {
    adapterName: PropTypes.string, // (optional) name of adapter
    onThemeChange: PropTypes.func, // (optional) called by theme change
    socket: PropTypes.object, // (optional) socket information (host, port)
    encryptedFields: PropTypes.array, // (optional) list of native attributes, that must be encrypted
    bottomButtons: PropTypes.bool, // If the bottom buttons (Save/Close) must be shown
};

export default GenericApp;

# Help ReactJS classes for adapter config

You can find demo on https://github.com/ioBroker/adapter-react-demo

## Getting started

If you want to create the configuration page with ReactJS:

1. Create github repo for adapter.
2. execute `npx create-react-app src` . It will take a while.
3. `cd src`
4. Modify package.json file in src directory:
    - Change `name` from `src` to `ADAPTERNAME-admin` (Of course replace `ADAPTERNAME` with yours)
    - Add to devDependencies:
        ```
        "@iobroker/adapter-react-v5": "^7.1.2",
        ```
        Versions can be higher.
        So your `src/package.json` should look like:

```json
{
    "name": "ADAPTERNAME-admin",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@iobroker/adapter-react-v5": "^7.1.2",
        "@iobroker/build-tools": "^1.0.0",
        "@iobroker/eslint-config": "^0.1.2",
        "@mui/material": "^6.0.2",
        "@mui/icons-material": "^6.0.2",
        "@sentry/browser": "^8.28.0",
        "babel-eslint": "^10.1.0",
        "eslint": "^9.10.0",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-scripts": "^5.0.1",
        "react-icons": "^5.3.0"
    },
    "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
    },
    "eslintConfig": {
        "extends": "react-app"
    },
    "homepage": ".",
    "browserslist": [">0.2%", "not dead", "not ie <= 11", "not op_mini all"]
}
```

5. Call in `src`: `npm install`
6. Copy `tasks.js` into `src`: `cp node_modules/@iobroker/adapter-react-v5/tasks.js tasks.js`
7. Add scripts to your `package.json` `scripts` section:

```json
"scripts": {
    "0-clean": "node tasks --0-clean",
    "1-npm": "node tasks --1-npm",
    "2-build": "node tasks --2-build",
    "3-copy": "node tasks --3-copy",
    "4-patch": "node tasks --4-patch",
    "build": "node tasks"
}
```

7. Start your dummy application `npm run start` for developing or build with `npm run build` and
   copy files in `build` directory to `www` or to `admin`. In the admin you must rename `index.html` to `index_m.html`.
8. You can do that with `npm` tasks: `npm run build`

## Development

1. Add `socket.io` to `public/index.html`.
   After

```html
<link
    rel="manifest"
    href="%PUBLIC_URL%/manifest.json"
/>
```

insert

```html
<script>
    const script = document.createElement('script');
    window.registerSocketOnLoad = function (cb) {
        window.socketLoadedHandler = cb;
    };
    const parts = (window.location.search || '').replace(/^\?/, '').split('&');
    const query = {};
    parts.forEach(item => {
        const [name, val] = item.split('=');
        query[decodeURIComponent(name)] = val !== undefined ? decodeURIComponent(val) : true;
    });
    script.onload = function () {
        typeof window.socketLoadedHandler === 'function' && window.socketLoadedHandler();
    };
    script.src =
        window.location.port === '3000'
            ? window.location.protocol +
              '//' +
              (query.host || window.location.hostname) +
              ':' +
              (query.port || 8081) +
              '/lib/js/socket.io.js'
            : '%PUBLIC_URL%/../../lib/js/socket.io.js';

    document.head.appendChild(script);
</script>
```

3. Add to App.js constructor initialization for I18n:

```jsx
class App extends GenericApp {
    constructor(props) {
        const extendedProps = { ...props };
        extendedProps.encryptedFields = ['pass']; // this parameter will be encrypted and decrypted automatically
        extendedProps.translations = {
            en: require('./i18n/en'),
            de: require('./i18n/de'),
            ru: require('./i18n/ru'),
            pt: require('./i18n/pt'),
            nl: require('./i18n/nl'),
            fr: require('./i18n/fr'),
            it: require('./i18n/it'),
            es: require('./i18n/es'),
            pl: require('./i18n/pl'),
            uk: require('./i18n/uk'),
            'zh-cn': require('./i18n/zh-cn'),
        };
        // get actual admin port
        extendedProps.socket = { port: parseInt(window.location.port, 10) };

        // Only if close, save buttons are not required at the bottom (e.g. if admin tab)
        // extendedProps.bottomButtons = false;

        // only for debug purposes
        if (extendedProps.socket.port === 3000) {
            extendedProps.socket.port = 8081;
        }

        // allow to manage GenericApp the sentry initialisation or do not set the sentryDSN if no sentry available
        extendedProps.sentryDSN = 'https://yyy@sentry.iobroker.net/xx';

        super(extendedProps);
    }
    // ...
}
```

4. Replace `index.js` with the following code to support themes:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import * as serviceWorker from './serviceWorker';

import './index.css';
import App from './App';
import { version } from '../package.json';

console.log(`iobroker.scenes@${version}`);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

5. Add to App.js encoding and decoding of values:

```jsx
class App extends GenericApp {
    // ...
    onPrepareLoad(settings) {
        settings.pass = this.decode(settings.pass);
    }
    onPrepareSave(settings) {
        settings.pass = this.encode(settings.pass);
    }
}
```

6. The optional step is to validate the data to be saved:

```jsx
onPrepareSave(settings) {
     super.onPrepareSave(settings);
     if (DATA_INVALID) {
         return false; // configuration will not be saved
     } else {
         return true;
     }
 }
```

## Components

### Connection.tsx

This is a non-React class to provide the communication for socket connection with the server.

### GenericApp.tsx

### i18n.ts

### Theme.tsx

### Dialogs

Some dialogs are predefined and could be used out of the box.

#### Confirm.tsx

<!-- TODO: Provide screenshot here -->

Usage:

```jsx
import React from 'react';
import { I18n, Confirm as ConfirmDialog } from '@iobroker/adapter-react-v5';

class ExportImportDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmDialog: false,
        };
    }

    renderConfirmDialog() {
        if (!this.state.confirmDialog) {
            return null;
        }
        return (
            <ConfirmDialog
                title={I18n.t('Scene will be overwritten.')}
                text={I18n.t('All data will be lost. Confirm?')}
                ok={I18n.t('Yes')}
                cancel={I18n.t('Cancel')}
                suppressQuestionMinutes={5}
                dialogName="myConfirmDialogThatCouldBeSuppressed"
                suppressText={I18n.t('Suppress question for next %s minutes', 5)}
                onClose={isYes => {
                    this.setState({ confirmDialog: false });
                }}
            />
        );
    }
    render() {
        return (
            <div>
                <Button onClick={() => this.setState({ confirmDialog: true })}>Click</Button>
                {this.renderConfirmDialog()}
            </div>
        );
    }
}

export default ExportImportDialog;
```

#### Error.tsx

<!-- TODO: Provide screenshot here -->

#### Message.tsx

<!-- TODO: Provide screenshot here -->

```jsx
renderMessage() {
   if (this.state.showMessage) {
      return <Message
         text={this.state.showMessage}
         onClose={() => this.setState({showMessage: false})}
      />;
   } else {
      return null;
   }
}
```

#### SelectID.tsx

![Logo](img/selectID.png)

```jsx
import { SelectID as DialogSelectID } from '@iobroker/adapter-react-v5';

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSelectId: false,
        };
    }

    renderSelectIdDialog() {
        if (this.state.showSelectId) {
            return (
                <DialogSelectID
                    key="tableSelect"
                    imagePrefix="../.."
                    dialogName={this.props.adapterName}
                    themeType={this.props.themeType}
                    socket={this.props.socket}
                    statesOnly={true}
                    selected={this.state.selectIdValue}
                    onClose={() => this.setState({ showSelectId: false })}
                    onOk={(selected, name) => {
                        this.setState({ showSelectId: false, selectIdValue: selected });
                    }}
                />
            );
        } else {
            return null;
        }
    }
    render() {
        return renderSelectIdDialog();
    }
}
```

#### Cron

Include `"react-text-mask": "^5.4.3",` in package.json.

<!-- TODO: Provide screenshot here -->

```jsx
function renderCron() {
    if (!showCron) {
        return null;
    } else {
        return (
            <DialogCron
                key="dialogCron1"
                cron={this.state.cronValue || '* * * * *'}
                onClose={() => this.setState({ showCron: false })}
                onOk={cronValue => {
                    this.setState({ cronValue });
                }}
            />
        );
    }
}
```

### Components

#### Utils.tsx

##### getObjectNameFromObj

`getObjectNameFromObj(obj, settings, options, isDesc)`

Get object name from a single object.

Usage: `Utils.getObjectNameFromObj(this.objects[id], null, {language: I18n.getLanguage()})`

##### getObjectIcon

`getObjectIcon(id, obj)`

Get icon from the object.

Usage:

```jsx
const icon = Utils.getObjectIcon(id, this.objects[id]);
return <img src={icon} />;
```

##### isUseBright

`isUseBright(color, defaultValue)`

Usage: `

#### Loader.tsx

![Logo](img/loader.png)

```jsx
render() {
     if (!this.state.loaded) {
         return <MuiThemeProvider theme={this.state.theme}>
             <Loader theme={this.state.themeType}/>
         </MuiThemeProvider>;
     }
     // render loaded data
}

```

#### Logo.tsx

![Logo](img/logo.png)

```jsx
render() {
   return <form className={this.props.classes.tab}>
      <Logo
       instance={this.props.instance}
       common={this.props.common}
       native={this.props.native}
       onError={text => this.setState({errorText: text})}
       onLoad={this.props.onLoad}
      />
      ...
   </form>;
}
```

#### Router.tsx

#### ObjectBrowser.js

It is better to use `Dialog/SelectID`, but if you want:

![Logo](img/objectBrowser.png)

```jsx
<ObjectBrowser
    foldersFirst={this.props.foldersFirst}
    imagePrefix={this.props.imagePrefix || this.props.prefix} // prefix is for back compatibility
    defaultFilters={this.filters}
    dialogName={this.dialogName}
    showExpertButton={this.props.showExpertButton !== undefined ? this.props.showExpertButton : true}
    style={{ width: '100%', height: '100%' }}
    columns={this.props.columns || ['name', 'type', 'role', 'room', 'func', 'val']}
    types={this.props.types || ['state']}
    t={I18n.t}
    lang={this.props.lang || I18n.getLanguage()}
    socket={this.props.socket}
    selected={this.state.selected}
    multiSelect={this.props.multiSelect}
    notEditable={this.props.notEditable === undefined ? true : this.props.notEditable}
    name={this.state.name}
    theme={this.props.theme}
    themeName={this.props.themeName}
    themeType={this.props.themeType}
    customFilter={this.props.customFilter}
    onFilterChanged={filterConfig => {
        this.filters = filterConfig;
        window.localStorage.setItem(this.dialogName, JSON.stringify(filterConfig));
    }}
    onSelect={(selected, name, isDouble) => {
        if (JSON.stringify(selected) !== JSON.stringify(this.state.selected)) {
            this.setState({ selected, name }, () => isDouble && this.handleOk());
        } else if (isDouble) {
            this.handleOk();
        }
    }}
/>
```

#### TreeTable.ts

![Logo](img/tableTree.png)

```jsx
// STYLES
const styles = {
    tableDiv: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - 48px)',
    },
};
class MyComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [
                {
                    id: 'UniqueID1', // required
                    fieldIdInData: 'Name1',
                    myType: 'number',
                },
                {
                    id: 'UniqueID2', // required
                    fieldIdInData: 'Name12',
                    myType: 'string',
                },
            ],
        };

        this.columns = [
            {
                title: 'Name of field', // required, else it will be "field"
                field: 'fieldIdInData', // required
                editable: false, // or true [default - true]
                cellStyle: {
                    // CSS style - // optional
                    maxWidth: '12rem',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                },
                lookup: {
                    // optional => edit will be automatically "SELECT"
                    value1: 'text1',
                    value2: 'text2',
                },
            },
            {
                title: 'Type', // required, else it will be "field"
                field: 'myType', // required
                editable: true, // or true [default - true]
                lookup: {
                    // optional => edit will be automatically "SELECT"
                    number: 'Number',
                    string: 'String',
                    boolean: 'Boolean',
                },
                type: 'number/string/color/oid/icon/boolean', // oid=ObjectID,icon=base64-icon
                editComponent: props => (
                    <div>
                        Prefix&#123; <br />
                        <textarea
                            rows={4}
                            style={{ width: '100%', resize: 'vertical' }}
                            value={props.value}
                            onChange={e => props.onChange(e.target.value)}
                        />
                        Suffix
                    </div>
                ),
            },
        ];
    }
    // renderTable
    render() {
        return (
            <div className={this.props.classes.tableDiv}>
                <TreeTable
                    columns={this.columns}
                    data={this.state.data}
                    onUpdate={(newData, oldData) => {
                        const data = JSON.parse(JSON.stringify(this.state.data));

                        // Added new line
                        if (newData === true) {
                            // find unique ID
                            let i = 1;
                            let id = 'line_' + i;

                            // eslint-disable-next-line
                            while (this.state.data.find(item => item.id === id)) {
                                i++;
                                id = 'line_' + i;
                            }

                            data.push({
                                id,
                                name: I18n.t('New resource') + '_' + i,
                                color: '',
                                icon: '',
                                unit: '',
                                price: 0,
                            });
                        } else {
                            // existing line was modifed
                            const pos = this.state.data.indexOf(oldData);
                            if (pos !== -1) {
                                Object.keys(newData).forEach(attr => (data[pos][attr] = newData[attr]));
                            }
                        }

                        this.setState({ data });
                    }}
                    onDelete={oldData => {
                        console.log('Delete: ' + JSON.stringify(oldData));
                        const pos = this.state.data.indexOf(oldData);
                        if (pos !== -1) {
                            const data = JSON.parse(JSON.stringify(this.state.data));
                            data.splice(pos, 1);
                            this.setState({ data });
                        }
                    }}
                />
            </div>
        );
    }
}
```

#### Toast

<!-- TODO: Provide screenshot here -->

Toast is not a part of `adapter-react` but it is an example how to use toast in application:

```jsx
import { Component } from 'react';
import { Snackbar } from '@mui/material';

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // ....
            toast: '',
        };
    }

    // ...
    renderToast() {
        if (!this.state.toast) {
            return null;
        }
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={true}
                autoHideDuration={6000}
                onClose={() => this.setState({ toast: '' })}
                ContentProps={{ 'aria-describedby': 'message-id' }}
                message={<span id="message-id">{this.state.toast}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        className={this.props.classes.close}
                        onClick={() => this.setState({ toast: '' })}
                    >
                        <IconClose />
                    </IconButton>,
                ]}
            />
        );
    }

    render() {
        return <div>{this.renderToast()}</div>;
    }
}
```

## List of adapters that use adapter-react

-   Admin
-   Backitup
-   iot
-   echarts
-   text2command
-   scenes
-   javascript
-   devices
-   eventlist
-   cameras
-   web
-   vis-2
-   vis-2-widgets-xxx
-   fullcalendar
-   openweathermap

## Usability

In dialogs, the OK button is first (on the left) and the cancel button is last (on the right)

## Used icons

This project uses icons from [Flaticon](https://www.flaticon.com/).

ioBroker GmbH has a valid license for all the used icons.
The icons may not be reused in other projects without the proper flaticon license or flaticon subscription.

## Migration instructions

You can find the migration instructions:

-   [from adapter-react-v5@6.x to adapter-react-v5@7.x](MIGRATION_6_7.md)
-   [from adapter-react-v5@5.x to adapter-react-v5@6.x](MIGRATION_5_6.md)
-   [from adapter-react to adapter-react-v5@5.x](MIGRATION_4_5.md)

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

## Changelog
### **WORK IN PROGRESS**

-   (bluefox) Updated socket classes

### 7.1.1 (2024-09-13)

-   (bluefox) Corrected TabContainer

### 7.1.0 (2024-09-12)

-   (bluefox) Optimized the icon picker
-   (bluefox) Used common eslint-config

### 7.0.2 (2024-09-10)

-   (bluefox) Showed the context menu under cursor position in the object browser
-   (bluefox) Added links to aliases in the object browser

### 7.0.1 (2024-08-29)

-   (bluefox) Updated the object browser
-   (bluefox) Used MUI Library 6.0

### 6.1.10 (2024-08-30)

-   (bluefox) Updated the object browser

### 6.1.9 (2024-08-14)

-   (bluefox) Updated JSON schema

### 6.1.8 (2024-08-03)

-   (bluefox) Added translations

### 6.1.6 (2024-07-23)

-   (bluefox) Optimize package

### 6.1.5 (2024-07-20)

-   (bluefox) Added sources to package

### 6.1.3 (2024-07-20)

-   (bluefox) Better typing of legacy connection

### 6.1.1 (2024-07-16)

-   (bluefox) Added translations

### 6.1.0 (2024-07-15)

-   (bluefox) Replace by CRON to text the package to `cronstrue`

### 6.0.19 (2024-07-14)

-   (bluefox) added some packages for federation

### 6.0.17 (2024-07-14)

-   (bluefox) Allowed playing mp3 files in the file browser
-   (bluefox) Corrected jump by object selection

### 6.0.14 (2024-07-07)

-   (bluefox) Corrected theme type selection

### 6.0.13 (2024-06-30)

-   (bluefox) Corrected color picker

### 6.0.12 (2024-06-29)

-   (bluefox) Added support for the overrides in the theme

### 6.0.10 (2024-06-27)

-   (bluefox) Added translation
-   (bluefox) Mobile object browser improved

### 6.0.9 (2024-06-26)

-   (bluefox) Corrected Icons

### 6.0.8 (2024-06-26)

-   (bluefox) Corrected types of the select ID dialog
-   (bluefox) Made the tooltips neutral to the pointer events

### 6.0.6 (2024-06-24)

-   (bluefox) Synchronised with admin
-   (bluefox) Added translations for time scheduler

### 6.0.4 (2024-06-21)

-   (bluefox) Removed the usage of `withStyles` in favor of `sx` and `style` properties (see [Migration from v5 to v6](#migration-from-v5-to-v6)
-   (bluefox) (BREAKING) Higher version of `@mui/material` (5.15.20) is used

### 5.0.8 (2024-06-15)

-   (bluefox) Added `modulefederation.admin.config.js` for module federation

### 5.0.5 (2024-06-10)

-   (bluefox) Sources were synchronized with admin

### 5.0.4 (2024-06-07)

-   (bluefox) Added better typing

### 5.0.2 (2024-05-30)

-   (bluefox) Added better typing
-   (bluefox) Json-Config is now a separate package and must be installed additionally

### 5.0.0 (2024-05-29)

-   (bluefox) Types are now exported
-   (bluefox) Translator renamed to Translate
-   (bluefox) Breaking: Theme renamed to IobTheme because of the naming conflict

### 4.13.24 (2024-05-25)

-   (bluefox) Updated packages

-   ### 4.13.22 (2024-05-23)
-   (bluefox) Updated packages

### 4.13.20 (2024-05-22)

-   (bluefox) Better types added
-   (bluefox) updated theme definitions
-   (bluefox) corrected dates in cron dialog

### 4.13.14 (2024-05-19)

-   (bluefox) Updated packages

### 4.13.13 (2024-05-09)

-   (bluefox) Updated ioBroker types

### 4.13.12 (2024-05-06)

-   (bluefox) All files are migrated to Typescript

### 4.13.11 (2024-04-23)

-   (bluefox) Corrected the size of icons

### 4.13.10 (2024-04-22)

-   (bluefox) Migrated all icons to Typescript

### 4.13.9 (2024-04-20)

-   (bluefox) Updated socket-client package

### 4.13.8 (2024-04-19)

-   (bluefox) Corrected CRON selector

### 4.13.7 (2024-04-19)

-   (bluefox) Migrated ColorPicker to typescript

### 4.13.6 (2024-04-11)

-   (bluefox) Migrated TreeTable to typescript
-   (bluefox) corrected the object subscription

### 4.13.5 (2024-04-02)

-   (bluefox) used new connection classes
-   (bluefox) Improved the `SelectID` dialog

### 4.13.3 (2024-04-01)

-   (bluefox) used new connection classes

### 4.12.3 (2024-03-30)

-   (bluefox) Migrated legacy connection to typescript

### 4.12.2 (2024-03-25)

-   (bluefox) Added support for remote cloud

### 4.11.6 (2024-03-19)

-   (bluefox) Corrected rendering of LoaderMV

### 4.11.4 (2024-03-18)

-   (bluefox) Corrected types of IconPicker

### 4.11.3 (2024-03-17)

-   (bluefox) Made filters for the file selector dialog optional

### 4.11.2 (2024-03-16)

-   (bluefox) Migrated GenericApp to typescript

### 4.10.4 (2024-03-16)

-   (bluefox) Migrated some components to typescript

### 4.10.1 (2024-03-11)

-   (bluefox) Migrated some components to typescript

### 4.9.11 (2024-03-08)

-   (foxriver76) type GenericApp socket correctly

### 4.9.10 (2024-02-21)

-   (bluefox) translations
-   (bluefox) updated JSON config

### 4.9.9 (2024-02-16)

-   (foxriver76) also check plugin state of instance to see if Sentry is explicitly disabled

### 4.9.8 (2024-02-13)

-   (bluefox) allowed hiding wizard in cron dialog

### 4.9.7 (2024-02-03)

-   (foxriver76) allow passing down the instance number do avoid determining from url

### 4.9.5 (2024-01-01)

-   (foxriver76) make `copyToClipboard` event parameter optional

### 4.9.4 (2024-01-01)

-   (foxriver76) try to fix `SelectID` scrolling

### 4.9.2 (2023-12-30)

-   (foxriver76) bump version of `@iobroker/json-config`

### 4.9.1 (2023-12-22)

-   (foxriver76) `@iobroker/json-config` moved to real dependencies

### 4.9.0 (2023-12-22)

-   (foxriver76) migrate to `@iobroker/json-config` module to have a single point of truth
-   (bluefox) Allowed using of `filterFunc` as string

### 4.8.1 (2023-12-14)

-   (bluefox) Added Device manager to JSON Config

### 4.7.15 (2023-12-12)

-   (bluefox) Corrected parsing of a text

### 4.7.13 (2023-12-10)

-   (bluefox) Added possibility to define the root style and embedded property

### 4.7.11 (2023-12-06)

-   (bluefox) Extended color picker with "noInputField" option

### 4.7.9 (2023-12-04)

-   (bluefox) Corrected the icon picker

### 4.7.8 (2023-12-04)

-   (foxriver76) port to `@iobroker/types`

### 4.7.6 (2023-11-29)

-   (bluefox) Added translations

### 4.7.5 (2023-11-28)

-   (bluefox) Corrected subscribe on objects in the legacy connection

### 4.7.4 (2023-11-23)

-   (bluefox) Updated packages
-   (bluefox) Made getStates method in legacy connection compatible with new one

### 4.7.3 (2023-11-08)

-   (bluefox) Updated packages

### 4.7.2 (2023-11-03)

-   (foxriver76) fixed problem with color picker, where editing TextField was buggy
-   (foxriver76) fixed light mode color of a path in FileBrowser

### 4.7.0 (2023-10-31)

-   (bluefox) Synced with admin
-   (bluefox) Added GIF to image files

### 4.6.7 (2023-10-19)

-   (bluefox) Added return value for `subscribeOnInstance` for Connection class

### 4.6.6 (2023-10-13)

-   (bluefox) Fixed the legacy connection

### 4.6.5 (2023-10-12)

-   (foxriver76) fixed object browser with date

### 4.6.4 (2023-10-11)

-   (bluefox) Updated the packages

### 4.6.3 (2023-10-09)

-   (bluefox) Just updated the packages
-   (bluefox) Synced with admin

### 4.6.2 (2023-09-29)

-   (bluefox) Experimental feature added: update states on re-subscribe

### 4.5.5 (2023-09-27)

-   (bluefox) Added export for IconNoIcon

### 4.5.4 (2023-09-17)

-   (bluefox) Added the restricting to folder property for select file dialog

### 4.5.3 (2023-08-20)

-   (foxriver76) fixed css classes of TableResize, see https://github.com/ioBroker/ioBroker.admin/issues/1860

### 4.5.2 (2023-08-20)

-   (foxriver76) added missing export of TableResize

### 4.5.1 (2023-08-19)

-   (foxriver76) fix dialog TextInput

### 4.5.0 (2023-08-18)

-   (bluefox) Synchronize components with admin

### 4.4.8 (2023-08-17)

-   (bluefox) Added translations

### 4.4.7 (2023-08-10)

-   (bluefox) Added `subscribeStateAsync` method to wait for answer
-   (bluefox) Added support for arrays for un/subscriptions

### 4.4.5 (2023-08-01)

-   (bluefox) Updated packages

### 4.3.3 (2023-07-28)

-   (bluefox) Added translations

### 4.3.0 (2023-07-19)

-   (bluefox) Updated packages
-   (bluefox) Added translations
-   (bluefox) Synced object browser
-   (bluefox) formatting

### 4.2.1 (2023-07-17)

-   (bluefox) Updated packages
-   (bluefox) Added translations

### 4.2.0 (2023-07-07)

-   (bluefox) Updated packages
-   (bluefox) Added new method `getObjectsById` to the socket communication

### 4.1.2 (2023-06-20)

-   (bluefox) Allowed setting theme name directly by theme toggle

### 4.1.0 (2023-05-10)

-   (bluefox) `craco-module-federation.js` was added. For node 16

### 4.0.27 (2023-05-09)

-   (bluefox) Allowed showing only specific root in SelectIDDialog

### 4.0.26 (2023-05-08)

-   (bluefox) Added IDs to the buttons in the dialog for GUI tests

### 4.0.25 (2023-04-23)

-   (bluefox) Extended `TextWithIcon` with defined color and icon

### 4.0.24 (2023-04-03)

-   (bluefox) Updated the file selector in tile mode

### 4.0.23 (2023-03-27)

-   (bluefox) Added translations

### 4.0.22 (2023-03-22)

-   (bluefox) Re-Activate legacy connection

### 4.0.21 (2023-03-22)

-   (bluefox) Added translations

### 4.0.20 (2023-03-21)

-   (bluefox) Color picker was improved

### 4.0.19 (2023-03-20)

-   (bluefox) Packages were updated
-   (bluefox) Added new translations

### 4.0.18 (2023-03-16)

-   (bluefox) Packages were updated

### 4.0.17 (2023-03-15)

-   (bluefox) Added translations
-   (bluefox) Added port controller to JSON config

### 4.0.15 (2023-03-12)

-   (bluefox) Updated the object browser and file browser

### 4.0.14 (2023-03-03)

-   (bluefox) added handler of alert messages

### 4.0.13 (2023-02-15)

-   (bluefox) Corrected the theme button

### 4.0.12 (2023-02-15)

-   (bluefox) made the fix for `echarts`

### 4.0.11 (2023-02-14)

-   (bluefox) Updated packages
-   (bluefox) The `chartReady` event was omitted

### 4.0.10 (2023-02-10)

-   (bluefox) Updated packages
-   (bluefox) made the fix for `material`

### 4.0.9 (2023-02-02)

-   (bluefox) Updated packages

### 4.0.8 (2022-12-19)

-   (bluefox) Extended socket with `log` command

### 4.0.6 (2022-12-19)

-   (bluefox) Corrected URL for the connection

### 4.0.5 (2022-12-14)

-   (bluefox) Added support of custom palette for color picker

### 4.0.2 (2022-12-01)

-   (bluefox) use `@iobroker/socket-client` instead of `Connection.tsx`

### 3.5.3 (2022-11-30)

-   (bluefox) Improved `renderTextWithA` function to support `<b>` and `<i>` tags

### 3.5.2 (2022-11-30)

-   (bluefox) updated json config component

### 3.4.1 (2022-11-29)

-   (bluefox) Added button text for message dialog

### 3.4.0 (2022-11-29)

-   (bluefox) Added file selector

### 3.3.0 (2022-11-26)

-   (bluefox) Added subscribe on files

### 3.2.7 (2022-11-13)

-   (bluefox) Added `fullWidth` property to `Dialog`

### 3.2.6 (2022-11-08)

-   (xXBJXx) Improved TreeTable component

### 3.2.5 (2022-11-08)

-   (bluefox) Added the role filter for the object browser

### 3.2.4 (2022-11-03)

-   (bluefox) Added support for alfa channel for `invertColor`

### 3.2.3 (2022-10-26)

-   (bluefox) Corrected expert mode for object browser

### 3.2.2 (2022-10-25)

-   (bluefox) Added support for prefixes for translations

### 3.2.1 (2022-10-24)

-   (bluefox) Corrected color inversion

### 3.2.0 (2022-10-19)

-   (bluefox) Added ukrainian translation

### 3.1.35 (2022-10-17)

-   (bluefox) small changes for material

### 3.1.34 (2022-08-24)

-   (bluefox) Implemented fallback to english by translations

### 3.1.33 (2022-08-24)

-   (bluefox) Added support for onchange flag

### 3.1.30 (2022-08-23)

-   (bluefox) Added method `getCompactSystemRepositories`
-   (bluefox) corrected error in `ObjectBrowser`

### 3.1.27 (2022-08-01)

-   (bluefox) Disable file editing in FileViewer

### 3.1.26 (2022-08-01)

-   (bluefox) Added translations
-   (bluefox) JSON schema was extended with missing definitions

### 3.1.24 (2022-07-28)

-   (bluefox) Updated file browser and object browser

### 3.1.23 (2022-07-25)

-   (bluefox) Extend custom filter for object selector

### 3.1.22 (2022-07-22)

-   (bluefox) Added i18n tools for development

### 3.1.20 (2022-07-14)

-   (bluefox) Allowed to show select dialog with the expert mode enabled

### 3.1.19 (2022-07-08)

-   (bluefox) Allowed extending translations for all languages together

### 3.1.18 (2022-07-06)

-   (bluefox) Added translation

### 3.1.17 (2022-07-05)

-   (bluefox) Deactivate JSON editor for JSONConfig because of space

### 3.1.16 (2022-06-27)

-   (bluefox) Update object browser

### 3.1.15 (2022-06-27)

-   (bluefox) Allowed using of spaces in name

### 3.1.14 (2022-06-23)

-   (bluefox) Added translations

### 3.1.11 (2022-06-22)

-   (bluefox) Added preparations for iobroker cloud

### 3.1.10 (2022-06-22)

-   (bluefox) Added translations

### 3.1.9 (2022-06-20)

-   (bluefox) Allowed working behind reverse proxy

### 3.1.7 (2022-06-19)

-   (bluefox) Added file select dialog

### 3.1.3 (2022-06-13)

-   (bluefox) Added table with resized headers

### 3.1.2 (2022-06-09)

-   (bluefox) Added new document icon (read only)

### 3.1.1 (2022-06-09)

-   (bluefox) Allowed working behind reverse proxy

### 3.1.0 (2022-06-07)

-   (bluefox) Some german texts were corrected

### 3.0.17 (2022-06-03)

-   (bluefox) Allowed calling getAdapterInstances not for admin too

### 3.0.15 (2022-06-01)

-   (bluefox) Updated JsonConfigComponent: password, table

### 3.0.14 (2022-05-25)

-   (bluefox) Added ConfigGeneric to import

### 3.0.7 (2022-05-25)

-   (bluefox) Made the module definitions

### 3.0.6 (2022-05-25)

-   (bluefox) Added JsonConfigComponent

### 2.1.11 (2022-05-24)

-   (bluefox) Update file browser. It supports now the file changed events.

### 2.1.10 (2022-05-24)

-   (bluefox) Corrected object browser

### 2.1.9 (2022-05-16)

-   (bluefox) Corrected expert mode in object browser

### 2.1.7 (2022-05-09)

-   (bluefox) Changes were synchronized with adapter-react-v5
-   (bluefox) Added `I18n.disableWarning` method

### 2.1.6 (2022-03-28)

-   (bluefox) Added `log` method to connection
-   (bluefox) Corrected translations

### 2.1.1 (2022-03-27)

-   (bluefox) Corrected error in TreeTable

### 2.1.0 (2022-03-26)

-   (bluefox) BREAKING_CHANGE: Corrected error with readFile(base64=false)

### 2.0.0 (2022-03-26)

-   (bluefox) Initial version

### 0.1.0 (2022-03-23)

-   (bluefox) Fixed theme errors

### 0.0.4 (2022-03-22)

-   (bluefox) Fixed eslint warnings

### 0.0.3 (2022-03-19)

-   (bluefox) beta version

### 0.0.2 (2022-02-24)

-   (bluefox) try to publish a first version

### 0.0.1 (2022-02-24)

-   initial commit

## License

The MIT License (MIT)

Copyright (c) 2019-2024 bluefox <dogafox@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

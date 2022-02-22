# Help ReactJS classes for adapter config
## Getting started
If you want to create the configuration page with react:
1. Create github repo for adapter.
2. execute `npx create-react-app src` . It will take a while.
3. `cd src`
4. Modify package.json file in src directory:
    - Change `name` from `src` to `ADAPTERNAME-admin` (Of course replace `ADAPTERNAME` with yours)
    - Add to devDependencies:
      ```
      "@iobroker/adapter-react": "^1.5.5",
      ```
      Versions can be higher.
      So your src/package.json should look like:
```
{
  "name": "ADAPTERNAME-admin",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "clsx": "^1.1.0",
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "react-icons": "^3.10.0",
    "react-scripts": "^3.4.4",
    "@iobroker/adapter-react": "^1.5.6",
    "del": "^6.0.0",
    "gulp": "^4.0.2"
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
  "browserslist": [
    ">0.2%",
    "not dead",
    "not ie <= 11",
    "not op_mini all"
  ]
}
```
5. Call in `src`: `npm install`
6. Copy gulpfile.js into `src`: `cp node_modules/@iobroker/adapter-react/gulpfile.js gulpfile.js`
7. Start your dummy application `npm run start` for developing or build with `npm run build` and
copy files in `build` directory to `www` or to `admin`. In the admin you must rename `index.html` to `index_m.html`.
8. You can do that with `gulp` tasks: `gulp build`, `gulp copy`, `gulp renameIndex` or  `gulp renameTab`

## Development
1. Add `socket.io` to `public/index.html`.
After

```
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
```

insert

```
<script>
    var script = document.createElement('script');
    window.registerSocketOnLoad = function (cb) {
        window.socketLoadedHandler = cb;
    };
    const parts = (window.location.search || '').replace(/^\?/, '').split('&');
    const query = {};
    parts.forEach(item => {
        const [name, val] = item.split('=');
        query[decodeURIComponent(name)] = val !== undefined ? decodeURIComponent(val) : true;
    });
    script.onload = function () { typeof window.socketLoadedHandler === 'function' && window.socketLoadedHandler(); };
    script.src = window.location.port === '3000' ? window.location.protocol + '//' + (query.host || window.location.hostname) + ':' + (query.port || 8081) + '/lib/js/socket.io.js' : '%PUBLIC_URL%/../../lib/js/socket.io.js';

    document.head.appendChild(script);
</script>
```

3. Add to App.js constructor initialization for I18n:
```
class App extends GenericApp {
    constructor(props) {
        const extendedProps = {...props};
        extendedProps.encryptedFields = ['pass']; // this parameter will be encrypted and decrypted automatically
        extendedProps.translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'zh-cn': require('./i18n/zh-cn'),
        };
        // get actual admin port
        extendedProps.socket = {port: parseInt(window.location.port, 10)};
        
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
    ...
}
```

4. Replace `index.js` with following code to support themes:
```
import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider} from '@material-ui/core/styles';
import * as serviceWorker from './serviceWorker';

import './index.css';
import App from './App';
import { version } from '../package.json';

import theme from '@iobroker/adapter-react/Theme';

console.log('iobroker.scenes@' + version);
let themeName = window.localStorage ? window.localStorage.getItem('App.theme') || 'light' : 'light';

function build() {
    return ReactDOM.render(<MuiThemeProvider theme={ theme(themeName) }>
        <App onThemeChange={_theme => {
            themeName = _theme;
            build();
        }}/>
    </MuiThemeProvider>, document.getElementById('root'));
}

build();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
```

5. Add to App.js encoding and decoding of values:
```
class App extend GenericApp {
    ...
    onPrepareLoad(settings) {
        settings.pass = this.decode(settings.pass);
    }
    onPrepareSave(settings) {
        settings.pass = this.encode(settings.pass);
    }
}
```

6. The optional step to validate the data to be saved:
```
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

### Connection.js
This is non-react class to provide the communication for socket connection with server. 

### GenericApp.js

### i18n.js

### Theme.js

### Dialogs
Some dialogs are predefined and could be used out of the box.

#### Confirm.js
<!-- TODO: Provide screenshot here -->

Usage: 
```
import React from 'react';
import ConfirmDialog from '@iobroker/adapter-react/Dialogs/Confirm'
import I18n from '@iobroker/adapter-react/i18n';

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
        return <ConfirmDialog
            title={ I18n.t('Scene will be overwritten.') }
            text={ I18n.t('All data will be lost. Confirm?') }
            ok={ I18n.t('Yes') }
            cancel={ I18n.t('Cancel') }
            suppressQuestionMinutes={5}
            dialogName="myConfirmDialogThatCouldBeSuppressed"
            suppressText={I18n.t('Suppress question for next %s minutes', 5)}
            onClose={isYes => {
                this.setState({ confirmDialog: false} );
            }}
        />;
    }
    render() {
        return <div>
            <Button onClick={ () => this.setState({confirmDialog: true}) }>Click</Button>
            { this.renderConfirmDialog() }
        </div>
    }
}

export default ExportImportDialog;
```

#### Error.js
<!-- TODO: Provide screenshot here -->

#### Message.js
<!-- TODO: Provide screenshot here -->
```
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

#### SelectID.js
![Logo](img/selectID.png)
```
import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';

class MyComponent extends Component {
   constructor(props) {
      super(props);
      this.state = {
         showSelectId: false,
      };
   }

   renderSelectIdDialog() {
        if (this.state.showSelectId) {
            return <DialogSelectID
                key="tableSelect"
                imagePrefix="../.."
                dialogName={this.props.adapterName}
                themeType={this.props.themeType}
                socket={this.props.socket}
                statesOnly={true}
                selected={this.state.selectIdValue}
                onClose={() => this.setState({showSelectId: false})}
                onOk={(selected, name) => {
                    this.setState({showSelectId: false, selectIdValue: selected});                 
                }}
            />;
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

```
function renderCron() {
   if (!showCron) {
      return null;
   } else {   
      return <DialogCron
          key="dialogCron1"
          cron={this.state.cronValue || '* * * * *'}
          onClose={() => this.setState({ showCron: false })}
          onOk={cronValue => {
               this.setState({ cronValue })
          }}
      />;
   }
}
```

### Components

#### Utils.js
##### getObjectNameFromObj
`getObjectNameFromObj(obj, settings, options, isDesc)`

Get object name from single object.

Usage: `Utils.getObjectNameFromObj(this.objects[id], null, {language: I18n.getLanguage()})`

##### getObjectIcon
`getObjectIcon(id, obj)`

Get icon from the object.

Usage: 
```
const icon = Utils.getObjectIcon(id, this.objects[id]);
return (<img src={icon}/>);
```

##### isUseBright
`isUseBright(color, defaultValue)`

Usage: `

#### Loader.js
![Logo](img/loader.png)

```
render() {
     if (!this.state.loaded) {
         return <MuiThemeProvider theme={this.state.theme}>
             <Loader theme={this.state.themeType}/>
         </MuiThemeProvider>;
     }
     // render loaded data
}

```

#### Logo.js
![Logo](img/logo.png)

```
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

#### Router.js

#### ObjectBrowser.js
It is better to use `Dialog/SelectID`, but if you want:

![Logo](img/objectBrowser.png)

```
<ObjectBrowser
   foldersFirst={ this.props.foldersFirst }
   imagePrefix={ this.props.imagePrefix || this.props.prefix } // prefix is for back compatibility
   defaultFilters={ this.filters }
   dialogName={this.dialogName}
   showExpertButton={ this.props.showExpertButton !== undefined ? this.props.showExpertButton : true }
   style={ {width: '100%', height: '100%'} }
   columns={ this.props.columns || ['name', 'type', 'role', 'room', 'func', 'val'] }
   types={ this.props.types || ['state'] }
   t={ I18n.t }
   lang={ this.props.lang || I18n.getLanguage() }
   socket={ this.props.socket }
   selected={ this.state.selected }
   multiSelect={ this.props.multiSelect }
   notEditable={ this.props.notEditable === undefined ? true : this.props.notEditable }
   name={ this.state.name }
   themeName={ this.props.themeName }
   themeType={ this.props.themeType }
   customFilter={ this.props.customFilter }
   onFilterChanged={ filterConfig => {
      this.filters = filterConfig;
      window.localStorage.setItem(this.dialogName, JSON.stringify(filterConfig));
   } }
   onSelect={ (selected, name, isDouble) => {
      if (JSON.stringify(selected) !== JSON.stringify(this.state.selected)) {
          this.setState({selected, name}, () =>
              isDouble && this.handleOk());
      } else if (isDouble) {
          this.handleOk();
      }
   } }
/>
```

#### TreeTable.js
![Logo](img/tableTree.png)

```
// STYLES
const styles = theme => ({
    tableDiv: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - 48px)',
    },
});
class MyComponent extends Component {
   constructor(props) {
      super(props);
      
      this.state = {
          data: [
             {
                 id: 'UniqueID1' // required
                 fieldIdInData: 'Name1',
                 myType: 'number',
             },
             {
                 id: 'UniqueID2' // required
                 fieldIdInData: 'Name12',
                 myType: 'string',
             },
         ],
      };
      
      this.columns = [
          {
              title: 'Name of field', // required, else it will be "field"
              field: 'fieldIdInData', // required
              editable: false,        // or true [default - true]
              cellStyle: {            // CSS style - // optional
                  maxWidth: '12rem',
                  overflow: 'hidden',
                  wordBreak: 'break-word'
              },
              lookup: {               // optional => edit will be automatically "SELECT"
                  'value1': 'text1',
                  'value2': 'text2',
              }
          },
          {
              title: 'Type',          // required, else it will be "field"
              field: 'myType',        // required
              editable: true,         // or true [default - true]
              lookup: {               // optional => edit will be automatically "SELECT"
                  'number': 'Number',
                  'string': 'String',
                  'boolean': 'Boolean',
              },
              type: 'number/string/color/oid/icon/boolean', // oid=ObjectID,icon=base64-icon
              editComponent: props =>
                  <div>Prefix&#123; <br/>
                      <textarea
                          rows={4}
                          style={{width: '100%', resize: 'vertical'}}
                          value={props.value}
                          onChange={e => props.onChange(e.target.value)}
                      />
                      Suffix
                  </div>,
          },
      ];
   }
   // renderTable
   render() {
       return <div className={this.props.classes.tableDiv}>
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
                        while(this.state.data.find(item => item.id === id)) {
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
                            Object.keys(newData).forEach(attr => data[pos][attr] = newData[attr]);
                        }
                    }

                    this.setState({data});
               }}
               onDelete={oldData => {
                    console.log('Delete: ' + JSON.stringify(oldData));
                    const pos = this.state.data.indexOf(oldData);
                    if (pos !== -1) {
                        const data = JSON.parse(JSON.stringify(this.state.data));
                        data.splice(pos, 1);
                        this.setState({data});
                    }
                }}
           />
       </div>;
   }
}
```

#### Toast
<!-- TODO: Provide screenshot here -->

Toast is not a part of `adapter-react` but it is an example how to use toast in application: 

```
import Snackbar from '@material-ui/core/Snackbar';

class MyComponent {
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
     return <Snackbar
          anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
          }}
          open={true}
          autoHideDuration={6000}
          onClose={() => this.setState({toast: ''})}
          ContentProps={{'aria-describedby': 'message-id'}}
          message={<span id="message-id">{this.state.toast}</span>}
          action={[
              <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  className={this.props.classes.close}
                  onClick={() => this.setState({toast: ''})}
              >
                  <IconClose />
              </IconButton>,
          ]}
      />;
 }
 render() {
   return <div>
      {this.renderToast()}
   </div>;
 }
}
```

## List of adapters, that uses adapter-react
- Admin
- iot
- echarts
- text2command
- scenes
- javascript
- devices
- eventlist

## Usability
In dialogs the OK button is first (on the left) and the cancel button is last (on the right)

## Used icons
This project uses icons from [Flaticon](https://www.flaticon.com/).

ioBroker GmbH has a valid license for all of used icons.
The icons may not be reused in other projects without the proper flaticon license or flaticon subscription.

<!--
	Placeholder for the next version (at the beginning of the line):
	### __WORK IN PROGRESS__
-->

## Changelog
### 2.0.21 (2022-02-16)
* (bluefox) Fixed the theme toggle

### 2.0.20 (2022-02-16)
* (bluefox) Added rename and delete functions for web applications

### 2.0.19 (2022-02-14)
* (bluefox) Corrected function `getSvgFromData` in Image object

### 2.0.18 (2022-02-09)
* (bluefox) Removed deprecated option "disableBackdropClick"

### 2.0.17 (2022-01-29)
* (bluefox) Added logout command

### 2.0.16 (2022-01-28)
* (bluefox) Allowed calling getGroups in web applications too

### 2.0.15 (2022-01-18)
* (bluefox) Added the preparation for vis

### 2.0.14 (2021-10-30)
* (bluefox) Added the theme switch button 
* (bluefox) Added new theme for vendor

### 2.0.13 (2021-09-11)
* (bluefox) Small fix for the saving

### 2.0.12 (2021-09-03)
* (bluefox) Allowed to use the filter function for SelectID dialog.

### 2.0.11 (2021-09-02)
* (bluefox) Added scrollbar in the CRON dialog

### 2.0.10 (2021-08-31)
* (bluefox) Allowed the managing sentry settings

### 2.0.9 (2021-08-11)
* (bluefox) Updated the objects browser

### 2.0.8 (2021-07-31)
* (bluefox) Added list of themes

### 2.0.6 (2021-07-29)
* (bluefox) Added the vendor support

### 2.0.4 (2021-07-26)
* (bluefox) Added the formula icon

### 2.0.3 (2021-07-20)
* (bluefox) Fixed communication with admin4

### 2.0.1 (2021-07-13)
* (bluefox) Breaking change: Update @material-ui/core to 4.12.x
* (bluefox) Fix getForeignObjects for web

### 1.6.31 (2021-07-12)
* (bluefox) Changed the filter of objects

### 1.6.30 (2021-06-30)
* (bluefox) Corrected the export of objects in object list

### 1.6.29 (2021-06-27)
* (bluefox) Corrected translations

### 1.6.28 (2021-06-11)
* (bluefox) Corrected the "Select with icon" component

### 1.6.27 (2021-06-10)
* (bluefox) Corrected some errors in connection

### 1.6.26 (2021-06-06)
* (bluefox) Fixed the icon selector component

### 1.6.25 (2021-06-05)
* (bluefox) Fixed the icon selector component
* (UncleSamSwiss) Added @material-ui/icons dependency.

### 1.6.24 (2021-06-04)
* (bluefox) Added the clear button to the CRON dialog

### 1.6.23 (2021-06-03)
* (bluefox) Added the icon selector component

### 1.6.22 (2021-05-24)
* (bluefox) Fixed the object subscription
* (bluefox) Fixed the encryption and decryption of the native fields

### 1.6.21 (2021-05-19)
* (bluefox) Fixed the layout for the "selectID" dialog

### 1.6.20 (2021-05-16)
* (bluefox) Make it admin4 compatible

### 1.6.19 (2021-05-16)
* (bluefox) Fixed the load of system configuration

### 1.6.18 (2021-05-16)
* (bluefox) Added the rendering of `<br>` too in texts

### 1.6.17 (2021-05-14)
* (bluefox) Updated save buttons on the bottom

### 1.6.16 (2021-05-12)
* (bluefox) Updated the CRON dialog

### 1.6.15 (2021-05-10)
* (UncleSamSwiss) Fixed: Dependencies of produced npm package now contain all required packages
* (bluefox) Fixed translations

### 1.6.14 (2021-05-06)
* (bluefox) Fixed translations

### 1.6.13 (2021-05-05)
* (bluefox) Fixed translations
* (bluefox) Added two new components: SelectWithIcon, TextWithIcon

### 1.6.12 (2021-05-02)
* (bluefox) Fixed translations

### 1.6.11 (2021-05-01)
* (bluefox) Allowed to change the color of object icons.

### 1.6.10 (2021-04-22)
* (bluefox) Fixed some errors in the object browser

### 1.6.9 (2021-04-17)
* (bluefox) Updated the expert icon

### 1.6.8 (2021-03-31)
* (bluefox) The save buttons are moved into new component

### 1.6.7 (2021-03-29)
* (bluefox) The object browser was updated

### 1.6.6 (2021-03-22)
* (bluefox) Fix error with `getAdapterInstances`

### 1.6.5 (2021-03-19)
* (bluefox) Fix error with `getAdapterInstances(true)`

### 1.6.4 (2021-03-18)
* (bluefox) Added CRON dialogs

### 1.6.3 (2021-03-07)
* (bluefox) Added "restartController" function

### 1.6.2 (2021-03-01)
* (bluefox) Added Icon component.

### 1.6.1 (2020-12-27)
* (bluefox) Allow checking the configuration before the saving.

### 1.6.0 (2020-12-27)
* (bluefox) merged changes from admin
* (bluefox) all icons are outsourced

### 1.5.5 (2020-12-21)
* (bluefox) init sentry with the unique system ID.

### 1.5.4 (2020-12-19)
* (bluefox) Added table component

### 1.5.3 (2020-12-13)
* (bluefox) Corrected error in select ID dialog

### 1.5.1 (2020-12-12)
* (bluefox) The confirmation dialog could be suppressed

### 1.5.0 (2020-12-10)
* (bluefox) Added the editable table

### 1.4.11 (2020-12-05)
* (bluefox) Better multiple states selection

### 1.4.10 (2020-11-29)
* (bluefox) Added errors to the connection class

### 1.4.9 (2020-11-23)
* (bluefox) Corrected the `removeSmartName` function

### 1.4.8 (2020-11-10)
* (bluefox) Allow calls like `Utils.getObjectNameFromObj(obj, I18n.getLanguage())`

### 1.4.6 (2020-11-07)
* (bluefox) Better icon processing
* (bluefox) Added getParentId function

### 1.4.4 (2020-11-02)
* (bluefox) Fixed the React warning

### 1.4.3 (2020-10-30)
* (bluefox) Optimize the loading

### 1.4.2 (2020-10-29)
* (UncleSamSwiss) More JSDoc issues fixed

### 1.4.1 (2020-10-20)
* (UncleSamSwiss) Made Router generic
* (UncleSamSwiss) Fixed getThemeName(), it will always return a string (never null).
* (UncleSamSwiss) Fixed issue with Router DTS not properly extending React.Component<>

### 1.4.0 (2020-10-04)
* (UncleSamSwiss) added a lot of JSDoc comments and fixed some errors

## License
The MIT License (MIT)

Copyright (c) 2019-2022 bluefox <dogafox@gmail.com>

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

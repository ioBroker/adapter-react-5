# Help ReactJS classes for adapter config
You can find demo on https://github.com/ioBroker/adapter-react-demo

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

## Migration to v5
### In src/package.json => dependencies
- `"@iobroker/adapter-react": "^2.0.22",` => `"@iobroker/adapter-react-v5": "^0.0.3",`
- `"@material-ui/core": "^4.12.3",` => `"@mui/material": "^5.4.3",`
- `"@material-ui/icons": "^4.11.2",` => `"@mui/icons-material": "^5.4.2",`
- Add `"@mui/styles": "^5.4.2",`
- Add `"babel-eslint": "^10.1.0",`

### In Source files
- All `@iobroker/adapter-react/...` => `@iobroker/adapter-react-v5/...`
- All `@material-ui/icons/...` => `@mui/icons-material/...`
- Change `import { withStyles } from '@material-ui/core/styles';` => `import { withStyles } from '@mui/styles';`
- Change `import { makeStyles } from '@mui/material/styles';` => `import { makeStyles } from '@mui/styles';`
- All `@material-ui/core...` => `@mui/material...`
- Change `import { MuiThemeProvider } from '@material-ui/core/styles';` => `import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';` 
- Change all `<MuiThemeProvider theme={this.state.theme}>` to `<StyledEngineProvider injectFirst><ThemeProvider theme={this.state.theme}>`
- Rename in styles `theme.palette.type` => `theme.palette.mode`
- Add to all `TextField`, `Select`, `FormControl` the property `variant="standard"`
- Add to all `Button` that do not have `color` property: `color="grey"`
- Replace by `TextField` the `readOnly` attribute (if exists) with `InputProps={{readOnly: true}}`
- Remove px by all `theme.spacing`: `calc(100% - ${theme.spacing(4)}px)` => `calc(100% - ${theme.spacing(4)})`

If you still have questions, try to find an answer [here](https://mui.com/guides/migration-v4/).

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

## Changelog
### **WORK IN PROGRESS**
* (bluefox) Added JsonConfigComponent

### 2.1.11 (2022-05-24)
* (bluefox) Update file browser. It supports now the file changed events.

### 2.1.10 (2022-05-24)
* (bluefox) Corrected object browser

### 2.1.9 (2022-05-16)
* (bluefox) Corrected expert mode in object browser

### 2.1.7 (2022-05-09)
* (bluefox) Changes were synchronized with adapter-react-v5
* (bluefox) Added `I18n.disableWarning` method

### 2.1.6 (2022-03-28)
* (bluefox) Added `log` method to connection 
* (bluefox) Corrected translations

### 2.1.1 (2022-03-27)
* (bluefox) Corrected error in TreeTable

### 2.1.0 (2022-03-26)
* (bluefox) BREAKING_CHANGE: Corrected error with readFile(base64=false)

### 2.0.0 (2022-03-26)
* (bluefox) Initial version

### 0.1.0 (2022-03-23)
* (bluefox) Fixed theme errors

### 0.0.4 (2022-03-22)
* (bluefox) Fixed eslint warnings

### 0.0.3 (2022-03-19)
* (bluefox) beta version

### 0.0.2 (2022-02-24)
* (bluefox) try to publish first version

### 0.0.1 (2022-02-24)
* initial commit

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

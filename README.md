# MMM-WindyV2

### Fork Details:
Fork of the TheStigh's [MMM-Windv2](https://github.com/TheStigh/MMM-WindyV2) plugin for [MagicMirror](https://github.com/MichMich/MagicMirror). This fork cleans up some of the code so there's only a single WindyAPI call with a global variable used to reduce some of the complexity.

### INTRODUCTION
  his is a module for [MagicMirror](https://github.com/MichMich/MagicMirror) that adds the [Windy](https://www.windy.com/) weather map and was originally written by santi4488 as [MMM-windy](https://github.com/santi4488/MMM-windy). This is an extensive re-write that adds several new options, like adding your Lat & Lon to center on your location, setting zoom level and most importantly - adding the layer your prefer to see. You can choose from: wind, rain, clouds, temperature, pressure, currents and waves (free version). Further it now has support for voice control through [MMM-VoiceControlMe](https://github.com/Mykle1/MMM-VoiceControlMe) :)

Enjoy!

![Demo of MMM-Windv2 running through various notifications](https://github.com/jonathan-lester/MMM-WindyV2/raw/master/windyv2.gif)

#### UPDATE 12.01.2021:
- Clean up of code
- Added notification to refresh the display
- hideProgressBar and hideProgressLineOnly options for hiding parts of the Windy animation progress bar

#### UPDATE 03.03.2019:
- Added option for multiple layers to rotate with time interval

#### UPDATE 06.03.2019:
- Added support for voice control by MMM-VoiceControlMe
  - Can change between overlays
  - Can zoom in & out
  - At certain zoom level you get streets rather than just colors

#### UPDATE 07.03.2019:
- Added css to show weatherscale data in lower right corner
- Added support for different metrics

#### UPDATE 09.03.2019:
- Added support for play weather animation by voice control
- Added support for retaining zoom level between changing layers
- CSS cleanups
- Bugfixes

... commands for voice are at the bottom of this Readme

### TO-DO:
- Add support for voice control from MMM-AssistantMk2

### CONFIGURATION
You will need to get your own API key which can be obtained [here](https://api4.windy.com/api-key).
  o use the module, add the following to the modules array in your `config/config.js` file:
```js
{
  module: "MMM-WindyV2",
  position: 'fullscreen_above', // this must be set to 'fullscreen_above'
    config: {
    apiKey: 'YOUR API KEY',     // insert your free or paid API key here
      initLoadDelay: 50,        // optional, default is 50 milliseconds
      latitude: YOUR LATITUDE,  // example: 69.123
      longitude: YOUR LONGITUDE,// example: 17.123
      zoomLevel: 6,             // set your preferred zoom level
      showLayer: 'rain',        // wind, rain, clouds, temp, pressure, currents, waves
    rotateLayers: false,        // set to true to rotate layers
    layersToRotate: ['wind','rain'],   // layers to rotate
    delayRotate: 5000,      // delay between rotated layers, in milliseconds
    wMinZoom: 3,            // set minimum zoom level for WindyV2
    wMaxZoom: 17,           // set maximum zoom level for WindyV2
    windyMetric: 'm/s',     // 'kt', 'bft', 'm/s', 'km/h' and 'mph'
    updateTimer: 60 * 60 * 1000 * 6, // update per 6 hours
    retainZoom: true,       // retain zoomlevel between changing overlays
    hideProgressBar: false, // Hide enite progress bar section on the bottom of the screen
    hideProgressLineOnly: true  // Hide only the progress line and leave the timecode
  }
},
```

### TRIGGERING EVENTS WITH THE NOTIFICATION API
Using Jopyth's [MMM-Remote-Control](https://github.com/Jopyth/MMM-Remote-Control) API interface you can send notifications to the MMM-Windyv2 module to trigger various events.
### Example configuration for MMM config.js:
```js
{
  module: 'MMM-Remote-Control',
  // uncomment the following line to show the URL of the remote control on the mirror
  // position: 'bottom_left',
  // you can hide this module afterwards from the remote control itself
  config: {
    customCommand: {}, // Optional, See "Using Custom Commands" below
    showModuleApiMenu: true, // Optional, Enable the Module Controls menu
    secureEndpoints: true, // Optional, See API/README.md
    // uncomment any of the lines below if you're gonna use it
    // customMenu: "custom_menu.json", // Optional, See "Custom Menu Items" below
    apiKey: "<MMM-Remote-Control apiKey>", // Optional, See API/README.md for details
    // classes: {} // Optional, See "Custom Classes" below
  }
},
```

### Usage with curl:
You can then issue commands to the MMM-Windyv2 plugin by using curl. See https://documenter.getpostman.com/view/6167403/Rzfni66c and https://github.com/Jopyth/MMM-Remote-Control/blob/master/API/README.md for more information.
```bash
curl --location --request GET 'http://localhost:8080/api/notification/<NOTIFICATION TO SEND>?apiKey=<your MMM-Remote-Control apiKey>' --data-raw ''
curl --location --request GET 'http://localhost:8080/api/notification/MMM-WINDYV2UPDATE?apiKey=<your MMM-Remote-Control apiKey>' --data-raw ''
curl --location --request GET 'http://localhost:8080/api/notification/CHANGEWIND?apiKey=<your MMM-Remote-Control apiKey>' --data-raw ''
```
  he following notification commands are implemented. Note, that these notifications get sent to all modules, so if you implement something new be sure to pick a reasonably unique notification.
* MMM-WINDYV2REFRESH
* CHANGEWIND
* CHANGERAIN
* CHANGECLOUDS
* CHANGETEMP
* CHANGECURRENTS
* CHANGEPRESSURE
* CHANGEWAVES
* ROTATELAYER
* ZOOMIN
* ZOOMOUT
* DEFAULTZOOM
* PLAYANIMATION
* CANCELANIMATION


### VOICE-CONTROL SUPPORTED
You want to voice-control Windy, you say?
Go to [MMM-VoiceControlMe](https://github.com/Mykle1/MMM-VoiceControlMe) and follow instructions to install.
Commands to control MMM-WindyV2 are:
- show me rain
- show me temperature
- show me pressure
- show me currents
- show me waves
- show me wind
- zoom in
- zoom out
- Show default zoom  // shortcut to go back to default zoom from config.js
- Rotate layer    // start the rotation if set to true and changed zoom level
- Play animation
- Cancel animation

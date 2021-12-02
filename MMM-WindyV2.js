/**
 * @file MMM-WindyV2.js
 *
 * @inspirationalModule MMM-windy
 * @re-written by @TheStigh
 *
 * @license MIT
 *
 * @see  https://github.com/Mykle1/MMM-VoiceControlMe
 */

/**
 * @external MM       @see https://github.com/MichMich/MagicMirror/blob/master/js/main.js
 *
 * @module MMM-WindyV2
 *
 * @requires MM
 */

var currentZoom
var gWindyAPI
var gCurLayer
var gLastRefresh = 0;

Module.register('MMM-WindyV2', {

    defaults: {
        initLoadDelay: 50,
        apiKey: '',                       // insert your API key here (preferably in your config.js)
        latitude: 69.23,                  // latitude for center of map
        longitude: 17.98,                 // longitude for center of map
        zoomLevel: 6,                     // set zoom level of map
        showLayer: 'wind',                // Supported layers in free API versions are: wind, rain, clouds, temp, pressure, currents, waves
        rotateLayers: true,               // if set to 'true' it will rotate layers as specified in 'layersToRotate'
        layersToRotate: ['wind', 'rain'], // choose from wind, rain, clouds, temperature, pressure, currents, waves
        delayRotate: 5000,                // in milliseconds, default per 5 seconds
        wMinZoom: 3,                      // set minimum zoom level for WindyV2
        wMaxZoom: 17,                     // set maximum zoom level for WindyV2
        windyMetric: 'mph',               // 'kt', 'bft', 'm/s', 'km/h' and 'mph'
        updateTimer: 60 * 60 * 1000 * 6,  // update per 6 hours
        retainZoom: true,                 // retain zoomlevel between changing overlays
        hideProgressBar: false,           // Hide enite progress bar section on the bottom of the screen
        hideProgressLineOnly: true,       // Hide only the progress line and leave the timecode
        refreshLockout: 5 * 1000 * 60     // We won't refresh unless 5 minutes has passed
    },

    voice: {
        mode: 'WINDY',
        sentences: [
            'SHOW WIND',
            'SHOW RAIN',
            'SHOW CLOUDS',
            'SHOW TEMPERATURE',
            'SHOW PRESSURE',
            'SHOW CURRENTS',
            'SHOW WAVES'
        ]
    },

    getScripts: function () {
        return [
            'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js',
        ];
    },

    getDom: function () {
        var self = this;
        var wrapper = document.createElement('div');
        if (self.config.apiKey === '') {
            wrapper.innerHTML = 'Please set the windy.com <i>apiKey</i> in the config for module: ' + this.name + '.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (!self.loaded) {
            wrapper.innerHTML = this.translate('LOADING');
            wrapper.innerClassName = 'dimmed light small';
            return wrapper;
        }
        var mapDiv = document.createElement('div');
        mapDiv.id = 'windy';
        wrapper.appendChild(mapDiv);

        return wrapper;
    },

    start: function () {
        let self = this;
        Log.info('Starting module: ' + this.name);

        currentZoom = this.config.zoomLevel;

        setInterval(function () {
            self.updateDom();
            self.scheduleInit(self.config.initLoadDelay);
        }, this.config.updateTimer);

        self.loaded = false;
        var scripts = [
            'https://api.windy.com/assets/map-forecast/libBoot.js'
        ];

        var loadScripts = function (scripts) {
            var script = scripts.shift();
            var el = document.createElement('script');
            el.type = 'text/javascript';
            el.src = script;
            el.setAttribute('defer', '');
            el.setAttribute('async', '');

            el.onload = function () {
                if (scripts.length) {
                    loadScripts(scripts);
                } else {
                    self.loaded = true;
                    self.updateDom();
                    self.scheduleInit(self.config.initLoadDelay);
                }
            };
            document.querySelector('body').appendChild(el);
        };
        loadScripts(scripts);
    },

    /////////////////////////////////////////////////////////////////////////////////////
    scheduleInit: function (delay) {
        setTimeout(() => {
            const options = {
                graticule: false,
                key: this.config.apiKey,
                lat: this.config.latitude,
                lon: this.config.longitude,
                zoom: this.config.zoomLevel,
                minZoom: 3,
                maxZoom: 18,
            };

            if (!window.copy_of_W) {
                window.copy_of_W = Object.assign({}, window.W);
            }
            if (window.W.windyBoot) {
                window.W = Object.assign({}, window.copy_of_W);
            }

            windyInit(options, windyAPI => {
                if (this.config.rotateLayers) {
                    const { store, map, overlays } = windyAPI;
                    var overlayers = this.config.layersToRotate;
                    var windMetric = overlays.wind.metric;
                    overlays.wind.setMetric(this.config.windyMetric);

                    var h = overlayers.length;
                    h = h - 1;

                    gCurLayer = 0;
                    gSetInterval = setInterval(() => {
                        gCurLayer = (gCurLayer === h ? 0 : gCurLayer + 1),
                            store.set('overlay', overlayers[gCurLayer]);
                        Log.info('<<<>>> Current showing Overlay: ' + overlays);
                    }, this.config.delayRotate);
                }
                gWindyAPI = windyAPI;

                const { store, map, overlays } = windyAPI;
                var windMetric = overlays.wind.metric;
                store.set('overlay', this.config.showLayer);

                var topLayer = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ',
                    minZoom: 12,
                    maxZoom: 18
                }).addTo(map);
                topLayer.setOpacity('0');

                map.on('zoomend', function () {
                    if (map.getZoom() >= 12) {
                        topLayer.setOpacity('1');
                    } else {
                        topLayer.setOpacity('0');
                    }
                });
                overlays.wind.setMetric(this.config.windyMetric);
                map.setZoom(currentZoom);
                if (this.config.hideProgressBar) {
                    document.getElementById('progress-bar').style.display = 'none';
                }
                else if (this.config.hideProgressLineOnly) {
                    document.getElementsByClassName('progress-line')[0].style.display = 'none';
                    document.getElementById('calendar').style.display = 'none';
                }
            });
        }, delay);
    },

    /////////////////////////////////////////////////////////////////////////////////////
    notificationReceived(notification, payload, sender) {
        var windyUpdateLayer = (function (layerToDisplay) {
            const { store, map, overlays } = gWindyAPI;
            store.set('overlay', layerToDisplay);
        }).bind(this);

        if (notification === 'MMM-WINDYV2REFRESH') {
            if (gLastRefresh === 0 || Date.now() > gLastRefresh + 5 * 1000 * 60) {
                Log.error('<<<>>> Performing refresh');
                this.updateDom();
                this.scheduleInit(0);
                gLastRefresh = Date.now();
            } else {
                Log.error('<<<>>> Not refreshing, not enough time elapsed');
            }
        } else if (notification === 'CHANGEWIND') {
            windyUpdateLayer('wind');
        } else if (notification === 'CHANGERAIN') {
            windyUpdateLayer('rain');
        } else if (notification === 'CHANGECLOUDS') {
            windyUpdateLayer('clouds');
        } else if (notification === 'CHANGETEMP') {
            windyUpdateLayer('temp');
        } else if (notification === 'CHANGECURRENTS') {
            windyUpdateLayer('currents');
        } else if (notification === 'CHANGEPRESSURE') {
            windyUpdateLayer('pressure');
        } else if (notification === 'CHANGEWAVES') {
            windyUpdateLayer('waves');
        }

        /////////////////////////////////////////////////////////////////////////////////////
        else if (notification === 'ROTATELAYER') {
            const { store, map, overlays } = gWindyAPI;
            var overlayers = this.config.layersToRotate;
            var h = overlayers.length - 1;
            gCurLayer = (gCurLayer === h ? 0 : gCurLayer + 1);
            store.set('overlay', overlayers[gCurLayer]);
        }
        /////////////////////////////////////////////////////////////////////////////////////
        else if (notification === 'ZOOMOUT' || notification === 'ZOOMIN' || notification === 'DEFAULTZOOM') {
            const { store, map } = gWindyAPI;
            var zLevel = map.getZoom();
            map.options.maxZoom = 18;
            if (notification === 'ZOOMIN') {
                zLevel = zLevel + 1;
                if (zLevel > this.config.wMaxZoom) {
                    zLevel = zLevel - 1;
                };
            } else if (notification === 'ZOOMOUT') {
                zLevel = zLevel - 1;
                if (zLevel < this.config.wMinZoom) {
                    zLevel = zLevel + 1;
                };
            } else if (notification === 'DEFAULTZOOM') {
                zLevel = this.config.zoomLevel;
            }

            Log.info('<<<>>> Zoom Level is :' + map.getZoom());
            Log.info('<<<>>> zLevel Level is :' + zLevel)

            map.setZoom(zLevel);
            currentZoom = zLevel;

            /////////////////////////////////////////////////////////////////////////////////////

        } else if (notification === 'PLAYANIMATION') {
            document.getElementById('playpause').click();

            /////////////////////////////////////////////////////////////////////////////////////

        } else if (notification === 'CANCELANIMATION') {
            document.getElementById('playpause').click();
        }

    },

    getStyles: function () {
        return [
            'MMM-WindyV2.css'
        ];
    }
})

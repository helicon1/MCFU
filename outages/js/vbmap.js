jQuery.sap.declare("sap.umc.mobile.outages.js.vbmap");

sap.umc.mobile.outages.js.vbmap = {

   buildMap: function() {
	   this._iPoint = 0;
	   this._oMap = {
		   "SAPVB": {
		      "version": "2.0",
		      "xmlns:VB": "VB",
		      "Data": {
			      "Set": {
				      "N": [{
				         "name": "Premises",
				         "E": [
				         // vectors get place in here
				         ]
				      }, {
				         "name": "outageRegion",
				         "E": [
				         // vectors for outage region
				         ]
				      }, {
				         "name": "OutagesDetailWindow",
				         "E": [
				         // position binding of window
				         ]
				      }, {
				         "name": "PremisesDetailWindow",
				         "E": [
				         // position binding of window
				         ]
				      }, {
				         "name": "PremiseDetailDescription",
				         "E": [
				         // premise details binding
				         ]
				      }, {
				         "name": "Outages",
				         "E": [
				         // outages icon binding
				         ]
				      }]
			      }
		      },
		      "Resources": {
			      "Set": {
				      "Resource": [
				            {
				               "name": "premise.png",
				               "value": "iVBORw0KGgoAAAANSUhEUgAAAC4AAABYCAYAAACKwsXrAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABmFJREFUeNrMm99LW1ccwI+pgnEbxmq3SRWydZMyt5EOyoiDaVHo48yLdC8aH93LFveo4PoHaJqXPc6bvXT40gjCGEQa+6Adyha7UZhYjNO1jGIT5jBllm3ne29uPPfk3B8n59yb+4Ujyb25yed87/fX+Z4rQm5KIhtx66ubJMCF8N8hPAbxiFRGyOTT+cpYwyOHkiMF78ETWYCdwCMuMG2YRAqPDJ5EyV1wDXiuomVZUlInkBz5Sj64ZhKLeIzSp0LBZjR0qQMNvtWBIhdfRuGOIAqfbz2jKr9A+cfHqPDsOVrbLaLco6L6miFgOpN4Ajk54InsaAXaYLtDGHTiajeK48FtI38co9S9A6RsPmGdvoXhE2LgiWy8Am0Anrv+hqplYRvBdyOR2WFNALQeM7P9JhvoRdL5wCTmrr+Jvvi4V3p4gzsQW3xAmxA47zUWfMBG0wbou5994Ao0SOTiK+jnLz9Eo+9eMBzG4y7r8+csbPo2/aXh80HHICcnJ6ilpYULvrUlgG5ceQ3tY63nH/+tH34dRcfD6P63y9bgiWwY//0evgfeQnTY+PyqqnEe6IWFBRW8t7e35tze3h46OjpCwWCQObnR9y7Q8BEMv4/h81amUo0eAHtn8v26oA8OcMRQFLSxsWE4f3h4iObn59UBr81k8dN31DtNSLKiVAa4ZiLVxAKOSF3sGDoSiaC2tjYmvFOhlBaqJD6mxpNkyONxRBI6Go2iqakpND09LQQPZgrKIySuaz1Aabt6K5KfvO34BwB2ZmamCh2Px1VYEBq+p6enxu6tBJRHZmFd66TGJ0htOzURgAVNg8ZJaICE4zT89va2+p4HnqH10DmiDlGq2h7tQ5dffUkIGuT09BRtbW2p52DA683NTdTd3Y1isZh6vr293VGMh/Lg+Yt/9UO/aeDR8Rt68QTOoGCPFoXWxQq+v7/fsdb/PP4H3d//qyZzDlZjqDFzCUHTjsuyeacClScZ6gNEamV9QBhaFjyt0BpwyoOlQMuCJwNGgMxGakQxKVXhR1dWVtRwNjw8zA1tBt/X14fW19dVpdgJmcGbKkuxagX238KwI4ClpSW0urpadzUI2p6dnUWdnZ2Or4l98wBlfn1qU9Y6cFARAc1DocVb+urSjAQFEsnY2FjNpOCOqJEW+8LAwADzHP9q6dQAXhABh9IU7NRMurq6LM9zrZLOylxsKlRTxmT17TtpJtZ2akgsFMuWIZGWcrmMdnZ2pNq/1brUFHxtt8S1egdIWBS4LWAJ0BGgE9B2tSfwqOhL09DDoI4ZIHoY2ovdoi/tfNkIvqaBJ0fylf6dKml2d6lhAooEhZLm3kSsgO7opS04597sR74Bn7z90NjpSo40kZlzjZzhzR/2fKNtqj2Xo1N+xtB1vPe7L2x98ruHNeZuBNcSUYFsRjIu8lRu4eUaZdtMjddoHS6CTmojBJIN47cLlUBSA55mzVrxOMoA9LWvf2KGc3ZDiAqLpFd75aw6NJklWQGktukZHb9MLuXIjAqNSOi5QFfVLZuGHjnRhjBUtVixk1ZNz2WzLwaTuTL/o/SyAKIXrG5s/Mngf+wdiUS2iMz3KqvdLtHtFABO4bALmnaycsMaz9iBG7ZQ7JZTsIE1dCnkqG0HtgsF0/IvT+nCyfIyDN3BqsdZ5hJ36kx6nQyrcIAPd7Qadi9gyQWrl8Kzcr1JLUMfMN+8cmAuHorBTOxW+RmfQJdoaDvwlE/AFdZBc3AtGRV8AJ7mA/eHuVRrE17wlB+1bQ+ulbp5v9m3E41bztrtesvqCaKAyKxdFksztQfXnlxohJNmxMAbYy6K3TNazsC1zFXyEHzZ7gMBGR7uQuzOyARP+8G2+cG1DOZFTE/JBfcmkzp++jPgxm10I8WLgWshyi0nhbpbcQfcXSflupv84Nrjo4VGOaWIxt1w0rxZ3S0bXGmktusHl+ukdRVxIk3AtDSn5HzoXQxcnpPW5S+BRvyoiFPKAlcaNXExcDEnFVpZyejQp710Snng9TvpTZGflbUnwmurQv+8JBNc4VyTCucAOeB8LQyu8tVtjfOYi5QCTR64lkhyXhVosjcs7Ww3I+qU7oBrtlvyoo53Y4vYDK7g5J/vGgmueLFqkg+u2bDCqEsUf4OznVSoLvEOXLPlvKy6xEuNkzadkxUCvQE/C42u9Bv/F2AA0MUbgc2W8LAAAAAASUVORK5CYII="
				            },
				            {
				               "name": "outage.png",
				               "value": "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"
				            }]
			      }
		      },
		      "DataTypes": {
			      "Set": {
				      "N": [{
				         "name": "Premises",
				         "key": "Key",
				         "A": [{
				            "name": "Key",
				            "alias": "PremiseIndex",
				            "type": "string"
				         }, {
				            "name": "GeoPosition",
				            "alias": "PremiseCoordinate",
				            "type": "vector"
				         }]
				      }, {
				         "name": "outageRegion",
				         "key": "Key",
				         "A": [{
				            "name": "Color",
				            "alias": "BackgroundColor",
				            "type": "color"
				         }, {
				            "name": "BorderColor",
				            "alias": "BackgroundBorderColor",
				            "type": "color"
				         }, {
				            "name": "PosList",
				            "alias": "OutageCoordinates",
				            "type": "vectorarray"
				         }, {
				            "name": "Key",
				            "alias": "K",
				            "type": "string"
				         }]
				      }, {
				         "name": "OutagesDetailWindow",
				         "A": [{
				            "name": "GeoPosition",
				            "type": "vector",
				            "alias": "OutageCoordinates"
				         }]
				      }, {
				         "name": "PremisesDetailWindow",
				         "A": [{
				            "name": "GeoPosition",
				            "type": "vector",
				            "alias": "PremiseCoordinate"
				         }]
				      }, {
				         "name": "PremiseDetailDescription",
				         "A": [{
				            "name": "Address",
				            "type": "string",
				            "alias": "Address"
				         }]
				      }, {
				         "name": "Outages",
				         "key": "Key",
				         "A": [{
				            "name": "Key",
				            "alias": "OutageIndex",
				            "type": "string"
				         }, {
				            "name": "GeoPosition",
				            "alias": "OutageCoordinates",
				            "type": "vector"
				         }]
				      }]
			      }
		      },
		      "Windows": {
		         "Set": {
			         "Window": {
			            "id": "MainMap",
			            "caption": "Window1",
			            "type": "geo",
			            "refParent": "",
			            "modal": "true",
			            "refScene": "OutageScene"
			         }
		         },
		         "Remove": {}
		      },
		      "Scenes": {
			      "Set": {
				      "SceneGeo": {
				         "id": "OutageScene",
				         "VO": [{
				            "id": "premiseAddresses",
				            "type": "{00100000-2012-0004-B001-64592B8DB964}",
				            "datasource": "Premises",
				            "pos.bind": "Premises.GeoPosition",
				            "scale": "1.0;1.0;1.0",
				            "fxdir": "false",
				            "fxsize": "false",
				            "image": "premise.png",
				            "icon": "AA"
				         }, {
				            "id": "outageArea",
				            "type": "{00100000-2012-0004-B001-F311DE491C77}",
				            "datasource": "outageRegion",
				            "posarray.bind": "outageRegion.PosList",
				            "scale": "1.0;1.0;1.0",
				            "color.bind": "outageRegion.Color",
				            "colorBorder.bind": "outageRegion.BorderColor",
				         }, {
				            "id": "outageIcon",
				            "type": "{00100000-2012-0004-B001-64592B8DB964}",
				            "datasource": "Outages",
				            "pos.bind": "Outages.GeoPosition",
				            "scale": "1.0;1.0;1.0",
				            "fxdir": "true",
				            "fxsize": "true",
				            "image": "outage.png",
				            "icon": "AA"
				         }]
				      },
			      },

		      },
		      "Actions": {
			      "Set": {
				      "Action": [{
				         "id": "clickOutageAction",
				         "name": "CLICK_OUTAGE",
				         "refScene": "OutageScene",
				         "refVO": "outageArea",
				         "refEvent": "Click"
				      }, {
				         "id": "clickPremiseRegion",
				         "name": "CLICK_PREMISE",
				         "refScene": "OutageScene",
				         "refVO": "premiseAddresses",
				         "refEvent": "Click"
				      }]
			      }
		      },
		      "Automation": {},
		      "Script": {
			      "Set": {}
		      }
		   }
	   };
	   return this._oMap;
   },
   getOutageWindow: function(oOutage) {
	   var dDate = sap.umc.mobile.app.js.utils.formatDate(oOutage.DateTime);
	   this._oOutageDetailWindow = {
		   "SAPVB": {
		      "version": "2.0",
		      "xmlns:VB": "VB",
		      "Windows": {
		         "Remove": [{
			         "name": "OutageDetailWindow"
		         }],
		         "Set": {
		            "name": "OutageDetailWindow",
		            "Window": {
		               "id": "OutageDetailWindow",
		               "type": "callout",
		               "refParent": "MainMap",
		               "refScene": "OutageDetailScene",
		               "width": "200",
		               "height": "35",
		               "modal": "false",
		               "pos.bind": "OutagesDetailWindow.0.GeoPosition",
		            }
		         }
		      },
		      "Scenes": {
			      "Set": {
			         "name": "OutageDetailScene",
			         "Scene": {
			            "id": "OutageDetailScene",
			            "navControlVisible": "false",
			            "VO": [{
			               "type": "{00100000-2013-1000-3700-AD84DDBBB31B}",
			               "noColon": "1",
			               "left": "0",
			               "top": "0",
			               "right": "300",
			               "bottom": "20",
			               "text": jQuery.sap.formatMessage(this._getText("OUTAGES.INEFFECT"), [dDate])
			            }, {
			               "type": "{00100000-2013-1000-3700-AD84DDBBB31B}",
			               "noColon": "1",
			               "left": "0",
			               "top": "20",
			               "right": "300",
			               "bottom": "40",
			               "text": jQuery.sap.formatMessage(this._getText("OUTAGES.STATUS"), [oOutage.ContactAdditionalInfo.Description])
			            }]
			         }
			      }
		      }
		   }
	   };
	   return this._oOutageDetailWindow;
   },
   getPremiseWindow: function(iPremiseID) {
	   this._oPremiseDetailWindow = {
		   "SAPVB": {
		      "version": "2.0",
		      "xmlns:VB": "VB",
		      "Windows": {
		         "Remove": [{
			         "name": "PremiseWindow"
		         }],
		         "Set": {
		            "name": "PremiseWindow",
		            "Window": {
		               "id": "PremiseWindow",
		               "type": "callout",
		               "refParent": "MainMap",
		               "refScene": "PremiseDetailScene",
		               "modal": "false",
		               "width": "325",
		               "height": "25",
		               "pos.bind": "PremisesDetailWindow." + iPremiseID + ".GeoPosition",
		            }
		         }
		      },
		      "Scenes": {
			      "Set": {
			         "name": "PremiseDetailScene",
			         "Scene": {
			            "id": "PremiseDetailScene",
			            "navControlVisible": "false",
			            "VO": [{
			               "type": "{00100000-2013-1000-3700-AD84DDBBB31B}",
			               "noColon": "1",
			               "left": "0",
			               "top": "0",
			               "right": "300",
			               "bottom": "20",
			               "text.bind": "PremiseDetailDescription." + iPremiseID + ".Address"
			            }]
			         }
			      }
		      }
		   }
	   };
	   return this._oPremiseDetailWindow;
   },
   setServiceConfig: function(oConfig) {
	   // Adds oData Service config to UI Config
	   this._oMap.SAPVB.Config = oConfig.SAPVB.Config;
	   this._oMap.SAPVB.Scenes.Set.SceneGeo.ToolbarVisible = oConfig.SAPVB.Scenes.Set.SceneGeo.ToolbarVisible;
	   this._oMap.SAPVB.Scenes.Set.SceneGeo.refMapLayerStack = oConfig.SAPVB.Scenes.Set.SceneGeo.refMapLayerStack;
	   this._oMap.SAPVB.MapProviders = oConfig.SAPVB.MapProviders;
	   this._oMap.SAPVB.MapLayerStacks = oConfig.SAPVB.MapLayerStacks;
   },
   addPoint: function(x, y, z, oPremise) {
	   // add points to JSON Config
	   this._oMap.SAPVB.Data.Set.N[0].E.push({
	      "PremiseIndex": ++this._iPoint,
	      "PremiseCoordinate": jQuery.sap.formatMessage("{0};{1};{2}", [x, y, z])
	   });
	   // adds Window position to JSON Config
	   this._oMap.SAPVB.Data.Set.N[3].E.push({
		   "PremiseCoordinate": jQuery.sap.formatMessage("{0};{1};{2}", [x, y, z])
	   });
	   // adds Window Details to Json Config
	   var sAddress = "";
	   if (oPremise) {
		   sAddress = jQuery.sap.formatMessage(this._getText("OUTAGES.ADDRESS"), [oPremise.AddressInfo.ShortForm]);
	   }
	   this._oMap.SAPVB.Data.Set.N[4].E.push({
		   "Address": sAddress
	   });
   },
   addOutageRegion: function(sCoordinates) {
	   // Draw outage region
	   this._oMap.SAPVB.Data.Set.N[1].E.push({
	      "BackgroundColor": "ARGB(0x64;0xD8;0x00;0x00)",
	      "BackgroundBorderColor": "ARGB(0x64;0x00;0x00;0x00)",
	      "OutageCoordinates": sCoordinates
	   });
	   // Draw Detail Window
	   this._oMap.SAPVB.Data.Set.N[2].E.push({
		   "OutageCoordinates": sCoordinates
	   });
	   // Draw Outage Info icon
//	   this._oMap.SAPVB.Data.Set.N[5].E.push({
//	      "OutageIndex": 0,
//	      "OutageCoordinates": sCoordinates
//	   });
   },
   setZoomLevel: function(oVector, iZoomLevel) {
	   this._oMap.SAPVB.Scenes.Set.SceneGeo.initialStartPosition = jQuery.sap.formatMessage("{0};{1};{2}", oVector.Xpos, oVector.Ypos, oVector.Zpos);
	   this._oMap.SAPVB.Scenes.Set.SceneGeo.initialZoom = iZoomLevel.toString();
   },
   _getText: function(sProperty) {
	   return sap.ui.getCore().getModel("i18n").getProperty(sProperty);
   }
};
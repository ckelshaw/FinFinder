import express from "express";
import axios from "axios";

const router = express.Router();

// This route fetches streamflow data from the USGS API (streamflow data) based on a query parameter for river name, state, and other optional parameters.
router.get("/", async (req, res) => {
  const {
    stateCd, // State code for the river
    siteStatus, //status of the site (Will always be active)
    siteType, // type of the site (will always be stream/river)
    parameterCd, // Parameter code for streamflow (will always be 00060 which is gauging station)
    format, // Format of the response (json)
    riverName, // Name of the river we want the gauging station to be on
    siteCode, // Code of the site, if searching for a specific site
    startDate, // Start date for the data (in 'YYYY-MM-DD' format)
    endDate, // End date for the data (in 'YYYY-MM-DD' format) Start and end dates will always be the same
  } = req.query;

  if (!stateCd || !siteStatus || !siteType || !parameterCd) {
    //If any of the required parameters are missing, we return a 400 Bad Request error
    return res
      .status(400)
      .json({ error: "Missing stateCd, siteStatus, siteType, or parameterCd" });
  }
  //Base Url for the USGS API request
  let url = `https://waterservices.usgs.gov/nwis/iv/?format=${format}&siteStatus=${siteStatus}&siteType=${siteType}&parameterCd=${parameterCd}`;

  if (siteCode) {
    //If we have the siteCode we add it as that means we are searching for a specific site
    url += `&sites=${siteCode}&startDT=${startDate}&endDT=${endDate}`;
  } else {
    //If no siteCode, we add the stateCd to the URL as that means we are filtering by state
    url += `&stateCd=${stateCd}`;
  }

  try {
    const response = await axios.get(url);

    //example response is at the bottom of the file for reference of the JSON response structure

    const timeSeries = response.data?.value?.timeSeries; 

    if (!Array.isArray(timeSeries)) {
      return res.status(404).json({ error: "No streamflow data found." });
    }

    const filtered = timeSeries
      .filter((s) =>
        s.sourceInfo?.siteName?.toLowerCase().includes(riverName.toLowerCase()) // Make sure the river name is in the site name
      )
      .map((site) => {
        const flow = site.values?.[0]?.value?.[0]; //Getting the flow value
        return {
          siteName: site.sourceInfo.siteName,
          siteCode: site.sourceInfo.siteCode?.[0]?.value,
          latitude: site.sourceInfo.geoLocation.geogLocation.latitude,
          longitude: site.sourceInfo.geoLocation.geogLocation.longitude,
          flow: flow?.value || null,
          dateTime: flow?.dateTime || null,
        };
      });

    res.json(filtered);
  } catch (err) {
    console.error("USGS Water Data API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;

//{
//   "name": "ns1:timeSeriesResponseType",
//   "declaredType": "org.cuahsi.waterml.TimeSeriesResponseType",
//   "scope": "javax.xml.bind.JAXBElement$GlobalScope",
//   "value": {
//     "queryInfo": {
//       "queryURL": "http://waterservices.usgs.gov/nwis/dv/format=json&sites=13147900&startDT=2025-06-25&endDT=2025-06-25&siteStatus=active&siteType=ST",
//       "criteria": {
//         "locationParam": "[ALL:13147900]",
//         "variableParam": "ALL",
//         "timeParam": {
//           "beginDateTime": "2025-06-25T00:00:00.000",
//           "endDateTime": "2025-06-25T00:00:00.000"
//         },
//         "parameter": []
//       },
//       "note": [
//         {
//           "value": "[ALL:13147900]",
//           "title": "filter:sites"
//         },
//         {
//           "value": "[ST]",
//           "title": "filter:siteType"
//         },
//         {
//           "value": "[mode=RANGE, modifiedSince=null] interval={INTERVAL[2025-06-25T00:00:00.000-04:00/2025-06-25T00:00:00.000-04:00]}",
//           "title": "filter:timeRange"
//         },
//         {
//           "value": "methodIds=[ALL]",
//           "title": "filter:methodId"
//         },
//         {
//           "value": "2025-06-26T18:12:52.135Z",
//           "title": "requestDT"
//         },
//         {
//           "value": "2cba9c60-52b9-11f0-be87-2cea7f5e5ede",
//           "title": "requestId"
//         },
//         {
//           "value": "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
//           "title": "disclaimer"
//         },
//         {
//           "value": "sdas01",
//           "title": "server"
//         }
//       ]
//     },
//     "timeSeries": [
//       {
//         "sourceInfo": {
//           "siteName": "LITTLE WOOD RIVER AB HIGH FIVE CREEK NR CAREY ID",
//           "siteCode": [
//             {
//               "value": "13147900",
//               "network": "NWIS",
//               "agencyCode": "USGS"
//             }
//           ],
//           "timeZoneInfo": {
//             "defaultTimeZone": {
//               "zoneOffset": "-07:00",
//               "zoneAbbreviation": "MST"
//             },
//             "daylightSavingsTimeZone": {
//               "zoneOffset": "-06:00",
//               "zoneAbbreviation": "MDT"
//             },
//             "siteUsesDaylightSavingsTime": true
//           },
//           "geoLocation": {
//             "geogLocation": {
//               "srs": "EPSG:4326",
//               "latitude": 43.49305556,
//               "longitude": -114.0572222
//             },
//             "localSiteXY": []
//           },
//           "note": [],
//           "siteType": [],
//           "siteProperty": [
//             {
//               "value": "ST",
//               "name": "siteTypeCd"
//             },
//             {
//               "value": "17040221",
//               "name": "hucCd"
//             },
//             {
//               "value": "16",
//               "name": "stateCd"
//             },
//             {
//               "value": "16013",
//               "name": "countyCd"
//             }
//           ]
//         },
//         "variable": {
//           "variableCode": [
//             {
//               "value": "00060",
//               "network": "NWIS",
//               "vocabulary": "NWIS:UnitValues",
//               "variableID": 45807197,
//               "default": true
//             }
//           ],
//           "variableName": "Streamflow, ft&#179;/s",
//           "variableDescription": "Discharge, cubic feet per second",
//           "valueType": "Derived Value",
//           "unit": {
//             "unitCode": "ft3/s"
//           },
//           "options": {
//             "option": [
//               {
//                 "value": "Mean",
//                 "name": "Statistic",
//                 "optionCode": "00003"
//               }
//             ]
//           },
//           "note": [],
//           "noDataValue": -999999,
//           "variableProperty": [],
//           "oid": "45807197"
//         },
//         "values": [
//           {
//             "value": [
//               {
//                 "value": "69.4",
//                 "qualifiers": [
//                   "P"
//                 ],
//                 "dateTime": "2025-06-25T00:00:00.000"
//               }
//             ],
//             "qualifier": [
//               {
//                 "qualifierCode": "P",
//                 "qualifierDescription": "Provisional data subject to revision.",
//                 "qualifierID": 0,
//                 "network": "NWIS",
//                 "vocabulary": "uv_rmk_cd"
//               }
//             ],
//             "qualityControlLevel": [],
//             "method": [
//               {
//                 "methodDescription": "",
//                 "methodID": 45781
//               }
//             ],
//             "source": [],
//             "offset": [],
//             "sample": [],
//             "censorCode": []
//           }
//         ],
//         "name": "USGS:13147900:00060:00003"
//       }
//     ]
//   },
//   "nil": false,
//   "globalScope": true,
//   "typeSubstituted": false
// }

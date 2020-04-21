// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const firebaseConfig = {
  apiKey: 'AIzaSyAI9aRe_U3qkqLjGLcu64QAtC-iKj8ze-s',
  authDomain: 'restostore-7.firebaseapp.com',
  databaseURL: 'https://restostore-7.firebaseio.com',
  projectId: 'restostore-7',
  storageBucket: 'restostore-7.appspot.com',
  messagingSenderId: '8065511556',
  appId: '1:8065511556:web:969603b8f14ad8e881d2d1',
  measurementId: 'G-56445H3ZQP'
};
export const environment = {
  production: false,
  firebase: firebaseConfig,
  baseUrl: 'https://us-central1-restostore-7.cloudfunctions.net',
  // baseUrl: 'http://localhost:5001/restostore-7/us-central1'
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

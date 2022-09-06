const { keygen } = require("tls-keygen");
const {
  defaultSubjectAltName,
} = require("tls-keygen");

async function generateCert() {
  // Returns a promise that
// resolves with `key` and `cert` file paths.
  await keygen({
    // Default: ./key.pem
    key: "./dev/certs/key.pem",

    // Default: ./cert.pem
    cert: "./dev/certs/cert.pem",

    // Default: localhost
    commonName: "localhost",

    // Default: [
    //   'DNS:localhost',
    //   'DNS:*.localhost',
    //   'DNS:localhost.localdomain',
    //   'IP:127.0.0.1',
    //   'IP:0.0.0.0',
    //   'IP:::1',
    //   'IP:::'
    // ]
    subjectAltName: [
      ...defaultSubjectAltName,
      "IP:192.168.1.2",
    ],

    // Set to `false` to skip adding the certificate
    // to the trusted certificate store.
    // Default: true
    entrust: false,
  });
}

generateCert();
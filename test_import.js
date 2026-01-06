const fs = require('fs');

try {
  require('./src/modules/financeiro/interface/financeiro.routes.js');
  fs.writeFileSync('error_log.txt', 'OK - No errors');
} catch(e) {
  fs.writeFileSync('error_log.txt', `ERROR: ${e.message}\n\nSTACK:\n${e.stack}`);
}

console.log('Check error_log.txt');

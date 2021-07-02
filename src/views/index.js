const AuditPackage = require('./audit');
const WizardPackage = require('./wizard');
module.exports = {
    ...AuditPackage,
    ...WizardPackage,
};

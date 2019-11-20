var nodegit = require("nodegit"),
    path = require("path");

// This example opens a certain file, `README.md`, at a particular commit,
// and prints the first 10 lines as well as some metadata.
var _entry;
nodegit.Repository.open(path.resolve(__dirname, '../../../../.git'))
    .then(function (repo) {
        return repo.getCommit("5a51da2bdba1a87ce77a534e71ed2a32f3c9284c");
    })
    .then(function (commit) {
        return commit.getEntry("examples/commitTwo.js");
    })
    .then(function (entry) {
        _entry = entry;
        return _entry.getBlob();
    })
    .then(function (blob) {
        console.log(_entry.name(), _entry.sha(), blob.rawsize() + "b");
        console.log("========================================================\n\n");
        var firstTenLines = blob.toString();
        // var firstTenLines = blob.toString().split("\n").slice(0, 10).join("\n");
        console.log(firstTenLines);
        
    })
    .done();
var Git = require("nodegit");
var path = require('path');


var HISTORY = [];
var historyOrder = 1;

// Open the repository directory.
Git.Repository.open(path.resolve(__dirname, '../../../../.git'))
    // Open the master branch.
    .then(function (repo) {
        // return repo.getMasterCommit();
        // return repo.getCurrentCommit();
        // return repo.getHeadCommit();
        return repo.getBranchCommit('feature/gitdiff');
    })
    // Display information about commits on master.
    .then(function (firstCommitOnMaster) {
        // Create a new history event emitter.
        var history = firstCommitOnMaster.history();

        // Create a counter to only show up to 9 entries.
        var count = 0;

        // Listen for commit events from the history.
        history.on("commit", function (commit) {
            // Disregard commits past 9.
            const limit = 5;

            if (++count >= limit) {
                return;
            }

            // Show the commit sha.
            //   console.log("commit " + commit.sha());

            // Store the author object.
            //   var author = commit.author();

            // Display author information.
            //   console.log("Author:\t" + author.name() + " <" + author.email() + ">");

            // Show the commit date.
            //   console.log("Date:\t" + commit.date());

            // Give some space and show the message.
            
            /* 
            console.log({
                id: commit.sha(),
                message: commit.message()
            });
            */

            commit
                .getEntry("examples/commitTwo.js")
                .then(function (entry) {
                    _entry = entry;
                    return _entry.getBlob();
                })
                .then(function (blob) {
                    // console.log(_entry.name(), _entry.sha(), blob.rawsize() + "b");
                    // console.log("========================================================\n\n");
                    var fileContents = blob.toString();
                    // var firstTenLines = blob.toString().split("\n").slice(0, 10).join("\n");
                    // console.log(fileContents);

                    HISTORY.push({
                        historyOrder: historyOrder++,
                        commit: {
                            id: commit.sha(),
                            message: commit.message()
                        },
                        fileContents: fileContents
                    })
                    
                })
                .catch(err => {
                    // console.log(err.message)
                })
                .done();

        })
        history.on('end', function(commit){

            // console.log('\n ---👌 🍎 🍉 🍑 🍇 ---', {HISTORY});
            
            const DiffService = require('../DiffService');
            HISTORY.reverse().forEach((history, index) =>{

                console.log('\n 🐨 --- ['+index+'] File contents for commit  ---');
                console.log(history.fileContents);

                
                   
    
            })

            console.log('\n 🦄 --- File contents difference by lines  ---');
            DiffService.printDiff(HISTORY[0].fileContents, HISTORY[1].fileContents);

        })

        // Start emitting events.
        history.start();

        return HISTORY;
    })
    
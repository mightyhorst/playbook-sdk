var nodegit = require("nodegit");
var path = require("path");

// This code examines the diffs between a particular commit and all of its
// parents. Since this commit is not a merge, it only has one parent. This is
// similar to doing `git show`.

nodegit.Repository.open(path.resolve(__dirname, '../../../../.git'))
    .then(function (repo) {
        return repo.getCommit("5a51da2bdba1a87ce77a534e71ed2a32f3c9284c");
    })
    .then(function (commit) {
        //   console.log("commit " + commit.sha());
        //   console.log("Author:", commit.author().name() +
        //     " <" + commit.author().email() + ">");
        //   console.log("Date:", commit.date());
        //   console.log("\n    " + commit.message());

        console.log('------------');
        console.log('commit--->', {
            sha: commit.sha(),
            authourName: commit.author().name(),
            authourEmail: commit.author().email(),
            message: commit.message()
        })
        console.log('------------');

        return commit.getDiff();
    })
    .done(function (diffList) {

        console.log('diffList--->', { diffList });

        diffList.forEach(function (diff) {
            diff.patches().then(function (patches) {
                patches.forEach(function (patch) {
                    patch.hunks().then(function (hunks) {
                        hunks.forEach(function (hunk) {
                            hunk.lines().then(function (lines) {

                                console.log("\n 🦁 diff --->\n", {
                                    oldFilePath: patch.oldFile().path(),
                                    newFilePath: patch.newFile().path()
                                });

                                console.log("\n 🥝 hunkHeader --->\n", hunk.header().trim());

                                console.log("\n 🦊 lines --->\n" );

                                lines.forEach(function (line) {

                                    console.log('• line -->\n', {content:  line.content() });

                                    console.log(String.fromCharCode(line.origin()) +
                                        line.content().trim());
                                });

                            });
                        });
                    });
                });
            });
        });
    });
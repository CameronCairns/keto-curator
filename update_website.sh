#!/bin/bash
# Sourced from the helpful article found here:
# http://lea.verou.me/2011/10/easily-keep-gh-pages-in-sync-with-master/
git checkout gh-pages #go to the gh-pages branch
git rebase master #bring gh-pages up to date with master
git push origin gh-pages #commit the changes
git checkout master #return to the master branch

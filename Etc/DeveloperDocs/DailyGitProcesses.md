# Developer Daily Pull / Rebase Process

## At the beginning of the workday

1. `git stash`

   Run this if you have staged or unstaged changes (unclean workspace) from the previous day. It is the equivalent of a TFS Shelve. It allows you to switch branches without losing any current work. If you do not have any staged or unstaged changes that you would prefer to revert instead, you can skip this step. But git will not allow you to switch branches until your workspace is clean.

2. `git checkout master`

   Switch to the master branch.

3. `git pull mainline master` (or `git pull upstream master`)

   This will download the latest master code onto your machine. Doug your tracking remote is named mainline, Saibal yours is named upstream. Saibal, I would prefer you rename yours to mainline to keep it consistent with Doug's.

4. `git push origin master`

   This will update your github fork with the latest master code. This is helpful for me because it helps me see what commit your master is pointing at.

5. `git checkout work`

   Switch back to the work branch.

6. `git rebase master`

   `git mergetool` (if you run into a conflict)

   `git rebase --continue` (after resolving conflicts)

   `git rebase --abort` (to undo the rebase and start over, do this if you accidentally leave the dragon open and it poops on your rebase)

   You need to run git rebase master if your work branch is not directly downstream from the master after pulling it from the mainline. In other words, if the master branch is pointing at a commit that is a parent of your work branch, you can skip this step. Otherwise, if your master and work branches appear in different parallel development lines, you will need to rebase in order to make the relationship between master and work entirely linear (no parallel development lines separating work from master is the goal of the rebase).

7. Delete any .orig files that git created because of merge conflicts. If you would like to keep these for me to review, save them to a different folder outside of the project and mail them to me.

8. `git stash apply`

   Finally, run this if you ran git stash as step 1. It is the equivalent of a TFS Unshelve. It will restore your staged and unstaged changes so that you can continue to work after this morning ritual.

## At the end of the workday

1. Commit your code, if you have not already made at least 1 commit for the day. If you have already made a commit, you can keep your staged & unstaged changes for the following day (just remember to `git stash` before rebasing onto the latest master). Before doing a commit, get in the habit of doing the following:

   A. Click the **Transform all Templates** button in visual studio. This will cause T4MVC classes to be regenerated. Ignore this step only if your code does not compile and you are doing a forced daily commit.

   B. Click the **Save All** button in visual studio. This causes any changes to .csproj files to be flushed to the filesystem so that git can pick them up.

   C. Click the **Rescan** button in Git Gui to make sure you are committing everything that you need to.

2. `git push origin work`

   or

   `git push -f origin work`

   This is so that I can review your commit(s) in my tracking remotes. After a rebase, your local work branch's history may differ from the remote's history, causing git to reject the push. In the past I have had you run  git push origin :work to delete, and then git push origin work to re-add. While that works, I recently discovered that the -f flag can force a history rewrite as well, without having to explicitly delete and re-add the branch to the github remote.

3. If your code is ready for integration into the master after discussing with me, create a pull request on github. This does not necessarily have to come at the end of the day, but should come after a commit that compiles and has no serious security vulnerabilities.

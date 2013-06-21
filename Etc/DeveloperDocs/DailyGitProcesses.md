# Developer Daily Pull / Rebase Process

## At the beginning of the workday(summary)

1.   `git stash -u` (optional)  
2.    `git checkout team`  
3.    `git pull mainline team`  
4.    `git push origin team`  
5.    `git checkout work`  
6.    `git rebase team`  
   1.   `git mergetool` (if you run into a conflict)  
   2.    `git rebase --continue` (after resolving conflicts)  
   3.    `git rebase --abort` (to undo the rebase and start over)  
7.    Delete any .orig files that git created because of merge conflicts.  
8.    `git push origin work`    or    'git push -f origin work`  
9.    `git stash pop` (optional)  

## At the end of the workday(summary)

1.        Commit your code  
   1.   transform all templates  
   2.   save all  
   3.   rescan in git gui  
2.    `git push origin work`    or    `git push -f origin work`  
3.    https://github.com/danludwig/Layout3/pulls.

## At the beginning of the workday(detailed)

1. `git stash -u` (optional)

  **Don't forget to *Save All* in Visual Studio and rescan to inspect changes to sln and csproj files before stashing.** Remember, Visual Studio normally keeps changes to these files in memory and only writes them to the filesystem when you close the solution, build the solution, or Save All.

   Run this if you have an unclean workspace (any files with staged or unstaged changes) that you want to come back to when you're finished with this process. If you are familiar with a TFS shelve, `git stash` is its correlary. It allows you to switch branches without having to lose a current work in progress. Git will not always allow you to switch branches if your workspace is unclean, so this step is to prepare for step 2 below.

   The `-u` flag can be important because without it, only staged files will be saved or restored. Using this flag tells git to also stash files that have unstaged changes.

  Another option if you have an unclean workspace is to just revert changes, which can be done in Git GUI. You can only revert changes to deleted and edited files. To revert newly added files, manually remove them from the filesystem.

2. `git checkout team`

   Switch to the team branch. This assumes you are committing to a separate work or topic branch, which you should be. Do not make commits on top of your master or team branches!

3. `git pull mainline team`

   This will download the latest team code from github onto your machine and update your local team branch to match it.

4. `git push origin team`

   This will update your github fork with the latest team code. This is helpful for me because it helps me see what commit your team branch is pointing at.

5. `git checkout work`

   Switch back to your work / topic branch.

6. `git rebase team`

   `git mergetool` (if you run into a conflict)

   `git rebase --continue` (after resolving conflicts)

   `git rebase --abort` (to undo the rebase and start over, do this if you accidentally leave the dragon open and it poops on your rebase)

   You need to run `git rebase team` if your work branch is not directly downstream from the team branch after pulling it from the mainline. In other words, if the team branch is pointing at a commit that is a parent of your work branch, you can skip this step. Otherwise, if your team and work branches appear in different parallel development lines, you will need to rebase in order to make the relationship between team and work entirely linear (no parallel development lines separating work from team is the goal of the rebase).

7. Delete any .orig files that git created because of merge conflicts. If you would like to keep these for me to review, save them to a different folder outside of the project and mail them to me.

8. `git push origin work`

   or

   `git push -f origin work`

   Do this so that your GH work branch matches the rebase you just performed. I'd like you to do this in case I want to merge in your changes sometime during the day, before you do the next push at the end of the day.


9. `git stash pop` (optional, don't do this if you skipped step 1)

   Finally, run this if you ran `git stash -u` as step 1. It is the TFS Unshelve's correlary. It will restore your staged and unstaged changes so that you can continue to work after this morning ritual. It will also delete the stash entry from git, so that you don't have any funny looking loops in the dragon visualizer.

   If you don't want to delete the stash from git, you can just run `git stash apply`. This will restore your stash to your filesystem only, but leave the stash data in git so that you can apply it to a different branch or otherwise reuse it later.

## At the end of the workday(detailed)

1. Commit your code, if you have not already made at least 1 commit for the day. If you have already made a commit, you can keep your staged & unstaged changes for the following day (just remember to `git stash` before rebasing onto the latest team branch). Before doing a commit, get in the habit of doing the following:

   A. Click the **Transform all Templates** button in visual studio. This will cause T4MVC classes to be regenerated. Ignore this step only if your code does not compile and you are doing a forced daily commit.

   B. Click the **Save All** button in visual studio. This causes any changes to .csproj files to be flushed to the filesystem so that git can pick them up.

   C. Click the **Rescan** button in Git Gui to make sure you are committing everything that you need to.

2. `git push origin work`

   or

   `git push -f origin work`

   This is so that I can review your commit(s) in my tracking remotes. After a rebase, your local work branch's history may differ from the remote's history, causing git to reject the push. In the past I have had you run  git push origin :work to delete, and then git push origin work to re-add. While that works, I recently discovered that the -f flag can force a history rewrite as well, without having to explicitly delete and re-add the branch to the github remote.

3. After pushing your work branch at the end of the day, check to see if you have an open pull request to merge your work back into the team branch. You can do this by going to https://github.com/danludwig/Layout3/pulls. If you already have an OPEN pull request, stop here, you don't need to do anything. If you do not have an open pull request, create one. You can do this by clicking the **Pull Request** button at the top of the page. Select your work branch from the **head branch** dropdown, and make sure you are pulling it into the team base branch.

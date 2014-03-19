Phabmine
========

Phabmine is [Redmine](http://www.redmine.org) plugin that integrates wth [Phabricator](http://phabricator.org/) and allows to check issue related commits statuses from issue view.

## Features
1. Show commits result statuses (based on audit of different users) on issue page.
2. Change commit URL from redmineweb (which is default) to phabricator.

## Installaion
1. `cd redmine/apps/dir/`
2. `git clone git@github.com:futurecolors/phabmine.git && cd phabmine && git submodule update`
3. [Install Phabricator Arcanist](http://www.phabricator.com/docs/phabricator/article/Arcanist_User_Guide.html#installing-arcanist), run `arc install-certificate` and follow instructions. You must have `~/.arcrc` after this step.
4. Create a link to `.arcrc` file at `/redmine/apps/dir/phabricator/` with `ln -s /home/%username%/.arcrc` in phabricator directory.
5. Reload redmine.

##Configuration
Plugin settings (`/settings/plugin/phabmine` page) has following settings:
 - __Roles to hide Phabricator URL__   
  This is JSON list of user rolse ids. If user belongs to one of this roles, commit URL to `redmineweb` will not be changed to phabricator URL.
  This is usefull if someone has no access to phabricator or need `redmineweb` for some other reason.

  For example, if you wand to disable url change for managers, the parameter should be:
    ```
    [3]
    ```
 - __Redmine->Phabricator project mapping__   
  This is JSON map of correspondance redmine projects slugs and phabricator projects slug.
  By default, phabricator project slug is uppercsed redmine project slug.

  For example, if redmine project called `phabricator-plugin` and phabricator project called `PHABMINE`, then the map should look like this:
    ```
    {'phabricator-plugin': 'PHABMINE'}
    ```
    
If you don't need some of these settings, just leave them empty, that's fine. Otherwise, _check JSON correctness_.
If parameters will not be valid JSON strings, issue page will turn into 500 page. This behavior will be fixed soon.

## FAQ
 - __I don't want to clutter up my server with Phabricator Arcanist, PHP, etc. What shoud I do to run Phabmine?__   
   The point of step 3 of installation guide is to get `.arcrc` file - this is where Phabricator Conduit's certificate stored.
   You can create the file at any computer and then just copy it to server with Redmine.

 - __Is Phabmine stable? Can I safely use it?__   
   No! The plugin is under development. Production usage is strongly not recommended.

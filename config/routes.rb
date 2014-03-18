
get 'phabmine/:project_sid/commit/:sid/branches/', :controller => 'branches', :action => 'get'
get 'phabmine/:project_sid/commits/status/', :controller => 'commits', :action => 'status'

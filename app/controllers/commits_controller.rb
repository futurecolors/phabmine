require_relative '../../lib/phabricator_audits_hook_listener.rb'


class CommitsController < ApplicationController
  unloadable


  def status
    project_sid = params[:project_sid]
    commits = params[:commits]
    statuses = get_changesets_statuses commits, project_sid
    statuses.keys.each do |commit_id|
      # getting rid of rPROJECT in commit ids
      statuses[commit_id[project_sid.length + 1..commit_id.length]] = statuses[commit_id]
      statuses.delete(commit_id)
    end
    render :json => statuses
  end
end

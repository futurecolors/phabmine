$(function(){
    var getAndFillCommitBranches = function(projectSid, commitId, $revUrl, toFill){
        var $info = $('#phabricator_audit_info'),
            oldData, newBranches;

        return $.ajax({
            url: '/phabmine/'+ projectSid + '/commit/' + commitId + '/branches/',
            dataType: 'json'
        }).then(function(data){
            $revUrl.data('branches', data);
            if(toFill){
                fillBranches($revUrl, data);
            }
            oldData = $info.data('branches') || [];
            newBranches = oldData.concat(data);
            $info.data('branches', newBranches);
        })
    };

    var fillBranches = function($revUrl, branches){
        var $branchesInfo;

        $revUrl
            .parent()
            .siblings('.wiki')
            .after('<div class="branches_info"></div>');

        $branchesInfo = $revUrl.parents('.changeset').find('.branches_info');

        if(branches){
            $.each(branches, function(key, value){
                $branchesInfo.append('<span class="branch">' + value + '</span>')
            })
        }
    };

    var getAndShowFinalBranch = function(instanceBranchMapping, isGitflowProject){
        var headerText = isGitflowProject? 'Summary' : 'Affected branches',
            $info = $('#phabricator_audit_info'),
            $issueBranches = $('<div id="issue_branches"></div>'),
            projectSid = $info.data('projectSid'),
            lastCommitBranches,
            elderBranch,
            instanceName,
            branch_url;


        lastCommitBranches = $('a.js-revurl').last().data('branches');

        $('#issue-changesets').prepend($issueBranches);
        $issueBranches.append('<h3 id="branches_header">' + headerText + '</h3>');

        if (isGitflowProject){
            elderBranch = getGitflowElderBranch(lastCommitBranches);
            if (elderBranch[0] == undefined){
                showIssueBranches($issueBranches, lastCommitBranches);
            }
            else{
                branch_url = $info.data('baseRepositoryUrl') + elderBranch[1] + '/';
                if(projectSid in instanceBranchMapping){
                    instanceName = instanceBranchMapping[projectSid][elderBranch[0]] || '';
                }
                else{
                    instanceName = '';
                }

                if(instanceName) {
                    $issueBranches.append(
                            '<div>' +
                                'Test instance: <a target="_blank" class="elder_branch" href="http://' + instanceName + '">' + instanceName + '</a>' +
                            '</div>'
                    );
                }
                $issueBranches.append(
                        '<div>' +
                            'Branch: <a target="_blank" class="elder_branch_name" href="' + branch_url + '">' + elderBranch[1] + '</a>' +
                        '</div>'
                );
            }
        }
        else{
            showIssueBranches($issueBranches, lastCommitBranches);
        }
    };

    var showIssueBranches = function($summary_element, branches){
        $.each(branches, function(i, branch){
            $summary_element.append('<span class="branch">' + branch + '</span>')
        })
    }

    var getGitflowElderBranch = function(branches){
        var elderBranch,
            elderBranchType,
            curentElderBranch;

        $(['master', 'hotfix', 'release', 'dev', 'feature'])
            .each(function(i, branchId){
                curentElderBranch = branchesContain(branches, branchId);
                if (curentElderBranch){
                    elderBranch = curentElderBranch;
                    elderBranchType = branchId;
                    return false;
                }
            });

        return [elderBranchType, elderBranch]
    };

    var branchesContain = function(branches, branchId){
        var contain,
            branch;

        $(branches).each(
            function(i, b){
                if(b.substring(0, branchId.length) == branchId){
                    contain = true;
                    branch = b;
                }
            }
        );

        if(contain){
            return branch
        }else{
            return false;
        }
    };

    var applyCommitsData = function(commitsData){
        $.each(commitsData, function(commitId, data){
            $revUrl = $('a[href*="/revisions/"]').filter(function(){
                return $(this).data('commitId') == commitId;
            });
            $revUrl.addClass('js-revurl').before('<span class="audit_info ' + data.status + '"></span>');

            // getting commits branches
            if (showCommitBranches || showTicketsBranches){
                requests_array.push(getAndFillCommitBranches(
                    $info.data('projectSid'),
                    commitId,
                    $revUrl,
                    showCommitBranches
                ));
            }

            if($info.data('changeUrl') && data['url']){
                $revUrl
                    .attr('href', data['url'])
                    .attr('target', '_blank');
            }
        });

        $.when.apply({}, requests_array).then(function(){
            if ( showTicketsBranches){
                getAndShowFinalBranch($info.data('instanceBranchMapping'), $info.data('isGitflowProject'));
            }
        });
    };

    var $info = $('#phabricator_audit_info'),
        showCommitBranches = $info.data('showCommitsBranches'),
        showTicketsBranches = $info.data('showTicketsBranches'),
        $revUrl,
        commitIds = [],
        requests_array = [];

    $('a[href*="/revisions/"]').each(function(){
        var $a = $(this);
        $a.data('commitId', $a.attr('href').replace(/.*\/revisions\/([a-f0-9]{40})/, '$1'));
        commitIds.push($a.data('commitId'));
    });

    if (commitIds.length) {
        $.get('/phabmine/' + $info.data('projectSid') + '/commits/status/', {commits: commitIds}, applyCommitsData, 'json');
    }
});

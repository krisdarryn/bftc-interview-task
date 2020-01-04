/**
 * Team class
 */
function Team(defaults, seasonId) {
    this.DEFAULTS = defaults;
    this.list = null;
    this.leagueId = null;
    this.seasonId = null;

    if (seasonId !== undefined) {
        this.seasonId = seasonId;
        this.fetchBySeassonId();
    }
};

Team.prototype.fetchBySeassonId = async function(seasonId) {
    var currentObj = this;

    if (seasonId !== undefined) {
        currentObj.seasonId = seasonId;
    }
    
    return axios.get(`https://soccer.sportmonks.com/api/v2.0/teams/season/${currentObj.seasonId}?api_token=${this.DEFAULTS.APIKEY}&include=stats,country`)
                .then(function(response) {
                    currentObj.list = response.data.data;

                    currentObj.setCurrentSeasonStat();

                    //console.log();

                    return currentObj;
                })
                .catch(function (error) {
                    throw new Error(`Team:fetchBySeasonId. ${error}`);
                });
};

/**
 * Get the specific stat information by season_id and append it as a direct property of team object.
 * 
 * @returns void
 */
Team.prototype.setCurrentSeasonStat = function() {
    var currentObj = this;

    _.forEach(this.list, function(team) {
        
        team.currentStatBySeasonId = null;
        
        var _tempCurrentStat = _.filter(team.stats.data, function(stat) {
            return stat.season_id === currentObj.seasonId;
        });

        if (!_.isEmpty(_tempCurrentStat)) {
            team.currentStatBySeasonId = _tempCurrentStat.pop();
        } 

    });

};

/**
 * Filter and sort Team by Score Criteria.
 * 
 * @returns Array
 */
Team.prototype.filterAndOrderTeamScoreCriteria = function(scoreMinuteIndex, scorePercentage, orderBy) {
    // First is to filter team by scorePercentage.
    var filterTeam = _.filter(this.list, function(team) { 
        
        if (team.currentStatBySeasonId !== null) {
            return team.currentStatBySeasonId.scoring_minutes[0].period[scoreMinuteIndex].percentage >= scorePercentage; 
        } else {
            return false;
        }

    });

    // Last is to sort team by selected sort order.
    var tempOrderedList = _.orderBy(filterTeam, function(team) { 
        
        if (team.currentStatBySeasonId !== null) {
            return team.currentStatBySeasonId.scoring_minutes[0].period[scoreMinuteIndex].percentage; 
        } else {
            return false;
        }
        
    }, [orderBy]);

    return tempOrderedList;
};

Team.prototype.getList = function() {
    return this.list;
}
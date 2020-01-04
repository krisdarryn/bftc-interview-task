/**
 * Fixture class
 */
function Fixture(defaults) {
    this.DEFAULTS = defaults;
    this.list = null;
    this.listSortedByLeagueID = null;
    this.currentSeason = null;
    this.startDate = null;
    this.endDate = null;
    this.leagueId = null
    this.seasonId = null;
};

/**
 * A method to fetch from Fixture API filter by dates: startDate and endDate.
 * Run Sort result by leageID.
 * 
 * @returns void
 */
Fixture.prototype.fetchByDates = async function(startDate, endDate, leageId) {
    var currentObj = this;

    currentObj.setStartDate(startDate);
    currentObj.setEndDate(endDate);

    return axios.get(`https://soccer.sportmonks.com/api/v2.0/fixtures/between/${startDate}/${endDate}?api_token=${this.DEFAULTS.APIKEY}&include=league,season,venue,localTeam,visitorTeam`)
     .then(function (response) {
        currentObj.list = response.data.data;

        return currentObj;
     })
     .then(function(currentObj) {
        currentObj.sortByLeagueID(leageId);

        return currentObj;
     })
     .catch(function (error) {
        throw new Error(`Fixture:fetchByDates. ${error}`);
     });
};

Fixture.prototype.sortByLeagueID = function(leagueId) {
    this.setLeagueId(leagueId);
    this.listSortedByLeagueID = _.filter(this.list, function(item) { return item.league_id === leagueId; });

    // Get seasonID
    this.setCurrentSeason(_.intersectionBy(this.getSortedListByLeagueID(), 'season_id').pop());

    this.setSeasonId(this.getCurrentSeason().season_id);

    return;
};

Fixture.prototype.setStartDate = function(startDate) {
    this.startDate = startDate;
};

Fixture.prototype.getStartDate = function() {
    return this.startDate;
};

Fixture.prototype.setEndDate = function(endDate) {
    this.endDate = endDate;
};

Fixture.prototype.getEndDate = function() {
    return this.endDate;
};

Fixture.prototype.setLeagueId = function(leagueId) {
    this.leagueId = leagueId;
};

Fixture.prototype.getLeagueId = function() {
    return this.leagueId;
};

Fixture.prototype.setSeasonId = function(seasonId) {
    this.seasonId = seasonId;
}

Fixture.prototype.getSeasonId = function() {
    return this.seasonId;
}

Fixture.prototype.getSortedListByLeagueID = function() {
    return this.listSortedByLeagueID;
};

Fixture.prototype.getList = function() {
    return this.list;
}

Fixture.prototype.setCurrentSeason = function(season) {
    this.currentSeason = season;
}

Fixture.prototype.getCurrentSeason = function() {
    return this.currentSeason;
}
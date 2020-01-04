/**
 * League Class
 */
function League(defaults) { 
    this.DEFAULTS = defaults;
    this.list = null;    
    this.selectedLeague = null;
};

League.prototype.fetchAllLeagues = async function() {
    var currentObj = this;

    return axios.get(`https://soccer.sportmonks.com/api/v2.0/leagues?api_token=${this.DEFAULTS.APIKEY}`)
                .then(function(response) {
                    currentObj.list = response.data.data;

                    return currentObj;
                })
                .catch(function (error) {
                    throw new Error(`League:fetchAllLeagues. ${error}`);
                });

}

League.prototype.getList = function() {
    return this.list;
}

League.prototype.populateLeagueDropdown = function() {
    var $leagueDD = $('#premier-league_option__league-id');

    _.forEach(this.list, function(item) {
        $leagueDD.append(`<option value="${item.id}">${item.name}</option>`);
    });

    $('#premier-league_option__league-id').val(this.DEFAULTS.INITIAL_VALUES.LEAGUE_ID);
}

League.prototype.setSelectedLeague = function() {
    this.selectedLeague = _.filter(this.getList(), function(league) { return league.id === 8; } ).pop();
}

League.prototype.getSelectedLeague = function() {
    return this.selectedLeague;
}
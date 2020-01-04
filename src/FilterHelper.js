function FilterHelper() {
    this.$form = $('#premier-league_option__form');
    this.$startDate = $('#premier-league_option__start-date-dtp');
    this.$endDate = $('#premier-league_option__end-date-dtp');
    this.$leagueId = $('#premier-league_option__league-id');
    this.$scoringMinute = $('#premier-league_option__scoring-minute');
    this.$scoringPercentage = $('#premier-league_option__scoring-percentage');
    this.$orderByAsc = $('#premier-league_option__order-asc');
    this.$orderByDesc = $('#premier-league_option__order-desc');
    this.formData = {
        startDate: null,
        endDate: null,
        leagueId: null,
        scoringMinute: null,
        scoringPercentage: null,
        orderBy: null
    };
    this.league = new League(DEFAULTS);
    this.fixture = new Fixture(DEFAULTS);
    this.team = new Team(DEFAULTS);
    this.$teamList = $('#team-list');
};


FilterHelper.prototype.init = function() {
    var currentFilterHelper = this;

    // Bind Form submit event
    this.$form.on('submit', function(e) {
        e.preventDefault();

        currentFilterHelper.setFormData();
        currentFilterHelper.searchResult();
    });
    
};

FilterHelper.prototype.setFormData = function() {
    this.formData = {
        startDate: this.$startDate.datetimepicker('date').format('YYYY-MM-DD'),
        endDate: this.$endDate.datetimepicker('date').format('YYYY-MM-DD'),
        leagueId: parseInt(this.$leagueId.val(), 10),
        scoringMinute: parseInt(this.$scoringMinute.val(), 10),
        scoringPercentage: parseFloat(this.$scoringPercentage.val(), 10),
        orderBy: this.getOrderBy()
    };
};

FilterHelper.prototype.getOrderBy = function() {
    
    if (this.$orderByAsc.is(':checked')) {
        return this.$orderByAsc.val();
    } else if (this.$orderByDesc.is(':checked')) {
        return this.$orderByDesc.val();
    }

}

FilterHelper.prototype.getFormData = function() {
    return this.formData;
}

FilterHelper.prototype.initalRenderResult = function() {
    var currentFilterHelper = this;

    appendSpinner('.premier-league_header');
    appendSpinner('#premier-league_option__form .card-body');
    $('#premier-league_option__btn-submit').attr('disabled', 'disabled');

    currentFilterHelper.league.fetchAllLeagues()
           .then(function(leagueObj) {
                // Set Leauge Title and Logo
                leagueObj.setSelectedLeague();  
                
                currentFilterHelper.setLeagueDetails(leagueObj);

                // Populate League dropdown
                leagueObj.populateLeagueDropdown();

                currentFilterHelper.setFormData();

                // Remove all spinner
                removeSpinner('#premier-league_option__form .card-body');
                return leagueObj;
           })
           .then(function(leagueObj) {
                // Intialize default Leauge
                return currentFilterHelper.fixture.fetchByDates(
                                currentFilterHelper.getFormData().startDate, 
                                currentFilterHelper.getFormData().endDate,
                                currentFilterHelper.getFormData().leagueId
                              )
                              .then(function(fixtureObj) {

                                // Set season deatils
                                currentFilterHelper.setSeasonDetails(fixtureObj);

                                removeSpinner('.premier-league_header');
                                return fixtureObj;
                              });
           })
           .then(function(fixtureObj) {
                // Intialize default Team
                appendSpinner('#premier-league_body');

                return currentFilterHelper.team.fetchBySeassonId(fixtureObj.getSeasonId())
                           .then(function(teamObj) {
                                return teamObj;
                           });
           })
           .then(function(teamObj) {
                // Render all teams
                var filteredTeam = teamObj.filterAndOrderTeamScoreCriteria(
                    currentFilterHelper.getFormData().scoringMinute, 
                    currentFilterHelper.getFormData().scoringPercentage,
                    currentFilterHelper.getFormData().orderBy
                );

               currentFilterHelper.buildTeamListHTML(filteredTeam);
           })
           .catch(function(error) {
               throw new Error(`Main: ${error}`);
           })
           .finally(function() {
                $('#premier-league_option__btn-submit').removeAttr('disabled');
                removeSpinner('#premier-league_body');
           });
};

FilterHelper.prototype.searchResult = function() {
    var currentFilterHelper = this;

    // If User selected another League
    if (this.league.getSelectedLeague().id !== this.getFormData.leagueId) {
        this.initalRenderResult();
    } else {
        $('#premier-league_option__btn-submit').attr('disabled', 'disabled');

        currentFilterHelper.fixture.fetchByDates(
                currentFilterHelper.getFormData().startDate, 
                currentFilterHelper.getFormData().endDate,
                currentFilterHelper.getFormData().leagueId
            )
            .then(function(fixtureObj) {
                return fixtureObj;
            }).then(function(fixtureObj) {
                // Intialize default Team
                appendSpinner('#premier-league_body');

                return currentFilterHelper.team.fetchBySeassonId(fixtureObj.getSeasonId())
                       .then(function(teamObj) {
                            return teamObj;
                       });
            })
            .then(function(teamObj) {
                    // Render all teams
                    var filteredTeam = teamObj.filterAndOrderTeamScoreCriteria(
                        currentFilterHelper.getFormData().scoringMinute, 
                        currentFilterHelper.getFormData().scoringPercentage,
                        currentFilterHelper.getFormData().orderBy
                    );

                currentFilterHelper.buildTeamListHTML(filteredTeam);
            })
            .catch(function(error) {
                throw new Error(`Main: ${error}`);
            })
            .finally(function() {
                    $('#premier-league_option__btn-submit').removeAttr('disabled');
                    removeSpinner('#premier-league_body');
            });
          
    }
}

FilterHelper.prototype.setLeagueDetails = function(leagueObj) {
    this.clearLeagueDetails();

    $('#premier-league_title').text(leagueObj.getSelectedLeague().name);
    $('#premier-league_logo').attr('src', leagueObj.getSelectedLeague().logo_path)
                              .attr('alt', `${leagueObj.getSelectedLeague().name} logo.`);
};

FilterHelper.prototype.setSeasonDetails = function(fixtureObj) {
    this.clearSeasonDetails();

    $('#premier-league_header__season-details').append(
        `
        <h4>Season: <u>${fixtureObj.getCurrentSeason().season.data.name} </u></h4>
        <h5>${fixtureObj.getCurrentSeason().venue.data.city !== null ? fixtureObj.getCurrentSeason().venue.data.city + ' | ' : ''}  ${fixtureObj.getCurrentSeason().venue.data.name} ${fixtureObj.getCurrentSeason().venue.data.surface !== null ? '(' + fixtureObj.getCurrentSeason().venue.data.surface + ')' : ''} </h5>
        `
    );
};

FilterHelper.prototype.buildTeamListHTML = function(filteredTeam) {
    var currentFilterHelper = this;
    this.clearTeamListHtml();

    if (!_.isEmpty(filteredTeam)) {

        _.forEach(filteredTeam, function(teamItem) {

            if (teamItem.currentStatBySeasonId !== null) {
                // Prepare lis of scoring minutes
                var scoringMinutList = [];
                _.forEach(teamItem.currentStatBySeasonId.scoring_minutes[0].period, function(scoringMinute, key) {
                    scoringMinutList.push(
                        `<tr class="${ key === currentFilterHelper.getFormData().scoringMinute? 'minute-hightlight bg-success font-weight-bolder' : ''}">
                            <td class="minute-item">${scoringMinute.minute}</td> 
                            <td class="percentage-item">${parseFloat(scoringMinute.percentage, 10).toFixed(2)}%</td>
                        </tr>`
                    );
    
                });
    
                currentFilterHelper.$teamList.find('.row:first').append(
                    `<div class="col-12 col-sm-4 col-md-3 mb-4">
                        <div class="card">
                            <div class="text-center p-4 border-bottom">
                                <img src="${teamItem.logo_path}" class="card-img-top" alt="${teamItem.name} logo." style="width: 150px;">
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${teamItem.name}</h5>
                                <h6><i>${teamItem.twitter}</i> | <u>${teamItem.country.data.name}</u></h6>
                            </div>
                            <div class="card-body">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Minute</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${scoringMinutList.join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>`
                );
            }
        });

    } else {
        this.$teamList.find('.row:first').append(`<div class="col-12 text-center"><h5>Result not found</h5></div>`);
    }
    
}

FilterHelper.prototype.clearLeagueDetails = function() {
    $('#premier-league_title').empty();
    $('#premier-league_logo').attr('src', '')
                             .attr('alt', '');
}

FilterHelper.prototype.clearSeasonDetails = function() {
    $('#premier-league_header__season-details').empty();
}

FilterHelper.prototype.clearTeamListHtml = function() {
    this.$teamList.find('.row:first').empty();
}
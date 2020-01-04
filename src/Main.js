$(function() {

    // Bind an event to Scoring Percentage when user changes the range it will display the exact value
    $('#premier-league_option__scoring-percentage').val(DEFAULTS.INITIAL_VALUES.PERCENTAGE)
                                                   .on('change', function(e) {
                                                        $('#premier-league_option__scoring-percentage-label').text(`${parseFloat(this.value, 10).toFixed(2)}%`);
                                                   }).trigger('change');

    // Load Scoring Minutes options.
    // Then set the default value.
    var $scoringMinuteField = $('#premier-league_option__scoring-minute');

    _.forEach(DEFAULTS.SCORING_MINUTES.PERIOD, function(period, index) {
        $scoringMinuteField.append(`<option value="${index}">${period}</option>`);
    });

    $('#premier-league_option__scoring-minute').val(DEFAULTS.INITIAL_VALUES.PERRIOD_INDEX);

    // Intialize Datetimepickers.
    var $startDateDTP = $('#premier-league_option__start-date-dtp');
    var $endDateDTP = $('#premier-league_option__end-date-dtp');
    $startDateDTP.datetimepicker({format: 'L', format: 'YYYY-MM-DD'});
    $endDateDTP.datetimepicker({format: 'L', format: 'YYYY-MM-DD',  useCurrent: false});

    $startDateDTP.datetimepicker('date', DEFAULTS.INITIAL_VALUES.DATES.START_DATE);
    $endDateDTP.datetimepicker('date', DEFAULTS.INITIAL_VALUES.DATES.END_DATE);

    // Load initial result from default values
    var filterHelper = new FilterHelper();
    filterHelper.init();
    filterHelper.initalRenderResult();
});
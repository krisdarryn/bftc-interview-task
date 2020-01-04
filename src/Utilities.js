function appendSpinner(element) {
    $(element).append(`<div class="spinner-border text-success spinner-center" role="status">
    <span class="sr-only">Loading...</span>
  </div>`);
}

function removeSpinner(element) {
    $(element).find('.spinner-border.spinner-center')
              .remove();
}
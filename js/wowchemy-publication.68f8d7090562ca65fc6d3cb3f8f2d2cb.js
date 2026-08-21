(function () {
  'use strict';

  var container = document.getElementById('container-publications');

  function initFilters() {
    if (!container) return;

    var items = Array.prototype.slice.call(container.querySelectorAll('.isotope-item'));
    var searchInput = document.querySelector('.filter-search');
    var filters = { pubtype: '*', year: '*' };

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      items.forEach(function (item) {
        var matchesText = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
        var matchesType = filters.pubtype === '*' || item.matches(filters.pubtype);
        var matchesYear = filters.year === '*' || item.matches(filters.year);
        item.hidden = !(matchesText && matchesType && matchesYear);
      });
    }

    document.querySelectorAll('.pub-filters').forEach(function (select) {
      var group = select.getAttribute('data-filter-group');
      select.addEventListener('change', function () {
        filters[group] = select.value;
        if (group === 'pubtype') {
          var nextUrl = select.value.indexOf('.pubtype-') === 0
            ? '#' + select.value.substring(9)
            : window.location.pathname + window.location.search;
          window.history.replaceState(null, '', nextUrl);
        }
        applyFilters();
      });
    });

    if (searchInput) searchInput.addEventListener('input', applyFilters);

    var hashType = window.location.hash.substring(1);
    if (/^\d+$/.test(hashType)) {
      var typeFilter = '.pubtype-' + hashType;
      var typeSelect = document.querySelector('.pubtype-select');
      if (typeSelect && typeSelect.querySelector('option[value="' + typeFilter + '"]')) {
        typeSelect.value = typeFilter;
        filters.pubtype = typeFilter;
      }
    }

    applyFilters();
  }

  function initCitationModal() {
    if (!window.jQuery) return;
    var $ = window.jQuery;

    $('.js-cite-modal').on('click', function (event) {
      event.preventDefault();
      var filename = $(this).attr('data-filename');
      var modal = $('#modal');
      modal.find('.modal-body code').load(filename, function (_response, status, request) {
        if (status === 'error') {
          $('#modal-error').text('Error: ' + request.status + ' ' + request.statusText);
        } else {
          $('.js-download-cite').attr('href', filename);
        }
      });
      modal.modal('show');
    });

    $('.js-copy-cite').on('click', function (event) {
      event.preventDefault();
      var citation = document.querySelector('#modal .modal-body code');
      if (citation && navigator.clipboard) navigator.clipboard.writeText(citation.textContent);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    initCitationModal();
  });
})();

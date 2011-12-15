// use our own version of jQuery or fallback to django.jQuery
if (typeof $ === 'undefined') {$ = django.jQuery}

$(function($) {
    function update_salmonella_label(element, multi){
        var row = element.closest('.salmonella-field');
        var name = row.find("a").attr("data-name");
        var app = row.find("a").attr("data-app");
        var model = row.find("a").attr("data-model");
        var value = element.val();
        var MOUNT_URL = "/admin/salmonella";
        var url = MOUNT_URL;

        if (multi === true) {
            url = url + "/" + app + "/" + model + "/multiple/";
        } else {
            url = url + "/" + app + "/" + model + "/";
        }

        var is_invalid = function(v) {
            return (typeof v === 'undefined') || (v === '');
        }

        try {
            // only fire the ajax call if we have all the required info
            var required = [name, url, value]
            for (var k in required) {
                if (is_invalid(required[k])) {
                    throw 'Missing required variable'
                }
            }
            // Handles elements added via the TabularInline add row functionality
            if (name.search(/__prefix__/) != -1){
                name = element.attr("id").replace("id_", "");
            }

            $.ajax({
                url: url,
                data: {"id": value},
                success: function(data){
                    row.find('.salmonella_label').html(" " + data)
                }
            });

        } catch (e) {
            //console.log(e)
        }
    }

    // A big of a workaround to fire the change event on
    // blur because 'showRelatedObjectLookupPopup'
    // doesn't set the value in a way that trigger 'change'
    $(".salmonella-field input").live('blur',function(e){
        $(this).trigger('change');
        e.stopPropagation();
    });
    $(".salmonella-field .vForeignKeyRawIdAdminField").live('change', function(e){
        update_salmonella_label($(this), mutli=false);
        e.stopPropagation();
    });
    // Handle ManyToManyRawIdAdminFields.
    $(".salmonella-field .vManyToManyRawIdAdminField").live('change', function(e){
        update_salmonella_label($(this), multi=true);
        e.stopPropagation();
    });

    // clear both the input field and the labels
    $(".salmonella-clear-field").click(function(e){
        var elm = $(this)
        elm.parent().find('input').val("")
        elm.parent().find(".salmonella_label").empty()
    });

    // Open up the pop up window and set the focus in the input field
    $(".salmonella-related-lookup").click(function(e){
        // monkey patch django function
        window.dismissRelatedLookupPopup = function(win, chosenId) {
            var name = windowname_to_id(win.name);
            var jel = $('#' + name);
            if (jel.hasClass('vManyToManyRawIdAdminField')) {
                var newval = jel.val() + ',' + chosenId
                jel.val(newval)
            } else {
                jel.val(chosenId);
            }
            jel.blur()
            win.close();
        }
        showRelatedObjectLookupPopup(this);
        // Set the focus into the input field
        $(this).parent().find('input').focus();
        return false;
    });

    // Fire the event to update the solmonella fields on loads
    $(".salmonella-field .vManyToManyRawIdAdminField").trigger('change');
    $(".salmonella-field .vForeignKeyRawIdAdminField").trigger('change');
});
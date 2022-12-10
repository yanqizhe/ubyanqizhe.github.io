/* global document */
/* global jQuery */
/* global wyr */

// global namespace
if ( typeof window.wyr === 'undefined' ) {
    window.wyr = {};
}

/********
 *
 * Core
 *
 *******/

(function ($, ctx) {

    'use strict';

    /** VARS *************************/

    ctx.config = window.wyr_front_config;

    if (!ctx.config) {
        throw 'WYR Error: Global config is not defined!';
    }

    /** FUNCTIONS ********************/

    ctx.isTouchDevice = function () {
        return ('ontouchstart' in window) || navigator.msMaxTouchPoints;
    };

    ctx.createCookie =  function (name, value, hours) {
        var expires;

        if (hours) {
            var date = new Date();
            date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        else {
            expires = '';
        }

        document.cookie = name.concat('=', value, expires, '; path=/');
    };

    ctx.readCookie = function (name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');

        for(var i = 0; i < ca.length; i += 1) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1,c.length);
            }

            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }

        return null;
    };

    ctx.deleteCookie = function (name) {
        ctx.createCookie(name, '', -1);
    };

})(jQuery, wyr);

/*********************
 *
 * Module: Reactions
 *
 ********************/

(function ($, ctx) {

    'use strict';

    var config;

    var selectors = {
        'wrapper':      '.wyr-reaction-items',
        'link':         '.wyr-reaction',
        'voted':        '.wyr-reaction-voted',
        'value':        '.wyr-reaction-value',
        'bar':          '.wyr-reaction-bar'
    };

    var classes = {
        'voted':        'wyr-reaction-voted'
    };

    ctx.reactionsSelectors  = selectors;
    ctx.reactionsClasses    = classes;

    ctx.reactions = function () {
        config = window.wyr_front_config;
        var $body = $('body');

        // Catch event on wrapper to keep it working after box content reloading
        $body.on('click', selectors.link, function (e) {
            e.preventDefault();

            var $link       = $(this);
            var $wrapper    = $link.parents(selectors.wrapper);
            var nonce       = $.trim($link.attr('data-wyr-nonce'));
            var postId      = parseInt($link.attr('data-wyr-post-id'), 10);
            var authorId    = parseInt($link.attr('data-wyr-author-id'), 10);
            var type        = $.trim($link.attr('data-wyr-reaction'));

            if ($link.is(selectors.voted)) {
                return;
            }

            ctx.reactionVote({
                'postId':   postId,
                'authorId': authorId,
                'type':     type
            }, nonce, $wrapper);
        });

        // Update reactions for guests.
        if (!$body.is('.logged-in')) {
            $(selectors.link).each(function () {
                var $link  = $(this);
                var postId = parseInt($link.attr('data-wyr-post-id'), 10);
                var type   = $.trim($link.attr('data-wyr-reaction'));
                var reactionVoted = ctx.readCookie('wyr_vote_'+ type +'_' + postId);

                if (reactionVoted) {
                    $link.addClass(classes.voted);

                    var value = parseInt(reactionVoted, 10);

                    if (value && value > 0) {
                        $link.find(selectors.value).attr('data-raw-value', reactionVoted);
                        $link.find(selectors.value).text(numberFormat(reactionVoted, config.number_format.decimals, config.number_format.dec_point, config.number_format.thousands_sep));
                    }
                } else {
                    $link.removeClass(classes.voted);
                }
            });
        }
        if ($body.is('.logged-in')) {
            $(selectors.link).each(function () {
                var $link  = $(this);
                var postId = parseInt($link.attr('data-wyr-post-id'), 10);
                var type   = $.trim($link.attr('data-wyr-reaction'));
                var reactionVoted = ctx.readCookie('wyr_vote_'+ type +'_' + postId);

                if (reactionVoted) {
                    $link.addClass(classes.voted);
                }

                var value = parseInt(reactionVoted, 10);

                if (value && value > 0) {
                    $link.find(selectors.value).attr('data-raw-value', reactionVoted);
                    $link.find(selectors.value).text(numberFormat(reactionVoted, config.number_format.decimals, config.number_format.dec_point, config.number_format.thousands_sep));
                }
            });
        }
    };

    ctx.reactionVote = function (data, nonce, $box) {
        if (!config) {
            ctx.log('Post voting failed. Global config is not defined!');
            return;
        }

        var xhr = $.ajax({
            'type': 'POST',
            'url': config.ajax_url,
            'dataType': 'json',
            'data': {
                'action':           'wyr_vote_post',
                'security':         nonce,
                'wyr_post_id':      data.postId,
                'wyr_author_id':    data.authorId,
                'wyr_vote_type':    data.type
            }
        });
        setTimeout(function(){
            // Update state, without waiting for ajax response.
            var $reactions = $box.find(selectors.link);
            var reactions = ctx.getNewState($reactions, data.type);

            ctx.reactionVoted(data.postId, data.type, $box);

            // Update states.
            $reactions.each(function () {
                var $this = $(this);

                var type = $.trim($this.attr('data-wyr-reaction'));

                if (typeof reactions[type] !== 'undefined') {
                    $this.find(selectors.value).attr('data-raw-value', reactions[type].count);
                    $this.find(selectors.value).text(reactions[type].formatted_count);
                    $this.find(selectors.bar).css('height', reactions[type].percentage + '%');
                }
            });
         }, 200);

        xhr.done(function (res) {
            if (res.status !== 'success') {
                alert(config.error_msg);
            }
        });
    };

    ctx.getNewState = function($reactions, votedType) {
        var state = {};
        var total = 0;

        $reactions.each(function () {
            var $this = $(this);
            var type = $.trim($this.attr('data-wyr-reaction'));
            var count = parseInt($this.find(selectors.value).attr('data-raw-value'), 10);

            state[type] = {
                'count':            count,
                'formatted_count':  numberFormat(count, config.number_format.decimals, config.number_format.dec_point, config.number_format.thousands_sep),
                'percentage':       ''
            };

            total += count;
        });

        if (typeof state[votedType] !== 'undefined') {
            state[votedType]['count']++;
            state[votedType]['formatted_count'] = numberFormat(state[votedType]['count'], config.number_format.decimals, config.number_format.dec_point, config.number_format.thousands_sep);
            total++;
        }

        // Recalculate percentages.
        for (var type in state) {
            state[type]['percentage'] = Math.round( ( 100 * state[type]['count'] ) / total );
        }

        return state;
    };

    ctx.reactionVoted = function(postId, type, $box) {
        var cookieName   = 'wyr_vote_'+ type +'_' + postId;

        var $reaction = $box.find('.wyr-reaction-' + type);
        var currValue = parseInt($reaction.find(selectors.value).attr('data-raw-value'), 10);
        var newValue = currValue + 1;

        ctx.createCookie(cookieName, newValue, 12);

        // Cookie can't be read immediately so we need to update CSS classes manually.
        $reaction.addClass(classes.voted);
    };

    var numberFormat = function(number, decimals, decPoint, thousandsSep) {
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number;
        var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep;
        var dec = (typeof decPoint === 'undefined') ? '.' : decPoint;
        var s = '';

        var toFixedFix = function (n, prec) {
            if (('' + n).indexOf('e') === -1) {
                return +(Math.round(n + 'e+' + prec) + 'e-' + prec);
            } else {
                var arr = ('' + n).split('e');
                var sig = '';
                if (+arr[1] + prec > 0) {
                    sig = '+';
                }

                return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec);
            }
        };

        // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }

        return s.join(dec);
    };

    // fire
    $(document).ready(function () {
        ctx.reactions();
    });

})(jQuery, wyr);

/********************
 *
 * Load More Button
 *
 ********************/

(function ($, ctx) {

        'use strict';

        // prevent triggering the action more than once at the time
        var loading = false;

        ctx.loadMoreButton = function () {
            $('.wyr-load-more').on('click', function (e) {
                if (loading) {
                    return;
                }

                loading = true;

                e.preventDefault();

                var $button = $(this);
                var $collectionMore = $button.prev('.wyr-links');
                var url = $button.attr('href');

                // load page
                var xhr = $.get(url);

                // on success
                xhr.done(function (data) {
                    loading = false;
                    var collectionSelector = '.wyr-links';

                    var $resCollectionItems = $(data).find(collectionSelector).find('li');
                    var $newButton = $(data).find('.wyr-load-more');
                    $collectionMore.append($resCollectionItems);
                    $button.after($newButton);
                    $button.remove();
                    ctx.loadMoreButton();
                });

            });
        };

        $(document).ready(function () {
            ctx.loadMoreButton();
        });

    })(jQuery, wyr);

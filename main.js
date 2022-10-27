$(function () {
    function log(message) {
        console.log(message);
    }

    var game = {
        keys: 'fjdksla;ghrueiwoqptyvbnmcx,z./',
        delay: 2000,
        status: 'stopped',
        isHitted: false,

        // -----------------------------------------------

        init: function () {
            keyboard.init(30);

            score.init($('#score'));

            health.init(10);

            falling.init($('#falling-key'));
        },
        start: function () {
            if (this.status == 'stopped' || this.status == 'running') {
                ticker.stop();
                ticker.start();
                falling.start();
                this.status = 'running';
                $('#timerStart').css('display', 'none');
            }
        },
        pause: function () {
            if (this.status == 'running') {
                falling.pause();
                keyboard.darken();
                ticker.pause();
                $('#pause').css('display', 'flex');
                this.status = 'pause';
            }
        },
        resume: function () {
            if (this.status == 'pause') {
                falling.resume();
                $('#pause').hide();
                keyboard.highlight(keyboard.targetKey.data('key'));
                ticker.resume();
                this.status = 'running';
            }
        },
        stop: function () {
            if (this.status != 'stopped') {
                if (!health.level) {
                    falling.stop();
                    falling.hiding();
                    keyboard.darken();
                    ticker.stop();
                    $('#loss')
                        .show()
                        .html($('#loss').html() + score.number);
                    this.status = 'stopped';
                }
            }
        },
        update: function () {
            this.isHitted = false;

            var randomKey = getRandomKey(keyboard.activeKeys);

            keyboard.highlight(randomKey);

            $('#random-key').text(randomKey);

            falling.set(randomKey, keyboard.targetKey.offset());

            falling.passiv();
        },
        pass: function () {
            if (!this.isHitted && keyboard.targetKey) {
                health.reduce();

                keyboard.darken();
            }
        },
        hit: function () {
            game.isHitted = true;

            keyboard.darken();

            score.increase();

            falling.stop();

            ticker.stop();

            setTimeout(nextMove, 10);

            game.update();
        },
    };

    var ticker = {
        timer: undefined,
        period: game.delay,
        status: 'stopped',
        startTime: undefined,
        nextRunTime: undefined,
        task: mainLoop,

        // -----------------------------------------------

        start: function () {
            if (this.status == 'stopped') {
                this.timer = setTimeout(this.task, this.period);
                this.startTime = new Date().getTime();
                this.nextRunTime = this.period;
                this.status = 'running';
            }
        },
        stop: function () {
            if (this.status != 'stopped') {
                clearTimeout(this.timer);
                this.timer = undefined;
                this.startTime = undefined;
                this.status = 'stopped';
                this.nextRunTime = undefined;
            }
        },
        pause: function () {
            if (this.status == 'running') {
                clearTimeout(this.timer);
                this.timer = undefined;
                this.status = 'paused';
                this.nextRunTime -= new Date().getTime() - this.startTime;
            }
        },
        resume: function () {
            if (this.status == 'paused') {
                this.timer = setTimeout(this.task, this.nextRunTime);
                this.isRunning = true;
                this.startTime = new Date().getTime();
                this.status = 'running';
            }
        },
    };

    var falling = {
        key: undefined,
        status: 'running',

        // -----------------------------------------------

        init: function (key) {
            this.key = key;
        },
        set: function (randomKey, x) {
            if (this.key) {
                this.key.offset(x);
                this.key.text(randomKey);
            }
        },
        start: function () {
            if (
                this.key ||
                this.status == 'paused' ||
                this.status == 'stopped'
            ) {
                this.key.css(
                    'animation',
                    game.delay +
                        'ms linear 0s infinite normal forwards running movementDown'
                );

                this.status = 'running';
            }
        },
        stop: function () {
            if (this.status != 'stopped') {
                this.key.css('animation', 'none');
                this.status = 'stopped';
            }
        },
        pause: function () {
            if (this.status == 'running') {
                this.key.css('opacity', '0');
                this.key.css('animation-play-state', 'paused');
                this.status = 'paused';
                log(this.status);
            }
        },
        resume: function () {
            if (this.status == 'paused') {
                this.key.css('opacity', '1');
                this.key.css('animation-play-state', 'running');
                this.status = 'running';
            }
        },
        hiding: function () {
            this.key.hide();
        },
        // passiv: function () {
        //     if (game.pass) {
        //         this.key.text(randomKey);
        //     }
        // },
    };

    var health = {
        level: undefined,

        // -----------------------------------------------

        init: function (level) {
            this.level = level;

            $('#health-screen').children().remove();

            for (var i = 0; i < this.level; i++) {
                $('#health-screen').append("<div class='health-level'></div>");
            }
        },
        reduce: function () {
            if (this.level > 0) {
                $('.health-level:not(.health-animation):last').addClass(
                    'health-animation'
                );

                this.level--;
            }
        },
    };

    var score = {
        number: undefined,
        screen: undefined,

        init: function (screen) {
            this.screen = screen;
            this.number = 0;
            this.screen.text(this.number);
        },
        increase: function () {
            if (this.number != undefined) {
                this.number++;
                this.screen.text(this.number);
            }
        },
    };

    var keyboard = {
        activeKeys: undefined,
        targetKey: undefined,

        init: function (numKeysEnabled) {
            $('.button').html('&nbsp;');

            this.activeKeys = game.keys.slice(0, numKeysEnabled);

            $('.button').each(function (index, button) {
                var key = $(button).data('key');

                if (keyboard.activeKeys.toUpperCase().includes(key)) {
                    $(button).text(key);
                }
            });
        },

        highlight: function (key) {
            if (key != undefined) {
                this.targetKey = $(
                    '.button[data-key="' + key.toUpperCase() + '"]'
                );
                if (this.targetKey) {
                    this.targetKey.addClass('colorTargetKey');
                }
            }
        },

        darken: function () {
            if (this.targetKey) {
                this.targetKey.removeClass('colorTargetKey');
            }
        },
        press: function (key) {
            $('.button[data-key="' + key.toUpperCase() + '"]').addClass(
                'highlight'
            );
        },
        release: function (key) {
            $('.button[data-key="' + key.toUpperCase() + '"]').removeClass(
                'highlight'
            );
        },
    };

    function getRandomKey(keys) {
        return keys.charAt(Math.floor(Math.random() * keys.length));
    }

    // ------- отсюда выполняется код при загрузке страницы ---------------

    function countdown(seconds) {
        $('#falling-key').css('animation', 'none');
        $('#falling-key').css('display', 'none');

        var timerShow = $('#timer').html(seconds);

        seconds--;

        if (seconds < 0) {
            $('#falling-key').css('display', 'block');
            mainLoop();
        } else {
            setTimeout(countdown, 1000, [seconds]);
        }
    }

    game.init();

    function mainLoop() {
        game.start();

        game.pass();

        game.update();

        game.stop();
    }

    function nextMove() {
        game.start();
    }

    countdown(3);

    $('body').keydown(function (event) {
        if (game.status == 'running') {
            keyboard.press(event.key);

            if (
                $(
                    '.button[data-key="' + event.key.toUpperCase() + '"]'
                ).text() === falling.key.text().toUpperCase()
            ) {
                game.hit();
            } else if (event.key != 'Escape') {
                health.reduce();
                if (!health.level) {
                    game.stop();
                }
            }

            if (event.key == 'Escape') {
                game.pause();
            }
        }
    });

    $('body').keyup(function (event) {
        keyboard.release(event.key);
    });

    $('#pause').click(function (event) {
        var target = $(event.target);

        if (target.is($('#exit')) || target.is($('#exit p'))) {
            falling.hiding();
            $('#pause').hide();
            $('#game-over')
                .show()
                .html($('#game-over').html() + score.number);
            ticker.stop();
        } else if (
            target.is($('#continuation')) ||
            target.is($('#continuation p'))
        ) {
            game.resume();
        }
    });
});

const async_task_callback = ($task_button, $container, previous_result, callback, error_callback) => {
    $task_button.appendTo($container);
    const today = new Date().getTime();
    $task_button.on('click', function() {
        const time = new Date().getTime() - today + previous_result;
        if (time > 10000) {
            error_callback({ time, $task_button });
            return;
        }
        callback(time);
    });
};

const async_task_promise = ($task_button, $container, previous_result) => new Promise((resolve, reject) => {
    // execute soon after executing new Promise()
    async_task_callback($task_button, $container, previous_result, resolve, reject);
});

const task_button = '<p class="task">click</p>';
const print_result = ($task_button, result, is_error) => {
    const $result = $('<p class="result"></p>').insertAfter($task_button).text(result);
    if (is_error) {
        $result.addClass('error');
    }
    $task_button.remove();
};
const print_result_on_success = ($task_button, result) => print_result($task_button, result, false);
const print_result_on_error = ($task_button, result) => print_result($task_button, result, true);

const $ex1 = $('div.ex1');
$ex1.find('.start').on('click', function() {
    $(this).remove();
    const $task_button = $(task_button);
    async_task_callback($task_button, $ex1, 0, (result) => {
        print_result_on_success($task_button, result);
    }, (error) => {
        print_result_on_error(error.$task_button, error.time);
    });
});

const $ex2 = $('div.ex2');
$ex2.find('.start').on('click', function() {
    $(this).remove();
    const $task_button1 = $(task_button);
    async_task_callback($task_button1, $ex2, 0, (result1) => {
        print_result_on_success($task_button1, result1);
        const $task_button2 = $(task_button);
        async_task_callback($task_button2, $ex2, result1, (result2) => {
            print_result_on_success($task_button2, result2);
            const $task_button3 = $(task_button);
            async_task_callback($task_button3, $ex2, result2, (result3) => {
                print_result_on_success($task_button3, result3);
            }, (error3) => {
                print_result_on_error(error3.$task_button, error3.time);
            });
        }, (error2) => {
            print_result_on_error(error2.$task_button, error2.time);
        });
    }, (error1) => {
        print_result_on_error(error1.$task_button, error1.time);
    });
});

const $ex3 = $('div.ex3');
$ex3.find('.start').on('click', function() {
    $(this).remove();
    const $task_button = $(task_button);
    async_task_promise($task_button, $ex3, 0).then((result) => {
        print_result_on_success($task_button, result);
    }).catch((error) => {
        print_result_on_error(error.$task_button, error.time);
    });
});

const $ex4 = $('div.ex4');
$ex4.find('.start').on('click', function() {
    $(this).remove();
    const $task_button1 = $(task_button);
    const $task_button2 = $(task_button);
    const $task_button3 = $(task_button);
    async_task_promise($task_button1, $ex4, 0).then((result) => {
        print_result_on_success($task_button1, result);
        return async_task_promise($task_button2, $ex4, result);
    }).then((result) => {
        print_result_on_success($task_button2, result);
        return async_task_promise($task_button3, $ex4, result);
    }).then((result) => {
        print_result_on_success($task_button3, result);
    }).catch((error) => {
        print_result_on_error(error.$task_button, error.time);
    });
});

const $ex5 = $('div.ex5');
$ex5.find('.start').on('click', function() {
    $(this).remove();
    const $task_buttons = [...new Array(3)].map(() => $(task_button).on('click', function() {
        $(this).text('Clicked!').off();
    }));
    const promises = $task_buttons.map(($b) => async_task_promise($b, $ex5, 0));
    Promise.all(promises).then((results) => {
        results.forEach((r, i) => {
            print_result_on_success($task_buttons[i], r);
        });
    }).catch((error) => {
        print_result_on_error(error.$task_button, error.time);
    });
});

const $ex6 = $('div.ex6');
$ex6.find('.start').on('click', async function() {
    $(this).remove();
    const $task_button1 = $(task_button);
    const $task_button2 = $(task_button);
    const $task_button3 = $(task_button);
    // await/catch (recommended)
    const result1 = await async_task_promise($task_button1, $ex6, 0).catch((error) => {
        print_result_on_error(error.$task_button, error.time); // resolved with undefined
    }); // result1 == time or undefined
    if (result1) {
        print_result_on_success($task_button1, result1);
    } else {
        return;
    }
    // try/catch
    let result2; // need to use let (´·ω·`)
    try {
        result2 = await async_task_promise($task_button2, $ex6, result1);
    } catch (error) {
        print_result_on_error(error.$task_button, error.time);
    }
    if (result2) {
        print_result_on_success($task_button2, result2);
    } else {
        return;
    }
    // then/catch (same as normal promise except to wait here)
    await async_task_promise($task_button3, $ex6, result2).then((result) => {
        print_result_on_success($task_button3, result);
    }).catch((error) => {
        print_result_on_error(error.$task_button, error.time);
    });
});

const $ex7 = $('div.ex7');
$ex7.find('.start').on('click', async function() {
    $(this).remove();
    const $task_buttons = [...new Array(3)].map(() => $(task_button).on('click', function() {
        $(this).text('Clicked!').off();
    }));
    const promises = $task_buttons.map(($b) => async_task_promise($b, $ex7, 0));
    const results = await Promise.all(promises).catch((error) => {
        print_result_on_error(error.$task_button, error.time);
    });
    if (results) {
        results.forEach((r, i) => {
            print_result_on_success($task_buttons[i], r);
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {

    const select = document.querySelector('select[name="staff"]');

    select.addEventListener('change', function (event) {

        cs50Info(this.value);
    });

    function cs50Info(teacherName) {
        if (teacherName == "")
            return;

        var ajax = XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                $('infodiv').html(ajax.responseText);
            }
        }

        ajax.open('GET', teacherName + '.html', true);
        ajax.send();
    }
});



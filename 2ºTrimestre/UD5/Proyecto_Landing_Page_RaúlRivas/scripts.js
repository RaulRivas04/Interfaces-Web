document.addEventListener('DOMContentLoaded', function () {
    // Funcionalidad de colapso
    var collapseElements = document.querySelectorAll('[data-bs-toggle="collapse"]');
    collapseElements.forEach(function (element) {
        element.addEventListener('click', function () {
            var target = document.querySelector(this.getAttribute('data-bs-target'));
            var allCollapses = document.querySelectorAll('.collapse');
            allCollapses.forEach(function (collapse) {
                if (collapse !== target) {
                    collapse.classList.remove('show');
                }
            });
        });
    });

    // Scroll suave
    var scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Inicialización de tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Botón de volver arriba
    var backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.classList.add('back-to-top', 'btn', 'btn-primary');
    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }

        // Animaciones de entrada al hacer scroll
        var animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach(function (element) {
            if (element.getBoundingClientRect().top < window.innerHeight - 100) {
                element.classList.add('animate');
            }
        });
    });

    // Validación del formulario
    var reservationForm = document.getElementById('reservation-form');
    var formFields = reservationForm.querySelectorAll('.form-control');

    formFields.forEach(function (field) {
        field.addEventListener('input', validateField);
        field.addEventListener('blur', validateField);
    });

    reservationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var isValid = true;

        formFields.forEach(function (field) {
            if (!validateField({ target: field })) {
                isValid = false;
            }
        });

        // Validar horario de reserva
        var dateField = reservationForm.querySelector('input[type="date"]');
        var timeField = reservationForm.querySelector('input[type="time"]');
        var selectedDate = new Date(dateField.value + 'T' + timeField.value);
        var dayOfWeek = selectedDate.getDay();
        var selectedTime = selectedDate.getHours() * 60 + selectedDate.getMinutes();

        var openingHours = {
            1: { start: 9 * 60, end: 19 * 60 }, // Lunes
            2: { start: 9 * 60, end: 19 * 60 }, // Martes
            3: { start: 9 * 60, end: 19 * 60 }, // Miércoles
            4: { start: 9 * 60, end: 19 * 60 }, // Jueves
            5: { start: 9 * 60, end: 19 * 60 }, // Viernes
            6: { start: 9 * 60, end: 17 * 60 }, // Sábado
            0: null // Domingo cerrado
        };

        if (!openingHours[dayOfWeek] || selectedTime < openingHours[dayOfWeek].start || selectedTime > openingHours[dayOfWeek].end) {
            isValid = false;
            var errorElement = timeField.nextElementSibling;
            errorElement.textContent = 'Por favor, selecciona una hora y fecha dentro del horario de atención.';
            timeField.classList.add('is-invalid');
        }

        var existingMessageContainer = reservationForm.querySelector('.alert');
        if (existingMessageContainer) {
            existingMessageContainer.remove();
        }

        var messageContainer = document.createElement('div');
        messageContainer.classList.add('alert', 'mt-3');

        if (isValid) {
            messageContainer.classList.add('alert-success');
            messageContainer.textContent = 'Reserva realizada con éxito.';
            reservationForm.reset();
            setTimeout(function () {
                window.location.href = '#'; // Redirige a la página de inicio
            }, 3000);
        } else {
            messageContainer.classList.add('alert-danger');
            messageContainer.textContent = 'Por favor, completa todos los campos correctamente.';
        }

        reservationForm.appendChild(messageContainer);
        setTimeout(function () {
            messageContainer.remove();
        }, 3000);
    });

    // Función de validación de campos
    function validateField(event) {
        var field = event.target;
        var errorElement = field.nextElementSibling;
        var isValid = true;

        if (field.type === 'email') {
            var emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail|gmx|hotmail|yahoo|outlook)\.(com|es|net|org|edu|gov|co|uk|de|fr|it|ru|jp|cn|br|in|au|ca|mx|ar|cl|pe|ve|uy|bo|py|ec|cr|pa|do|hn|gt|sv|ni|cu|pr)$/;
            if (!emailPattern.test(field.value)) {
                isValid = false;
                errorElement.textContent = 'Por favor, introduce un correo electrónico válido (por ejemplo, gmail, gmx, hotmail, etc. con .com, .es, etc.).';
            } else {
                errorElement.textContent = '';
            }
        
        } else if (field.type === 'text') {
            if (field.value.trim() === '') {
                isValid = false;
                errorElement.textContent = 'Este campo es obligatorio.';
            } else {
                errorElement.textContent = '';
            }
        } else if (field.type === 'tel') {
            var phonePattern = /^[0-9]{9}$/;
            if (!phonePattern.test(field.value)) {
                isValid = false;
                errorElement.textContent = 'Por favor, introduce un número de teléfono válido (9 dígitos).';
            } else {
                errorElement.textContent = '';
            }
        } else if (field.type === 'date') {
            if (field.value.trim() === '') {
                isValid = false;
                errorElement.textContent = 'Por favor, selecciona una fecha.';
            } else {
                errorElement.textContent = '';
            }
        } else if (field.type === 'time') {
            if (field.value.trim() === '') {
                isValid = false;
                errorElement.textContent = 'Por favor, selecciona una hora.';
            } else {
                errorElement.textContent = '';
            }
        } else if (field.type === 'number') {
            if (field.value.trim() === '' || isNaN(field.value)) {
                isValid = false;
                errorElement.textContent = 'Por favor, introduce un número válido.';
            } else {
                errorElement.textContent = '';
            }
        }

        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        return isValid;
    }
});
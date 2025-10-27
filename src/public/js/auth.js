// import axios from 'axios'
import { ApiBreakpoint } from './api_breakpoint.js'

// Login form validation
;(function () {
  const form = document.getElementById('loginForm')
  const btnLogin = document.querySelector('button[btn-submit-login]')

  if (!form) return

  if (btnLogin) {
    btnLogin.addEventListener('click', function (event) {
      event.preventDefault()
      const email = form.querySelector('input#email').value
      const password = form.querySelector('input#password').value

      fetch(ApiBreakpoint.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
        })
        .catch((error) => console.error('Error:', error))
    })
  }
})()

// // Register form validation
// ;(function () {
//   const form = document.getElementById('registerForm')
//   if (!form) return
//   const pass = document.getElementById('regPassword')
//   const pass2 = document.getElementById('regPasswordConfirm')

//   function validateMatch() {
//     if (pass2.value && pass.value !== pass2.value) {
//       pass2.setCustomValidity('Mismatch')
//     } else {
//       pass2.setCustomValidity('')
//     }
//   }

//   pass.addEventListener('input', validateMatch)
//   pass2.addEventListener('input', validateMatch)

//   form.addEventListener('submit', function (e) {
//     validateMatch()
//     if (!form.checkValidity()) {
//       e.preventDefault()
//       e.stopPropagation()
//     }
//     form.classList.add('was-validated')
//   })

//   const btnGoogle = document.getElementById('btnGoogleRegister')
//   if (btnGoogle) {
//     btnGoogle.addEventListener('click', function () {
//       alert('Tính năng đăng ký qua Google sẽ được tích hợp sau.')
//     })
//   }
// })()

// // Forgot password form validation
// ;(function () {
//   const form = document.getElementById('forgotForm')
//   if (!form) return

//   form.addEventListener('submit', function (event) {
//     if (!form.checkValidity()) {
//       event.preventDefault()
//       event.stopPropagation()
//     }
//     form.classList.add('was-validated')
//   })
// })()

// // Reset password form validation
// ;(function () {
//   const form = document.getElementById('resetForm')
//   if (!form) return
//   const pass = document.getElementById('newPassword')
//   const pass2 = document.getElementById('confirmNewPassword')

//   function validateMatch() {
//     if (pass2.value && pass.value !== pass2.value) {
//       pass2.setCustomValidity('Mismatch')
//     } else {
//       pass2.setCustomValidity('')
//     }
//   }

//   pass.addEventListener('input', validateMatch)
//   pass2.addEventListener('input', validateMatch)

//   form.addEventListener('submit', function (e) {
//     validateMatch()
//     if (!form.checkValidity()) {
//       e.preventDefault()
//       e.stopPropagation()
//     }
//     form.classList.add('was-validated')
//   })
// })()

// // Verify email form validation
// ;(function () {
//   const form = document.getElementById('verifyForm')
//   const inputs = [
//     document.getElementById('verifyCode1'),
//     document.getElementById('verifyCode2'),
//     document.getElementById('verifyCode3'),
//     document.getElementById('verifyCode4')
//   ]
//   const btnResend = document.getElementById('btnResendEmail')
//   const resendText = document.getElementById('resendText')
//   const countdownText = document.getElementById('countdownText')
//   const countdownNumber = document.getElementById('countdownNumber')

//   function getFullCode() {
//     return inputs.map((input) => input.value).join('')
//   }

//   function validateCode() {
//     const code = getFullCode()
//     return /^\d{4}$/.test(code)
//   }

//   function moveToNext(currentIndex) {
//     if (currentIndex < inputs.length - 1) {
//       inputs[currentIndex + 1].focus()
//     }
//   }

//   function moveToPrevious(currentIndex) {
//     if (currentIndex > 0) {
//       inputs[currentIndex - 1].focus()
//     }
//   }

//   inputs.forEach((input, index) => {
//     input.addEventListener('input', function (e) {
//       const value = this.value.replace(/\D/g, '')
//       this.value = value

//       if (value && index < inputs.length - 1) {
//         moveToNext(index)
//       }

//       if (form.classList.contains('was-validated')) {
//         if (validateCode()) {
//           inputs.forEach((inp) => {
//             inp.classList.remove('is-invalid')
//             inp.classList.add('is-valid')
//           })
//         } else {
//           inputs.forEach((inp) => inp.classList.remove('is-valid'))
//         }
//       }
//     })

//     input.addEventListener('keydown', function (e) {
//       if (e.key === 'Backspace' && !this.value && index > 0) {
//         moveToPrevious(index)
//       } else if (e.key === 'ArrowLeft' && index > 0) {
//         moveToPrevious(index)
//       } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
//         moveToNext(index)
//       }
//     })

//     input.addEventListener('paste', function (e) {
//       e.preventDefault()
//       const pastedData = (e.clipboardData || window.clipboardData).getData('text')
//       const digits = pastedData.replace(/\D/g, '').slice(0, 4)

//       for (let i = 0; i < digits.length && index + i < inputs.length; i++) {
//         inputs[index + i].value = digits[i]
//       }

//       if (digits.length > 0) {
//         inputs[Math.min(index + digits.length - 1, inputs.length - 1)].focus()
//       }

//       if (form.classList.contains('was-validated') && validateCode()) {
//         inputs.forEach((inp) => {
//           inp.classList.remove('is-invalid')
//           inp.classList.add('is-valid')
//         })
//       }
//     })
//   })

//   form.addEventListener('submit', function (event) {
//     if (!validateCode()) {
//       event.preventDefault()
//       event.stopPropagation()
//       inputs.forEach((inp) => inp.classList.add('is-invalid'))
//     } else {
//       alert('Mã xác thực đúng! Đang xử lý...')
//     }
//     form.classList.add('was-validated')
//   })

//   let countdown = 30
//   let countdownInterval = null

//   function startCountdown() {
//     countdown = 30
//     btnResend.disabled = true
//     resendText.classList.add('d-none')
//     countdownText.classList.remove('d-none')

//     countdownInterval = setInterval(function () {
//       countdown--
//       countdownNumber.textContent = countdown

//       if (countdown <= 0) {
//         clearInterval(countdownInterval)
//         btnResend.disabled = false
//         resendText.classList.remove('d-none')
//         countdownText.classList.add('d-none')
//       }
//     }, 1000)
//   }

//   btnResend.addEventListener('click', function () {
//     if (!btnResend.disabled) {
//       alert('Email xác thực mới đã được gửi!')
//       inputs.forEach((inp) => (inp.value = ''))
//       inputs[0].focus()
//       startCountdown()
//     }
//   })

//   startCountdown()
//   inputs[0].focus()
// })()

window.addEventListener('load', () => {

  const token = sessionStorage.getItem('access_token')
  console.log(token);

  if (token == null || token == undefined) {
    window.location.replace('login.html')
  }



  const onClickSignOut = (token) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://accounts.google.com/o/oauth2/revoke", false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("Đã đăng xuất thành công");
        // Thực hiện các thao tác khác sau khi đăng xuất thành công
      } else {
        console.error("Lỗi khi đăng xuất");
      }
    };
    xhr.send(`token=${token}`);
    sessionStorage.removeItem('access_token');
    location.replace('login.html')
  }



  document.getElementById('send-mail').addEventListener('click', () => {
    location.replace('send.html')
  })
  document.getElementById('receive-mail').addEventListener('click', () => {
    location.replace('receive.html')
  })
  document.getElementById('create-mail').addEventListener('click', () => {
    location.replace('new_mail.html')
  })
  document.getElementById('spam-mail').addEventListener('click', () => {
    location.replace('spam_mail.html')
  })
  document.getElementById('sign-out-btn').addEventListener('click', () => {
    onClickSignOut(token)
  })

})






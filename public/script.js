document.addEventListener("DOMContentLoaded", function () {
  const userForm = document.getElementById("userForm");
  const messageContainer = document.getElementById("message-container");
  const resultMessage = document.getElementById("result-message");
  const loadDataButton = document.getElementById("loadData");
  const userTable = document.getElementById("userTable");

  // submit data to database
  userForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      message: document.getElementById("message").value,
    };

    fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          resultMessage.textContent = data.message;
        } else {
          resultMessage.textContent = "An error occurred" + data.message;
        }
      })
      .catch((error) => {
        resultMessage.textContent = "An error occurred" + error;
      });
  });

  // receive data from database
  loadDataButton.addEventListener("click", function () {
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const tableBody = userTable.querySelector("tbody");
          tableBody.innerHTML = "";

          if (data.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No data available</td></tr>';
          } else {
            data.data.forEach((user) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                              <td>${user.id}</td>
                              <td>${user.name}</td>
                              <td>${user.email}</td>
                              <td>${user.phone || "-"}</td>
                              <td>${user.message || "-"}</td>
                              <td>${new Date(user.created_at).toLocaleString()}</td>
                          `;
              tableBody.appendChild(row);
            });
          }
        } else {
          console.error("An error occurred", data.message);
        }
      })
      .catch((error) => {
        console.error("An error occurred", error);
      });
  });
});

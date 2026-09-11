document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset dropdown options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participants = details.participants || [];
        const participantItems = participants.length
          ? participants
              .map((email) => `
                <li class="participant-item">
                  <span class="participant-email">${email}</span>
                  <button class="delete-participant" data-activity="${name}" data-email="${email}" title="Remove ${email}">
                    <span aria-hidden="true">×</span>
                  </button>
                </li>`)
              .join("")
          : `<li class="participant-item empty">No participants yet</li>`;

        activityCard.innerHTML = `
          <div class="activity-card-header">
            <h4>${name}</h4>
            <span class="availability-badge">${spotsLeft} spots left</span>
          </div>
          <p class="activity-description">${details.description}</p>
          <p class="activity-schedule"><strong>Schedule:</strong> ${details.schedule}</p>
          <div class="participants-section">
            <div class="participants-title">
              <strong>Participants</strong>
              <span class="participant-count">${participants.length}/${details.max_participants}</span>
            </div>
            <ul class="participants-list">
              ${participantItems}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      activitiesList.querySelectorAll(".delete-participant").forEach((button) => {
        button.addEventListener("click", async () => {
          const activity = button.dataset.activity;
          const email = button.dataset.email;

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
              { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok) {
              messageDiv.textContent = result.detail || "Failed to unregister.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              return;
            }

            messageDiv.textContent = result.message;
            messageDiv.className = "success";
            messageDiv.classList.remove("hidden");

            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);

            fetchActivities();
          } catch (error) {
            messageDiv.textContent = "Failed to unregister participant.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            console.error("Error unregistering participant:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

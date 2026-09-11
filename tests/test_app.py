from fastapi.testclient import TestClient

from src.app import app, activities

client = TestClient(app)


def test_delete_signup_unregisters_participant():
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    # Ensure the participant is known before delete
    assert email in activities[activity_name]["participants"]

    response = client.delete(f"/activities/{activity_name}/signup?email={email}")

    assert response.status_code == 200
    assert email not in activities[activity_name]["participants"]
    assert response.json()["message"] == f"Unregistered {email} from {activity_name}"

    # Restore state for subsequent tests
    activities[activity_name]["participants"].append(email)


def test_delete_signup_errors_for_unknown_participant():
    activity_name = "Chess Club"
    email = "missing@mergington.edu"

    response = client.delete(f"/activities/{activity_name}/signup?email={email}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found"

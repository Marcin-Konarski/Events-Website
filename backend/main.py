from flask import request, jsonify, url_for, send_from_directory
from models import Event, User, UploadForm, images
from config import app, db
from auth import auth
from dateutil import parser
from datetime import timezone

app.register_blueprint(auth)


# get
@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    json_events = list(map(lambda x: x.to_json(), events))
    return jsonify({"events": json_events}), 200

@app.route("/event/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    return jsonify(event.to_json()), 200

@app.route('/images/<filename>')
def get_file(filename):
    return send_from_directory(app.config['UPLOADED_IMAGES_DEST'], filename)

# create
"""
Creates a new python class object corresponding to that entry we want to add.
Then we add this to the database session.
Then we commit - actually writes to the database permanently
"""
@app.route("/create_event", methods=["POST"])
def create_event():
    form = UploadForm()
    data = request.form
    event_title = data.get("eventTitle")
    event_description = data.get("eventDescription")
    raw_event_date = data.get("eventDate")
    event_location = data.get("eventLocation")
    event_category = data.get("eventCategory")
    created_by = data.get("createdBy") # Here just get the id of a user who created this event
    # is_finished = data.get("isFinished")
    # if is_finished and isinstance(is_finished, str):
    #     is_finished = is_finished.lower() == 'true'
    # else:
    #     is_finished = False

    try:
        event_date = parser.isoparse(raw_event_date)
        if event_date.tzinfo is None:
            event_date = event_date.replace(tzinfo=timezone.utc) # If no timezone provided, assume UTC
    except ValueError:
        return jsonify({"message": "Bad date format"}), 400

    # Returns error message and error code 400 - 'bad request'
    required = ["eventTitle", "eventDescription", "eventDate", "eventLocation", "eventCategory", "createdBy"] # TODO: Here lated add image path as necessary
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"message": f"Missing required fields: {', '.join(missing)}"}), 400

    image_path = None
    if form.validate_on_submit():
        try:
            filename = images.save(form.image.data)
            image_path = url_for("get_file", filename=filename, _external=True)
        except Exception as e:
            return jsonify({"message": f"Error uploading image: {str(e)}"}), 500

    new_event = Event(event_title = event_title,
                      event_description = event_description,
                      event_date = event_date,
                      event_location = event_location,
                      event_category = event_category,
                    #   is_finished = is_finished,
                      event_image_path = image_path,
                      created_by = created_by
    )

    try:
        db.session.add(new_event)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Event Created"}), 201 # status code 201 stands for created

# Update
@app.route("/update_event/<int:event_id>", methods=["PATCH"])
def update_event(event_id):
    if not event_id:
        return jsonify({"message": "Event ID is required"}), 400

    event = Event.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    form = UploadForm()
    data = request.form
    event.event_title = data.get("eventTitle", event.event_title)
    event.event_description = data.get("eventDescription", event.event_description) # of the fisrName key that was found in the data (given in the json file)
    event.event_date = data.get("eventDate", event.event_date) # .get method return what was found in the "eventTitle" field otherwise keeps event.event_title not changed
    event.event_location = data.get("eventLocation", event.event_location)
    event.event_category = data.get("eventCategory", event.event_category)
    # event.is_finished = data.get("isFinished", str(event.is_finished)).lower() == "true" # Commented for now as I don't understand this line yet
    # is_finished = data.get("isFinished")
    # if is_finished and isinstance(is_finished, str):
    #     is_finished = is_finished.lower() == 'true'
    # else:
    #     is_finished = False

    raw_event_date = data.get("eventDate")
    if raw_event_date:
        try:
            event.event_date = parser.isoparse(raw_event_date)
        except ValueError:
            return jsonify({"message": "Bad date format"}), 400

    if form.validate_on_submit():
        try:
            filename = images.save(form.image.data)
            event.event_image_path = url_for("get_file", filename=filename, _external=True)
        except Exception as e:
            return jsonify({"message": f"Error uploading image: {str(e)}"}), 500

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": f"Error updating event: {str(e)}"}), 500

    return jsonify({"message": "Event updated"}), 200

# Just for updation the participants of an event (endpoint will be used when a user signs up for an event) 
@app.route("/update_participants/<int:event_id>", methods=["PATCH"])
def update_participants(event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"message": "Event not found"}), 404

    operation = request.json.get("operation")
    participant_ids = request.json.get("participant_ids", [])
    if not participant_ids:
        return jsonify({"message": "No participant IDs provided"}), 400

    users = User.query.filter(User.id.in_(participant_ids)).all()

    if operation == "add": # Add users without duplicates
        current_participant_ids = {user.id for user in event.participants}
        for user in users:
            if user.id not in current_participant_ids:
                event.participants.append(user)
    elif operation == "remove": # Remove specified users
        for user in users:
            if user in event.participants:
                event.participants.remove(user)
    else:
        return jsonify({"message": "Invalid operation. Use 'add' or 'remove'"}), 400

    try:
        db.session.commit()
        return jsonify({"message": "Event participants list updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating participants: {str(e)}"}), 500

# Delete
@app.route("/delete_event/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
   event = Event.query.get(event_id)

   if not event:
       return jsonify({"message": "Event not found"}), 404 # 404 status code here for - not found event

   db.session.delete(event) # delete the event
   db.session.commit()

   return jsonify({"message": "Event deleted"}), 200


if __name__ == "__main__":
    with app.app_context(): # If there is no database then create it
        db.create_all()

    app.run(host='127.0.0.1', port=5000, debug=True)

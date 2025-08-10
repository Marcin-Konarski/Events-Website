from config import db, app
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import SubmitField
from flask_uploads import UploadSet, IMAGES, configure_uploads

images = UploadSet('images', IMAGES)
configure_uploads(app, images)

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    event_title = db.Column(db.String(50), unique=True, nullable=False)
    event_description = db.Column(db.String(400), nullable=False)
    event_date = db.Column(db.DateTime(timezone=True), nullable=False)
    event_location = db.Column(db.String(150), nullable=False)
    event_category = db.Column(db.String(50), nullable=False)
    # is_finished = db.Column(db.Boolean, default=False, nullable=False)
    event_image_path  = db.Column(db.String(150), nullable=True) # TODO: make the image path not nullable
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Just an ID of a user who created it
    created_by_user = db.relationship('User', backref='created_events') # This is the User object not just ID
    participants = db.relationship('User', secondary='event_participants', back_populates='events')

    def to_json(self):
        return{
            "id": self.id,
            "eventTitle": self.event_title,
            "eventDescription": self.event_description,
            "eventDate": self.event_date.isoformat(),
            "eventLocation": self.event_location,
            "eventCategory": self.event_category,
            # "isFinished": self.is_finished,
            "imagePath": self.event_image_path,
            "createdBy": self.created_by,
            "participants": [{"id": user.id, "name": f"{user.user_name} {user.user_surname}"} for user in self.participants],
            "participantCount": len(self.participants)
        }


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True) # unique=True
    user_name = db.Column(db.String(20), nullable = False)
    user_surname = db.Column(db.String(40), nullable = False)
    user_email = db.Column(db.String(345), unique = True, nullable = False)
    user_password = db.Column(db.String(72), nullable = False)
    is_confirmed = db.Column(db.Boolean, nullable=False)
    events = db.relationship('Event', secondary='event_participants', back_populates='participants')

    def to_json(self):
        return{
            "id": self.id,
            "userName": self.user_name,
            "userSurname": self.user_surname,
            "userEmail": self.user_email,
            "userPassword": self.user_password,
            "isConfirmed": self.is_confirmed,
        }

    def get_id(self):
        return str(self.id)

    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_active(self):
        return self.is_confirmed

    def __repr__(self):
        return f"<User {self.user_email}>" # Don't know what it does - ones I'll read up on it I'll update this comment

event_participants = db.Table(
    'event_participants',
    db.Column('event_id', db.Integer, db.ForeignKey('events.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)


class NoCsrfForm(FlaskForm):
    class Meta:
        csrf = False  # CSRF disabled for this form (at least for now)

class UploadForm(NoCsrfForm):
    image = FileField(
        validators=[
            FileAllowed(["jpg", "png"], "Only images are allowed"),
            FileRequired("File field should not be empty"),
        ]
    )
    submit = SubmitField("Upload")




# # Example of changing passowrd via command line:


# cd /home/marcin/events/backend
# python3 -c "
# from config import db, app
# from models import User
# from flask_bcrypt import Bcrypt

# bcrypt = Bcrypt(app)

# with app.app_context():
#     user = User.query.filter_by(user_email='marcinkonarski001@gmail.com').first()
#     if user:
#         new_password = 'yournewpassword'  # Change this
#         user.user_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
#         db.session.commit()
#         print('Password updated successfully!')
#     else:
#         print('User not found')
# "


#!/usr/bin/env python
# -*- coding: utf-8 -*-

import random
import string
import httplib2
import json
import requests
from flask import Flask, g, render_template, request, redirect, url_for, flash
from flask import session as login_session
from flask import make_response, flash, jsonify
from sqlalchemy import create_engine, asc
from sqlalchemy.orm import sessionmaker
from database_setup import Base, SpareParts, User
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from oauth2client.client import AccessTokenCredentials

engine = create_engine(
         'postgresql://spareparts:spareparts@localhost/spareparts')
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()

app = Flask(__name__)
app.secret_key = ''.join(random.choice(string.ascii_uppercase + string.digits)
                         for x in xrange(32))


# google client secret
CLIENT_ID = json.loads(
            open('client_secret.json', 'r').read())['web']['client_id']
APPLICATION_NAME = 'FSND-MLAC-P4-UDACITY'


# user login decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' in login_session:
            return f(*args, **kwargs)
        else:
            flash('Please login first')
            return redirect('/login')
    return decorated_function


# Create anti-forgery state token
@app.route('/login')
def showLogin():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return render_template('login.html', STATE=state)

# validating current loggedin user


def check_user():
    email = login_session['email']
    return session.query(User).filter_by(email=email).first()


# retreive admin user details

def check_admin():
    return session.query(User).filter_by(
        email='mluizc@gmail.com').first()

# creating oauth google connection


@app.route('/gconnect', methods=['POST'])
def gconnect():
    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    # Obtain authorization code
    code = request.data

    try:
        # Upgrade the authorization code into a credentials object
        oauth_flow = flow_from_clientsecrets('client_secret.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    response = h.request(url, 'GET')[1]
    str_response = response.decode('utf-8')
    result = json.loads(str_response)

    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        print "Token's client ID does not match app's."
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(
                   json.dumps('Current user is already connected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['provider'] = 'google'
    login_session['username'] = data['name']
    login_session['img'] = data['picture']
    login_session['email'] = data['email']

    print 'User email is: ' + str(login_session['email'])
#    user_id = getUserID(login_session['email'])
#    if user_id:
#        print 'Existing user #' + str(user_id) + ' matches this email.'
#    else:
#        user_id = createUser(login_session)
#        print 'New user id #' + str(user_id) + ' created.'
#        if user_id is None:
#            print 'A new user could not be created.'
#    login_session['user_id'] = user_id
#    print 'Login session is tied to: id #' + str(login_session['user_id'])

    user = getUser(login_session['email'])
    if user:
        user_id = user.id
    else:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    output = ''
    output += '<h2>Welcome, '
    output += login_session['username']
    output += '!</h2>'
    output += '<img src="'
    output += login_session['img']
    output += ' " style = "width: 300px; height: 300px;'
    ' "border-radius: 150px;-webkit-border-radius: 150px;'
    ' "-moz-border-radius: 150px;"> '
    flash("You are now logged in as %s" % login_session['username'])
    return output


# google disconnect function


@app.route('/gdisconnect')
def gdisconnect():
    access_token = login_session.get('access_token')
    if access_token is None:
        print 'Access Token is None'
        response = make_response(json.dumps('Current user not connected.'),
                                 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    print 'In gdisconnect access token is %s', access_token
    print 'User name is: '
    print login_session['username']
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]
    if result['status'] == '200':
        del login_session['provider']
        del login_session['access_token']
        del login_session['gplus_id']
        del login_session['username']
        del login_session['email']
        del login_session['img']
        response = make_response(json.dumps({'state': 'loggedOut'}),
                                 200)
        response.headers['Content-Type'] = 'application/json'
        return response

#        flash("You are now logged out.")
#        return response

    if result['status'] != '200':
        response = make_response(json.dumps(
                    'Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        print 'result is '
        print result
        flash("You are now logged out.")
#        return response
        return result
    else:
        # For whatever reason, the given token was invalid.
        response = make_response(
            json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        return result

    return render_template('base.html', currentPage='showspares',
                           login_session=login_session)

# logout user


@app.route('/logout', methods=['POST'])
def logout():

    # Disconnect based on provider

    if login_session.get('provider') == 'google':
        return gdisconnect()
    else:
        response = make_response(json.dumps({'state': 'notConnected'}),
                                 200)
        response.headers['Content-Type'] = 'application/json'
        return response


#############################
# Add new user into database
############################

def createUser(login_session):
    newUser = User(name=login_session['username'], email=login_session[
                   'email'], provider=login_session['provider'])
    session.add(newUser)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).first()
    return user.id


# def getUserInfo(user_id):
#    user = session.query(User).filter_by(id=user_id).first()
#    return user.id


# def getUserID(user_id):
#    user = session.query(User).filter_by(id=user_id).first()
#    user = session.query(User).filter_by(email=email).one_or_none()
#    return user.id


def getUser(user_email):
    user = session.query(User).filter_by(email=user_email).first()
    return user


def new_state():
    state = ''.join(random.choice(string.ascii_uppercase +
                    string.digits) for x in xrange(32))
    login_session['state'] = state
    return state


def queryAllspares():
    return session.query(SpareParts).all()


# App Routes

# main page

@app.route('/')
@app.route('/spare/')
def showspares():
    spares = queryAllspares()
    state = new_state()
    return render_template('main.html', spares=spares, currentPage='main',
                           state=state, login_session=login_session)


# To add new spare

@app.route('/spare/new/', methods=['GET', 'POST'])
def newspare():
    if request.method == 'POST':

        # check if user is logged in or not

        if 'provider' in login_session and login_session['provider'] != 'null':
            spare = request.form['spare']
            manufacturer = request.form['manufacturer']
            category = request.form['category']
            unit = request.form['Description']
            description = request.form['Description']
            description = description.replace('\n', '<br>')
            user_id = check_user().id

            if spare and manufacturer and category and unit \
                    and description:
                newspare = SpareParts(
                    spare=spare,
                    manufacturer=manufacturer,
                    category=category,
                    unit=unit,
                    description=description,
                    user_id=user_id,
                    )
                session.add(newspare)
                session.commit()
                return redirect(url_for('newspare'))
            else:
                state = new_state()
                return render_template(
                    'newItem.html',
                    currentPage='new',
                    title='Add New spare',
                    errorMsg='All Fields are Required!',
                    state=state,
                    login_session=login_session,
                    )
        else:
            state = new_state()
            spares = queryAllspares()
            return render_template(
                'main.html',
                spares=spares,
                currentPage='main',
                state=state,
                login_session=login_session,
                errorMsg='Please Login first to Add!',
                )
    elif 'provider' in login_session and login_session['provider'] != 'null':
        state = new_state()
        return render_template(
            'newItem.html',
            currentPage='new',
            title='Add New spare',
            state=state,
            login_session=login_session
            )
    else:
        state = new_state()
        spares = queryAllspares()
        return render_template(
            'main.html',
            spares=spares,
            currentPage='main',
            state=state,
            login_session=login_session,
            errorMsg='Please Login first to Add!'
            )


# To show spare of different category

@app.route('/spare/category/<string:category>/')
def sortSpare(category):
    spares = session.query(SpareParts).filter_by(category=category).all()
    state = new_state()
    return render_template(
        'main.html',
        spares=spares,
        currentPage='main',
        error='Sorry! No spare in Database',
        state=state,
        login_session=login_session
        )


# To show spare detail

@app.route('/spare/category/<string:category>/<int:spareId>/')
def Detail(category, spareId):
    spare = session.query(SpareParts).filter_by(id=spareId,
                                                category=category).first()
    state = new_state()
    if spare:
        return render_template(
            'itemDetail.html',
            spare=spare,
            currentPage='detail',
            state=state,
            login_session=login_session)
    else:
        return render_template(
            'main.html',
            currentPage='main',
            error="""No spare Found with this Category and spare Id""",
            state=state,
            login_session=login_session)


# To edit spare detail

@app.route('/spare/category/<string:category>/<int:spareId>/edit/',
           methods=['GET', 'POST'])
def editDetails(category, spareId):
    spare = session.query(SpareParts).filter_by(id=spareId,
                                                category=category).first()
    if request.method == 'POST':

        # check if user is logged in or not

        if 'provider' in login_session and login_session['provider'] \
                != 'null':
            spare_name = request.form['spare']
            manufacturer = request.form['manufacturer']
            unit = request.form['Description']
            description = request.form['Description']
            category = request.form['category']
            user_id = check_user().id
            admin_id = check_admin().id

            # check if spare owner is same as logged in user or admin or not
            if spare.user_id == user_id or user_id == admin_id:
                if spare and manufacturer and unit and description \
                        and category:
                    spare.Name = spare
                    print spare
                    spare.manufacturer = manufacturer
                    spare.unit = unit
                    description = description.replace('\n', '<br>')
                    spare.description = description
                    spare.category = category
                    session.add(spare)
                    session.commit()
                    return redirect(url_for('newspare'))
                else:
                    state = new_state()
                    return render_template(
                        'editItem.html',
                        currentPage='edit',
                        title='Edit spare Details',
                        spare=spare,
                        state=state,
                        login_session=login_session,
                        errorMsg='All Fields are Required!',
                        )
            else:
                state = new_state()
                return render_template(
                    'itemDetail.html',
                    spare=spare,
                    currentPage='detail',
                    state=state,
                    login_session=login_session,
                    errorMsg='Sorry! The Owner can only edit spare Details!')
        else:
            state = new_state()
            return render_template(
                'itemDetail.html',
                spare=spare,
                currentPage='detail',
                state=state,
                login_session=login_session,
                errorMsg='Please Login to Edit the spare Details!',
                )
    elif spare:
        state = new_state()
        if 'provider' in login_session and login_session['provider'] \
                != 'null':
            user_id = check_user().id
            admin_id = check_admin().id
            if user_id == spare.user_id or user_id == admin_id:
                spare.description = spare.description.replace('<br>', '\n')
                return render_template(
                    'editItem.html',
                    currentPage='edit',
                    title='Edit spare Details',
                    spare=spare,
                    state=state,
                    login_session=login_session,
                    )
            else:
                return render_template(
                    'itemDetail.html',
                    spare=spare,
                    currentPage='detail',
                    state=state,
                    login_session=login_session,
                    errorMsg='Sorry! The Owner can only edit spare Details!')
        else:
            return render_template(
                'itemDetail.html',
                spare=spare,
                currentPage='detail',
                state=state,
                login_session=login_session,
                errorMsg='Please Login to Edit the spare Details!',
                )
    else:
        state = new_state()
        return render_template(
            'main.html',
            currentPage='main',
            error="""Error Editing spare!
            No spare Found with this Category and spare Id""",
            state=state,
            login_session=login_session)


# To delete spares

@app.route('/spare/category/<string:category>/<int:spareId>/delete/')
def deletespare(category, spareId):
    spare = session.query(SpareParts).filter_by(category=category,
                                                id=spareId).first()
    state = new_state()
    if spare:

        # check if user is logged in or not

        if 'provider' in login_session and login_session['provider'] \
                != 'null':
            user_id = check_user().id
            admin_id = check_admin().id
            if user_id == spare.user_id or user_id == admin_id:
                session.delete(spare)
                session.commit()
                return redirect(url_for('showspares'))
            else:
                return render_template(
                    'itemDetail.html',
                    spare=spare,
                    currentPage='detail',
                    state=state,
                    login_session=login_session,
                    errorMsg='Sorry! Only the Owner Can delete the spare'
                    )
        else:
            return render_template(
                'itemDetail.html',
                spare=spare,
                currentPage='detail',
                state=state,
                login_session=login_session,
                errorMsg='Please Login to Delete the spare!',
                )
    else:
        return render_template(
                'main.html',
                currentPage='main',
                error="""Error Deleting spare! No spare Found
                with this Category and spare Id""",
                state=state,
                login_session=login_session
                )


# JSON Endpoints

@app.route('/spare/JSON')
def sparesJSON():
    spares = session.query(SpareParts).all()
    return jsonify(spares=[r.serialize for r in spares])


@app.route('/spare/category/<string:category>/JSON')
def spareCategoryJSON(category):
    spares = session.query(SpareParts).filter_by(category=category).all()
    return jsonify(spares=[i.serialize for i in spares])


@app.route('/spare/category/<string:category>/<int:spareId>/JSON')
def spareJSON(category, spareId):
    spare = session.query(SpareParts).filter_by(category=category,
                                                id=spareId).all()
    return jsonify(spare=spare.serialize)


if __name__ == '__main__':
    app.debug = True
    app.run(host='172.26.14.100', port=80)

#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database_setup import Base, SpareParts, User

engine = create_engine('postgresql://spareparts:spareparts@localhost/spareparts')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()

# Create dummy user
User1 = User(name="admin", email="mluizc@gmail.com", provider="image")
session.add(User1)
session.commit()

# Spares data
Spare1 = SpareParts(spare="Small Form-Factor Pluggable Transceive",
                    manufacturer="Fiber Optic",
                    unit="https://bit.ly/2QAkSjF",
                    description="for 10Gb eth LC",
                    category="Optics",
                    user_id=1)

session.add(Spare1)
session.commit()

Spare2 = SpareParts(spare="Outdoor Unit",
                    manufacturer="Nokia",
                    unit="https://bit.ly/2QEsbqB",
                    description="for 1Gb 6GHz ",
                    category="Microwave",
                    user_id=1)

session.add(Spare2)
session.commit()

Spare3 = SpareParts(spare="Handheld Transceiver",
                    manufacturer="Motorola",
                    unit="https://bit.ly/2AQXXXm",
                    description="for 380MHz",
                    category="UHF",
                    user_id=1)

session.add(Spare3)
session.commit()

Spare4 = SpareParts(spare="SwitchRouter",
                    manufacturer="Cisco",
                    unit="https://bit.ly/2UjD68k",
                    description="for 24 points eth",
                    category="IP_Networks",
                    user_id=1)

session.add(Spare4)
session.commit()

Spare5 = SpareParts(spare="LNB",
                    manufacturer="Hughes Networks",
                    unit="https://bit.ly/2BS6tHw",
                    description="Satelital Receiver",
                    category="Satelital_Networks",
                    user_id=1)

session.add(Spare5)
session.commit()


print "added Spares!"
